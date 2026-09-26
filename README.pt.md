# Port Management System

[English](README.md) | **Português**

[![CI](https://github.com/igor-coutinho22/Port_Management_System/actions/workflows/ci.yml/badge.svg)](https://github.com/igor-coutinho22/Port_Management_System/actions/workflows/ci.yml)

Plataforma web para gerir as operações de um porto de contentores (inspirado no Porto de Sines):
dados mestre, planeamento de visitas de navios, escalonamento de docas, incidentes e uma
visualização 3D interativa do porto.

> **Cópia de portfólio.** Este projeto foi desenvolvido por uma equipa de cinco estudantes no âmbito
> de LAPR5, o projeto integrador do 5.º semestre da Licenciatura em Engenharia Informática do ISEP
> (2025/26). O histórico completo de commits da equipa foi preservado. As credenciais foram removidas
> do histórico, pelo que os serviços na cloud (Microsoft Entra ID, bases de dados) têm de ser
> configurados com valores próprios.

![Visualização 3D do porto](docs/images/3d-port.png)

## Demonstração online

**Demonstração:** *o link do Netlify será adicionado aqui após a publicação*
<!-- Substituir a linha acima por: **Demonstração:** [port-management.netlify.app](https://...) -->

Este repositório contém o **sistema completo**: duas APIs de backend (ASP.NET Core e Node.js), as
bases de dados PostgreSQL e MongoDB, o motor de escalonamento em Prolog e a autenticação com
Microsoft Entra ID. Disponibilizar tudo isto publicamente exigiria servidores, bases de dados e
contas no tenant Entra do projeto, por isso o link público corre uma **versão de demonstração**: o
frontend real com um **backend simulado** que corre no browser e responde aos pedidos à API com
dados de exemplo.

| | Sistema completo (este repositório) | Demonstração (Netlify) |
|---|---|---|
| Frontend (páginas, vista 3D) | SPA em React | o mesmo código |
| APIs de backend | serviços ASP.NET Core + Node.js | simuladas no browser ([`demo-mode.js`](src/Frontend/wwwroot/demo/demo-mode.js)) |
| Dados | PostgreSQL + MongoDB | dados de exemplo gerados a partir das APIs reais ([`demo-data.js`](src/Frontend/wwwroot/demo/demo-data.js)) |
| Autenticação | Microsoft Entra External ID, acesso por perfis | utilizador de demonstração automático, com todos os perfis |
| Escalonamento de docas | algoritmos em Prolog (pesquisa exata, heurísticas, algoritmo genético) | plano simplificado calculado no browser |
| Criar / editar dados | guardado nas bases de dados | aceite, mas não guardado |

O modo de demonstração é ativado automaticamente no Netlify e pode ser usado localmente
acrescentando `?demo` ao endereço do frontend (ex.: `https://localhost:5179/?demo`). Está contido
apenas em [`src/Frontend/wwwroot/demo/`](src/Frontend/wwwroot/demo/) e não altera o funcionamento
do sistema completo.

## Funcionalidades

- **Dados mestre**: navios, tipos de navio, docas, áreas de armazenamento (armazéns e parques de
  contentores), recursos, pessoal e qualificações, organizações de transporte marítimo e os seus
  representantes
- **Notificações de Visita de Navios**: submetidas pelos representantes, com manifestos de tripulação
  e de carga (validação de contentores ISO 6346), aprovadas ou rejeitadas pelos oficiais do porto
- **Operações**: execuções de visitas, planos de operação e tarefas complementares
- **Escalonamento de docas** em Prolog: ordena os navios de um dia para minimizar o atraso total nas
  partidas, usando pesquisa exata (até 6 navios), um algoritmo genético iniciado com as soluções das
  heurísticas (até 12) ou a heurística ATC (dias maiores); inclui comparação com várias gruas e
  rebalanceamento de docas
- **Incidentes**: registo, acompanhamento e resolução de incidentes operacionais
- **Visualização 3D do porto** com Three.js: docas, navios, gruas e parques de contentores gerados a
  partir dos dados reais, iluminação dia/noite, pesquisa de objetos com painéis de informação e minimapa
- **Segurança e privacidade**: autenticação com Microsoft Entra External ID, acesso por perfis
  (Admin, Officer, Operator, Representative), gestão de utilizadores via Microsoft Graph, aceitação
  da política de privacidade (RGPD) e exportação de dados pessoais
- **Internacionalização**: inglês e português

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

Ambos os backends seguem um desenho em camadas inspirado em DDD (domínio, aplicação,
infraestrutura), com agregados, value objects, DTOs, mappers e repositórios. A documentação de
arquitetura (modelo C4, modelo de domínio, diagramas de sequência e glossário) está em [`docs/`](docs/).

## Tecnologias

| Área | Tecnologias |
|---|---|
| API de dados mestre | C#, ASP.NET Core 8, Entity Framework Core, PostgreSQL, Swagger |
| API de operações | Node.js, Express 5, Mongoose / MongoDB, SWI-Prolog |
| Frontend | React 18, Three.js, MSAL.js, CSS |
| Identidade | Microsoft Entra External ID (CIAM), Microsoft Graph |
| Testes | xUnit, Moq, FluentAssertions, Jest, Supertest, mongodb-memory-server, Cypress |
| CI | GitHub Actions |

## Estrutura do projeto

```
├── src/
│   ├── WebApp/        # API ASP.NET Core (dados mestre)
│   ├── Oem_Node/      # API Node.js (operações, escalonamento, incidentes, privacidade)
│   └── Frontend/      # SPA, visualização 3D e testes E2E com Cypress
├── tests/WebApp/      # Testes unitários, de integração e de sistema da WebApp
└── docs/              # Diagramas C4, modelo de domínio, user stories, relatórios
```

## Executar localmente

**Pré-requisitos:** .NET 8 SDK, Node.js 22+, PostgreSQL, MongoDB e, para o escalonamento de docas,
[SWI-Prolog](https://www.swi-prolog.org/) (`swipl` no `PATH`).

1. **WebApp** (https://localhost:5001, Swagger em `/swagger`)
   ```bash
   cd src/WebApp
   # ajustar ConnectionStrings:DefaultConnection no appsettings.json, se necessário
   dotnet user-secrets set "AzureAdCiam:BackendApp:ClientSecret" "<segredo>"
   dotnet run
   ```
   As migrações são aplicadas e os dados de exemplo são criados no arranque.

2. **Serviço OEM** (http://localhost:6001)
   ```bash
   cd src/Oem_Node
   cp .env.example .env   # preencher os valores
   npm ci
   npm run dev
   ```

3. **Frontend** (https://localhost:5179)
   ```bash
   cd src/Frontend
   npm ci
   npm run certs          # cria uma CA local e um certificado TLS para localhost
   npm start
   ```
   Os endereços dos serviços são configurados em [`src/Frontend/wwwroot/js/config.js`](src/Frontend/wwwroot/js/config.js).

Depois de instalar as dependências, `npm run dev` na raiz do repositório arranca os três serviços.

A autenticação requer o tenant Entra External ID do projeto e um utilizador com um perfil atribuído.
Para usar um tenant próprio, atualize `src/Frontend/wwwroot/auth/msalConfig.js`, a secção
`AzureAdCiam` do `appsettings.json` e as variáveis do Azure no `.env`.

## Testes

| Conjunto | Comando | Testes |
|---|---|---|
| WebApp (unitários, integração, sistema) | `dotnet test` | 315 |
| Serviço OEM (unitários, integração, funcionais, sistema, Prolog) | `cd src/Oem_Node && npm test` | 75 |
| End-to-end (Cypress, com os serviços a correr) | `cd src/Frontend && npx cypress run` | 28 |

Os testes da WebApp e do serviço OEM correm no GitHub Actions a cada push.

## Equipa

| Nome | N.º de estudante |
|---|---|
| Rafael Barbosa | 1230544 |
| Igor Coutinho | 1230543 |
| João Soares | 1211064 |
| Miguel Pais | 1230851 |
| Sofia Costa | 1231006 |

Instituto Superior de Engenharia do Porto (ISEP), Departamento de Engenharia Informática,
LAPR5, 2025/26, grupo 3DD-02.

## Créditos e licença

Os modelos 3D de terceiros estão creditados em
[`src/Frontend/wwwroot/models/CREDITS.md`](src/Frontend/wwwroot/models/CREDITS.md).

Este repositório é partilhado para fins de portfólio e educativos. Não é concedida licença para
reutilização do código-fonte.
