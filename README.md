# Port Management System

[![CI](https://github.com/igor-coutinho22/Port_Management_System/actions/workflows/ci.yml/badge.svg)](https://github.com/igor-coutinho22/Port_Management_System/actions/workflows/ci.yml)

A web platform to manage the operations of a container port (modelled on the Port of Sines):
master data, vessel visit planning, dock scheduling, incidents and an interactive 3D view of the port.

> **Portfolio copy.** This project was developed by a team of five students for LAPR5, the integrative
> project of the 5th semester of the BSc in Informatics Engineering at ISEP (2025/26). The team's full
> commit history is preserved. Credentials were removed from the history, so cloud services
> (Microsoft Entra ID, databases) must be configured with your own values.

![3D port visualization](docs/images/3d-port.png)

## Live demo

**[Open the live demo](#live-demo)** *(Netlify link added after deployment)*

The live demo lets anyone explore the application without installing anything or signing in.
It is a **demo build of the frontend only**:

- it is hosted on Netlify and opens with a demo user that has every role (Admin, Officer,
  Operator, Representative), so all areas of the app can be visited;
- API requests are answered in the browser with a built-in set of sample data, generated from the
  real APIs ([`src/Frontend/wwwroot/demo/`](src/Frontend/wwwroot/demo/));
- forms can be submitted, but changes are not saved.

The **complete system is in this repository**: both backend APIs, the databases, the Prolog
scheduling, Microsoft Entra ID authentication and the automated tests, as described below.
The demo mode can also be used locally by opening the frontend with `?demo` in the URL
(e.g. `https://localhost:5179/?demo`).

## Features

- **Master data**: vessels, vessel types, docks, storage areas (warehouses and container yards),
  resources, staff and qualifications, shipping organizations and their representatives
- **Vessel Visit Notifications**: submitted by shipping representatives with crew and cargo manifests
  (ISO 6346 container validation), approved or rejected by port officers
- **Operations**: vessel visit executions, operation plans and complementary tasks
- **Dock scheduling** in Prolog: an exact search for small days, constructive heuristics (e.g. ATC)
  and a genetic algorithm seeded with the heuristic solutions, minimising the total departure delay;
  plus multi-crane comparison and dock rebalancing
- **Incidents**: reporting, tracking and resolution of operational incidents
- **3D port visualization** with Three.js: docks, vessels, cranes and container yards built from live
  data, day/night lighting, object search and information panels, minimap
- **Security and privacy**: sign-in with Microsoft Entra External ID, role-based access
  (Admin, Officer, Operator, Representative), user administration via Microsoft Graph,
  GDPR privacy policy acceptance and personal data export
- **Internationalization**: English and Portuguese

## Architecture

```
                    ┌──────────────────────────────┐
                    │ Frontend (SPA)  :5179        │
                    │ React 18 · Three.js · MSAL   │
                    └──────┬────────────────┬──────┘
                           │ REST + JWT     │ REST + JWT
          ┌────────────────▼─────┐   ┌──────▼──────────────────┐
          │ WebApp  :5001        │◄──┤ OEM service  :6001      │
          │ ASP.NET Core 8       │   │ Node.js · Express       │
          │ EF Core · PostgreSQL │   │ MongoDB · SWI-Prolog    │
          │ (master data)        │   │ (operations, scheduling)│
          └──────────┬───────────┘   └──────────┬──────────────┘
                     └──────────┬───────────────┘
                   Microsoft Entra External ID + Microsoft Graph (roles)
```

Both backends follow a layered, DDD-inspired design (domain, application, infrastructure) with
aggregates, value objects, DTOs, mappers and repositories. Architecture documentation (C4 model,
domain model, sequence diagrams and glossary) is available in [`docs/`](docs/).

## Tech stack

| Area | Technologies |
|---|---|
| Master data API | C#, ASP.NET Core 8, Entity Framework Core, PostgreSQL, Swagger |
| Operations API | Node.js, Express 5, Mongoose / MongoDB, SWI-Prolog |
| Frontend | React 18, Three.js, MSAL.js, CSS |
| Identity | Microsoft Entra External ID (CIAM), Microsoft Graph |
| Testing | xUnit, Moq, FluentAssertions, Jest, Supertest, mongodb-memory-server, Cypress |
| CI | GitHub Actions |

## Project structure

```
├── src/
│   ├── WebApp/        # ASP.NET Core API (master data)
│   ├── Oem_Node/      # Node.js API (operations, scheduling, incidents, privacy)
│   └── Frontend/      # SPA, 3D visualization and Cypress E2E tests
├── tests/WebApp/      # Unit, integration and system tests for the WebApp
└── docs/              # C4 diagrams, domain model, user stories, reports
```

## Running locally

**Prerequisites:** .NET 8 SDK, Node.js 22+, PostgreSQL, MongoDB and, for dock scheduling,
[SWI-Prolog](https://www.swi-prolog.org/) (`swipl` on the `PATH`).

1. **WebApp** (https://localhost:5001, Swagger at `/swagger`)
   ```bash
   cd src/WebApp
   # adjust ConnectionStrings:DefaultConnection in appsettings.json if needed
   dotnet user-secrets set "AzureAdCiam:BackendApp:ClientSecret" "<secret>"
   dotnet run
   ```
   Migrations are applied and sample data is seeded on startup.

2. **OEM service** (http://localhost:6001)
   ```bash
   cd src/Oem_Node
   cp .env.example .env   # fill in the values
   npm ci
   npm run dev
   ```

3. **Frontend** (https://localhost:5179)
   ```bash
   cd src/Frontend
   npm ci
   npm run certs          # creates a local CA and a TLS certificate for localhost
   npm start
   ```
   Service URLs are configured in [`src/Frontend/wwwroot/js/config.js`](src/Frontend/wwwroot/js/config.js).

After installing the dependencies, `npm run dev` in the repository root starts all three services.

Signing in requires the project's Entra External ID tenant and a user with an assigned role.
To use your own tenant, update `src/Frontend/wwwroot/auth/msalConfig.js`, the `AzureAdCiam`
section of `appsettings.json` and the Azure variables in `.env`.

## Testing

| Suite | Command | Tests |
|---|---|---|
| WebApp (unit, integration, system) | `dotnet test` | 315 |
| OEM service (unit, integration, functional, system, Prolog) | `cd src/Oem_Node && npm test` | 75 |
| End-to-end (Cypress, with the services running) | `cd src/Frontend && npx cypress run` | 28 |

The WebApp and OEM suites run in GitHub Actions on every push.

## My contributions

I was part of the five-person team throughout the project. My main contributions:

- **Docks (US 2.2.3)**: the complete feature in the WebApp: domain model, EF Core configuration,
  repository, service, DTOs/mappers and REST controller
- **Vessel Visit Notifications**: crew and cargo manifest mappers, repository changes, seed data and
  domain, application and integration tests
- **3D port visualization (US 4.2.x)**: lighting (day/night, street lamps), object search with
  suggestions, object information panels, camera controls and general scene improvements
- **Client analysis (US 2.3.x)**: characterization of the port authority (APS), SWOT analysis and
  strategic proposals for sustainability and digital transformation
- **Portfolio preparation**: removed credentials from the history, hardened token validation in the
  OEM service, fixed a page remounting bug, reworked the 3D selection spotlight, fixed the Prolog
  genetic algorithm (it never completed; it is now seeded with the heuristics and tested in CI),
  repaired the CI and E2E suites, updated dependencies and added the live demo mode

## Team

| Name | Student ID |
|---|---|
| Rafael Barbosa | 1230544 |
| Igor Coutinho | 1230543 |
| João Soares | 1211064 |
| Miguel Pais | 1230851 |
| Sofia Costa | 1231006 |

Instituto Superior de Engenharia do Porto (ISEP), Departamento de Engenharia Informática,
LAPR5, 2025/26, group 3DD-02.

## Credits and license

Third-party 3D models are credited in
[`src/Frontend/wwwroot/models/CREDITS.md`](src/Frontend/wwwroot/models/CREDITS.md).

This repository is shared for portfolio and educational purposes. No license is granted for reuse
of the source code.
