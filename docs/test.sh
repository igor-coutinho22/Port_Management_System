#!/bin/bash
set -euo pipefail

# CONFIGURAÇÃO BASE
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export DOTNET_CLI_TELEMETRY_OPTOUT=1

REPO_URL="https://***REMOVED***@github.com/Departamento-de-Engenharia-Informatica/LEI-SEM5-PI-2025-26-3DD-02.git"
BASE_DIR="/opt/asist"
APP_DIR="$BASE_DIR/app"
LOG_DIR="$BASE_DIR/deploy/logs"
TEST_DIR="$APP_DIR"

# PORTAS E SERVIÇOS
FRONTEND_PORT=5179
WEBAPP_PORT=5001
OEM_PORT=6001

FRONTEND_DIR="$APP_DIR/src/Frontend"
WEBAPP_PROJECT="$APP_DIR/src/WebApp/WebApp.csproj"
OEM_PROJECT="$APP_DIR/src/Oem/Oem.csproj"

# LOGS
TIMESTAMP="$(date +%F_%H-%M-%S)"
LOG_FILE="$LOG_DIR/deploy_$TIMESTAMP.log"
TEST_LOG="$LOG_DIR/tests_stdout.log"
FRONTEND_LOG="$LOG_DIR/frontend_stdout.log"
WEBAPP_LOG="$LOG_DIR/webapp_stdout.log"
OEM_LOG="$LOG_DIR/oem_stdout.log"

STATUS=0
VM_IP=$(hostname -I | awk '{print $1}')

mkdir -p "$APP_DIR" "$LOG_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "===== DEPLOY INICIADO $TIMESTAMP ====="

# [1/4] Verificar pré-requisitos
echo "[1/4] Verificar pré-requisitos..."

ensure_installed() {
    # usage: ensure_installed <binary> <apt-package>
    if ! command -v "$1" &>/dev/null; then
        if [ -z "${APT_UPDATED:-}" ]; then
            apt update -y
            APT_UPDATED=true
        fi
        apt install -y "$2"
    fi
}

ensure_installed git git
ensure_installed curl curl
ensure_installed dotnet dotnet-sdk-8.0
ensure_installed node nodejs
ensure_installed npm npm
ensure_installed ss net-tools || true  # ss normally exists

# pequenas utilities
port_owner_pid() {
    # prints PID of process listening on given TCP port (if any)
    local port="$1"
    # prefer ss
    ss -ltnp 2>/dev/null | awk -v P=":$port" '$4 ~ P {
        for(i=1;i<=NF;i++) if ($i ~ /pid=/) { gsub("pid=","",$i); sub(",","",$i); print $i; exit }
    }'
}

free_port() {
    local port="$1"
    local pids
    pids="$(port_owner_pid "$port" || true)"
    if [ -n "$pids" ]; then
        echo "--> Porta $port está a ser usada por PID(s): $pids — a terminar"
        for pid in $pids; do
            kill -TERM "$pid" 2>/dev/null || true
        done
        sleep 1
        for pid in $pids; do
            if kill -0 "$pid" 2>/dev/null; then
                echo "--> PID $pid não terminou, a forçar"
                kill -KILL "$pid" 2>/dev/null || true
            fi
        done
        sleep 1
    fi
}

wait_for_port_listen() {
    local port="$1"
    local timeout="${2:-30}"
    local i
    for i in $(seq 1 "$timeout"); do
        if port_owner_pid "$port" >/dev/null 2>&1 && [ -n "$(port_owner_pid "$port")" ]; then
            return 0
        fi
        sleep 1
    done
    return 1
}

# [2/4] Código
echo "[2/4] Atualizar código fonte..."
if [ -d "$APP_DIR/.git" ]; then
    cd "$APP_DIR" || exit 1
    git reset --hard
    git pull --rebase
else
    rm -rf "$APP_DIR"
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR" || exit 1
fi

# [2.5/4] Testes
echo "[2.5/4] Executar Testes Unitários..."
if dotnet test "$TEST_DIR" --nologo >"$TEST_LOG" 2>&1; then
    echo "--> Testes Unitários: SUCESSO."
    tail -n 3 "$TEST_LOG" || true
else
    echo "--> ERRO: Testes Unitários FALHARAM. Deploy cancelado."
    grep -A 5 "Failed" "$TEST_LOG" | head -n 20 || tail -n 20 "$TEST_LOG"
    exit 1
fi

# [3/4] Reiniciar serviços
echo "[3/4] Reiniciar serviços..."

# tenta terminar processos conhecidos e liberta portas antes de arrancar
pkill -f "dotnet run" || true
pkill -f "node" || true
pkill -f "http-server" || true
sleep 1

free_port "$FRONTEND_PORT"
free_port "$WEBAPP_PORT"
free_port "$OEM_PORT"

# iniciar WebApp
echo "--> A iniciar WebApp (porta $WEBAPP_PORT)..."
dotnet run --project "$WEBAPP_PROJECT" \
    --urls "http://0.0.0.0:$WEBAPP_PORT" \
    >"$WEBAPP_LOG" 2>&1 &
WEBAPP_PID=$!

# iniciar Oem
echo "--> A iniciar Oem (porta $OEM_PORT)..."
dotnet run --project "$OEM_PROJECT" \
    --urls "http://0.0.0.0:$OEM_PORT" \
    >"$OEM_LOG" 2>&1 &
OEM_PID=$!

# iniciar Frontend
echo "--> A iniciar Frontend (porta $FRONTEND_PORT)..."
cd "$FRONTEND_DIR"
npm install --no-audit --no-fund
# user changed to "npm start -- --port PORT"
npm start -- --port "$FRONTEND_PORT" \
    >"$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!
cd "$APP_DIR"

# aguardar que os serviços comecem a ouvir nas portas
echo "--> A aguardar WebApp na porta $WEBAPP_PORT..."
if wait_for_port_listen "$WEBAPP_PORT" 30; then
    echo "--> WebApp pronto"
else
    echo "--> WebApp não abriu porta $WEBAPP_PORT a tempo"
    echo "--> Últimas linhas do log ($WEBAPP_LOG):"
    tail -n 40 "$WEBAPP_LOG" || true
    STATUS=1
fi

echo "--> A aguardar Oem na porta $OEM_PORT..."
if wait_for_port_listen "$OEM_PORT" 30; then
    echo "--> Oem pronto"
else
    echo "--> Oem não abriu porta $OEM_PORT a tempo"
    echo "--> Últimas linhas do log ($OEM_LOG):"
    tail -n 40 "$OEM_LOG" || true
    STATUS=1
fi

echo "--> A aguardar Frontend na porta $FRONTEND_PORT..."
if wait_for_port_listen "$FRONTEND_PORT" 30; then
    echo "--> Frontend pronto"
else
    echo "--> Frontend não abriu porta $FRONTEND_PORT a tempo"
    echo "--> Últimas linhas do log ($FRONTEND_LOG):"
    tail -n 40 "$FRONTEND_LOG" || true
    STATUS=1
fi

# [4/4] Health Checks
health_check() {
    local NAME="$1"
    local LOCAL_URL="$2"
    local PUBLIC_URL="$3"
    local LOG_FILE="$4"
    local TIMEOUT_TRIES="${5:-10}"
    local ACCEPT_ANY="${6:-false}"

    echo "==> Health Check: $NAME"
    local i
    for i in $(seq 1 "$TIMEOUT_TRIES"); do
        if [ "$ACCEPT_ANY" = "true" ]; then
            # connect and accept any response code as success (use --insecure for https)
            if curl -sS --max-time 5 --insecure "$PUBLIC_URL" >/dev/null 2>&1; then
                echo "--> [$NAME] OK (accepted any response) ($PUBLIC_URL)"
                return 0
            fi
        else
            if curl -s -f --max-time 5 --insecure "$PUBLIC_URL" >/dev/null 2>&1; then
                echo "--> [$NAME] OK ($PUBLIC_URL)"
                return 0
            fi
        fi
        echo "--> [$NAME] Tentativa $i falhou..."
        sleep 2
    done

    # tentativa local (sem -f se accept_any)
    if [ "$ACCEPT_ANY" = "true" ]; then
        if curl -sS --max-time 5 --insecure "$LOCAL_URL" >/dev/null 2>&1; then
            echo "--> [$NAME] OK (local responde, aceita qualquer código)"
            return 0
        fi
    else
        if curl -s -f --max-time 5 --insecure "$LOCAL_URL" >/dev/null 2>&1; then
            echo "--> [$NAME] OK (local responde com 2xx)"
            return 0
        fi
    fi

    echo "--> [$NAME] FAILED (public check + local check falharam)"
    echo "--> Últimas linhas do log ($LOG_FILE):"
    tail -n 40 "$LOG_FILE" || true
    return 1
}

echo "[4/4] Executar Health Checks..."

# Frontend: logs show http-server serves HTTPS (127.0.0.1:5179) — try https public and local
health_check \
  "Frontend" \
  "https://127.0.0.1:$FRONTEND_PORT" \
  "https://$VM_IP:$FRONTEND_PORT" \
  "$FRONTEND_LOG" 10 false || STATUS=1

# WebApp: API/web, expect 2xx on / or other default — use http (accept normal 2xx)
health_check \
  "WebApp" \
  "http://127.0.0.1:$WEBAPP_PORT" \
  "http://$VM_IP:$WEBAPP_PORT" \
  "$WEBAPP_LOG" 10 false || STATUS=1

# Oem: API-only app that may return 404 on / — accept any response if connection established
# check public URL first, then local; accept_any=true ensures a connection (any HTTP status) is considered OK
health_check \
  "Oem" \
  "http://127.0.0.1:$OEM_PORT" \
  "http://$VM_IP:$OEM_PORT" \
  "$OEM_LOG" 30 true || STATUS=1

# final
if [ "$STATUS" -eq 0 ]; then
    echo "===> TODOS os serviços passaram o Health Check"
else
    echo "===> ERRO: Um ou mais serviços falharam"
fi

echo "===== DEPLOY TERMINADO $(date) - STATUS=$STATUS ====="
echo "--> Processos ativos:"
ps -fC dotnet || true
ps -fC node || true

exit "$STATUS"
