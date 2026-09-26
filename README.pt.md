<div align="center">

# Port Management System

**Plataforma web para gerir as operações de um porto de contentores, inspirada no Porto de Sines.**

[![CI](https://github.com/igor-coutinho22/Port_Management_System/actions/workflows/ci.yml/badge.svg)](https://github.com/igor-coutinho22/Port_Management_System/actions/workflows/ci.yml)
![.NET 8](https://img.shields.io/badge/.NET-8-512BD4?logo=dotnet&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-3D-000000?logo=threedotjs&logoColor=white)
![Prolog](https://img.shields.io/badge/SWI--Prolog-escalonamento-E61B23)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)

[**Demonstração**](#demonstração) · [**Documentação**](docs/) · [**English**](README.md)

<img src="docs/images/3d-port.png" alt="Vista 3D do porto" width="850">

</div>

> [!NOTE]
> **Projeto académico de equipa.** Desenvolvido por uma equipa de cinco estudantes no âmbito de LAPR5,
> o projeto integrador do 3.º ano da Licenciatura em Engenharia Informática do ISEP (2025/26).
> Esta é uma cópia de portfólio com o histórico completo de commits da equipa.

---

## Índice

- [Sobre o projeto](#sobre-o-projeto)
- [Demonstração](#demonstração)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Como executar](#como-executar)
- [Testes](#testes)
- [Equipa](#equipa)
- [Créditos e licença](#créditos-e-licença)

---

## Sobre o projeto

O sistema apoia o trabalho diário de um porto de contentores: registo de navios, docas e áreas de
armazenamento, planeamento de visitas de navios, escalonamento das operações nas docas, gestão de
incidentes e visualização de todo o porto em 3D. Cada tipo de utilizador (administrador, oficial do
porto, operador logístico e representante de transporte marítimo) acede às áreas do seu perfil.

---

## Demonstração

> **Demonstração:** *o link do Netlify será adicionado aqui após a publicação*
<!-- Substituir a linha acima por: > **Demonstração:** [port-management.netlify.app](https://...) -->

O repositório contém o **sistema completo**, mas o link público corre uma **versão de demonstração**:
o frontend real com um **backend simulado** que corre no browser, para que qualquer pessoa possa
experimentar a aplicação sem servidores, bases de dados ou contas.

| | Sistema completo (este repositório) | Demonstração (Netlify) |
|---|---|---|
| **Frontend** | SPA em React com vista 3D | o mesmo código |
| **Backend** | APIs ASP.NET Core + Node.js | simulado no browser |
| **Dados** | PostgreSQL + MongoDB | dados de exemplo gerados a partir das APIs reais |
| **Autenticação** | Microsoft Entra ID, acesso por perfis | utilizador de demonstração com todos os perfis |
| **Escalonamento** | algoritmos em Prolog | plano simplificado calculado no browser |
| **Guardar alterações** | guardadas nas bases de dados | aceites, mas não guardadas |

<details>
<summary><b>Como funciona o modo de demonstração</b></summary>
<br>

- É ativado automaticamente no Netlify ou, localmente, acrescentando `?demo` ao endereço do frontend
  (ex.: `https://localhost:5179/?demo`).
- Está contido apenas em [`src/Frontend/wwwroot/demo/`](src/Frontend/wwwroot/demo/):
  [`demo-mode.js`](src/Frontend/wwwroot/demo/demo-mode.js) responde aos pedidos à API e
  [`demo-data.js`](src/Frontend/wwwroot/demo/demo-data.js) contém os dados de exemplo.
- Não altera o funcionamento do sistema completo.

</details>

---

## Funcionalidades

| Área | O que faz |
|---|---|
| **Dados mestre** | Navios, tipos de navio, docas, áreas de armazenamento (armazéns e parques de contentores), recursos, pessoal e qualificações, organizações de transporte marítimo e representantes |
| **Visitas de navios** | Notificações de visita com manifestos de tripulação e de carga (validação de contentores ISO 6346), aprovadas ou rejeitadas pelos oficiais do porto |
| **Operações** | Execuções de visitas, planos de operação diários e tarefas complementares |
| **Escalonamento de docas** | Algoritmos em Prolog que ordenam os navios do dia para minimizar os atrasos nas partidas (pesquisa exata, algoritmo genético e heurísticas), comparação com várias gruas e rebalanceamento de docas |
| **Incidentes** | Registo, acompanhamento e resolução de incidentes operacionais |
| **Vista 3D do porto** | Docas, navios, gruas e parques gerados a partir dos dados reais, ciclo dia/noite, pesquisa de objetos, painéis de informação, foco de luz no objeto selecionado e minimapa |
| **Segurança** | Autenticação com Microsoft Entra External ID, acesso por perfis e gestão de utilizadores via Microsoft Graph |
| **Privacidade (RGPD)** | Política de privacidade com versões, aceitação pelos utilizadores e exportação de dados pessoais |
| **Idiomas** | Inglês e português |

---

## Arquitetura

```
                    ┌──────────────────────────────┐
                    │ Frontend (SPA)  :5179        │
                    │ React 18 · Three.js · MSAL   │
                    └──────┬────────────────┬──────┘
                           │ REST + JWT     │ REST + JWT
          ┌────────────────▼─────┐   ┌──────▼──────────────────┐
          │ WebApp  :5001        │◄──┤ Serviço OEM  :6001      │
          │ ASP.NET Core 8       │   │ Node.js · Express       │
          │ EF Core · PostgreSQL │   │ MongoDB · SWI-Prolog    │
          │ (dados mestre)       │   │ (operações, escalonam.) │
          └──────────┬───────────┘   └──────────┬──────────────┘
                     └──────────┬───────────────┘
                   Microsoft Entra External ID + Microsoft Graph (perfis)
```

- **WebApp**: API de dados mestre (navios, docas, áreas de armazenamento, pessoal, notificações de visita).
- **Serviço OEM**: API de operações (execuções, planos, incidentes, tarefas, privacidade) e o escalonador em Prolog.
- Ambos seguem um **desenho em camadas inspirado em DDD**: domínio, aplicação e infraestrutura, com
  agregados, value objects, DTOs, mappers e repositórios.
- A documentação de arquitetura (modelo C4, modelo de domínio, diagramas de sequência, glossário) está em [`docs/`](docs/).

---

## Tecnologias

| Camada | Tecnologias |
|---|---|
| **API de dados mestre** | C#, ASP.NET Core 8, Entity Framework Core, PostgreSQL, Swagger |
| **API de operações** | Node.js, Express 5, Mongoose, MongoDB, SWI-Prolog |
| **Frontend** | React 18, Three.js, MSAL.js, CSS |
| **Identidade** | Microsoft Entra External ID (CIAM), Microsoft Graph |
| **Testes** | xUnit, Moq, FluentAssertions, Jest, Supertest, mongodb-memory-server, Cypress |
| **CI** | GitHub Actions |

<details>
<summary><b>Estrutura do projeto</b></summary>
<br>

```
├── src/
│   ├── WebApp/        # API ASP.NET Core (dados mestre)
│   ├── Oem_Node/      # API Node.js (operações, escalonamento, incidentes, privacidade)
│   └── Frontend/      # SPA, visualização 3D e testes E2E com Cypress
├── tests/WebApp/      # Testes unitários, de integração e de sistema da WebApp
└── docs/              # Diagramas C4, modelo de domínio, user stories, relatórios
```

</details>

---

## Como executar

### Pré-requisitos

- .NET 8 SDK
- Node.js 22 ou superior
- PostgreSQL e MongoDB
- [SWI-Prolog](https://www.swi-prolog.org/), com `swipl` no `PATH` (para o escalonamento de docas)

### 1. API de dados mestre (WebApp)

```bash
cd src/WebApp
dotnet user-secrets set "AzureAdCiam:BackendApp:ClientSecret" "<segredo>"
dotnet run
```

Corre em `https://localhost:5001` (Swagger em `/swagger`). A base de dados é migrada e preenchida
com dados de exemplo no arranque. A connection string está no `appsettings.json`.

### 2. API de operações (serviço OEM)

```bash
cd src/Oem_Node
cp .env.example .env    # depois preencher os valores
npm ci
npm run dev
```

Corre em `http://localhost:6001`.

### 3. Frontend

```bash
cd src/Frontend
npm ci
npm run certs           # cria um certificado TLS local para localhost
npm start
```

Abrir `https://localhost:5179`. Os endereços dos backends estão definidos em
[`src/Frontend/wwwroot/js/config.js`](src/Frontend/wwwroot/js/config.js).

> [!TIP]
> Depois de instalar as dependências, `npm run dev` na raiz do repositório arranca os três serviços de uma vez.

<details>
<summary><b>Autenticação e utilização de um tenant Microsoft Entra próprio</b></summary>
<br>

A autenticação requer o tenant Entra External ID do projeto e um utilizador com um perfil atribuído.
Para usar um tenant próprio, atualize:

- `src/Frontend/wwwroot/auth/msalConfig.js`
- a secção `AzureAdCiam` de `src/WebApp/appsettings.json`
- as variáveis do Azure em `src/Oem_Node/.env`

</details>

---

## Testes

| Conjunto | Comando | Testes |
|---|---|---|
| **WebApp** (unitários, integração, sistema) | `dotnet test` | 315 |
| **Serviço OEM** (unitários, integração, funcionais, sistema, Prolog) | `cd src/Oem_Node && npm test` | 75 |
| **End-to-end** (Cypress, com os serviços a correr) | `cd src/Frontend && npx cypress run` | 28 |

Os testes da WebApp e do serviço OEM correm automaticamente no GitHub Actions a cada push.

---

## Equipa

| Nome | N.º de estudante |
|---|---|
| Rafael Barbosa | 1230544 |
| Igor Coutinho | 1230543 |
| João Soares | 1211064 |
| Miguel Pais | 1230851 |
| Sofia Costa | 1231006 |

**Instituto Superior de Engenharia do Porto (ISEP)** · Engenharia Informática · LAPR5 · 2025/26 · Grupo 3DD-02

---

## Créditos e licença

- Os modelos 3D de terceiros estão creditados em [`CREDITS.md`](src/Frontend/wwwroot/models/CREDITS.md).
- Este repositório é partilhado para fins de portfólio e educativos. Não é concedida licença para
  reutilização do código-fonte.
