# Port Management System 

A comprehensive port management system developed as part of the 5th semester integrated project (LAPR5) at ISEP. This system manages vessels, resources, docks, and operations in a modern port environment.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [User Stories](#user-stories)
- [Testing](#testing)
- [Contributing](#contributing)
- [Team](#team)

## Overview

The Port Management System is a modern web application designed to streamline port operations, including:
- **Vessel Management**: Track vessel arrivals, departures, and specifications
- **Resource Management**: Monitor cranes, equipment, and facilities
- **3D Visualization**: Interactive 3D view of port infrastructure
- **Real-time Operations**: Manage docks, storage areas, and staff efficiently

## Features

### Core Functionality
- **Vessel Registration & Tracking**
- **Resource & Equipment Management**
- **Storage Area Organization**
- **Staff & Qualifications Management**
- **Dock Operations**
- **Vessel Visit Notifications**

### Technical Features
- **Single Page Application (SPA)** with React
- **Microsoft Entra ID Authentication**
- **Responsive Web Design**
- **Interactive 3D Port Visualization**
- **RESTful API Architecture**
- **Azure SQL Database**

## Technology Stack

### Backend
- **Framework**: ASP.NET Core 6.0
- **Database**: Azure SQL Database
- **ORM**: Entity Framework Core
- **Authentication**: Microsoft Entra ID
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18 (CDN-based)
- **Build Tools**: Babel for JSX transformation
- **3D Graphics**: Three.js
- **Styling**: CSS3 with modular architecture
- **HTTP Client**: Fetch API

### Infrastructure
- **Cloud Platform**: Microsoft Azure
- **Database**: Azure SQL Server
- **Version Control**: Git
- **IDE**: Visual Studio Code

## Getting Started

### Prerequisites
- .NET 6.0 SDK
- Visual Studio Code or Visual Studio
- Azure SQL Database access
- Modern web browser

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Departamento-de-Engenharia-Informatica/LEI-SEM5-PI-2025-26-3DD-02.git
   cd LEI-SEM5-PI-2025-26-3DD-02
   ```

2. **Navigate to the WebApp project**
   ```bash
   cd src/WebApp
   ```

3. **Configure the database connection**
   - Update `appsettings.json` with your Azure SQL connection string
   - Ensure Azure AD configuration is set up

4. **Run database migrations**
   ```bash
   dotnet ef database update
   ```

5. **Start the application**
   ```bash
   dotnet run
   ```

6. **Access the application**
   - Web App: `https://localhost:5001`
   - API Documentation: `https://localhost:5001/swagger`

### Quick Start Guide
1. Navigate to the homepage to see available features
2. Use the navigation menu to access different modules
3. Check the API documentation for integration details
4. Explore the 3D visualization for port layout

## Project Structure

```
LEI-SEM5-PI-2025-26-3DD-02/
├── src/WebApp/                 # Main application
│   ├── Controllers/            # API Controllers
│   ├── Models/                 # Domain, Application, Infrastructure layers
│   │   ├── Domain/            # Business logic and entities
│   │   ├── Application/       # Services and DTOs
│   │   └── Infrastructure/    # Data access and repositories
│   ├── wwwroot/               # Static web assets
│   │   ├── js/               # React components and services
│   │   └── css/              # Styling
│   └── Migrations/           # Database migrations
├── tests/WebApp/              # Test projects
├── docs/                      # Documentation and diagrams
└── README.md                 # This file
```

## API Documentation

The system provides a comprehensive RESTful API. Access the interactive documentation at:
- **Swagger UI**: `/swagger`
- **OpenAPI Spec**: `/swagger/v1/swagger.json`

### Main API Endpoints
- `GET /api/vessels` - List all vessels
- `GET /api/resources` - List port resources
- `GET /api/docks` - List available docks
- `GET /api/staff` - List staff members
- `POST /api/vessels` - Register new vessel
- And many more...

## User Stories

This project implements multiple user stories organized by sprints:

### Sprint 1 (User Stories 2.2.1 - 2.2.13)
- Vessel and dock management
- Resource allocation
- Staff management
- Basic CRUD operations

### Sprint 2 (User Stories 3.1.1+)
- **US 3.1.1**: SPA framework implementation 
- Modern web interface
- Enhanced user experience

See the `/docs` folder for detailed user story documentation and sequence diagrams.

## Testing

### Running Tests
```bash
# Run all tests
dotnet test

# Run a specific test class
dotnet test --filter "ClassName"

# Run a specific test method
dotnet test --filter "ClassName.MethodName"
```

### Test Categories
- **Unit Tests**: Domain logic and services
- **Integration Tests**: Database and repository tests
- **System Tests**: End-to-end API testing

## Team

### Development Team - Group 02 (3DD)

| Name | Student ID 
|------|------------
| **Rafael Barbosa** | 1230544
| **Igor Coutinho** | 1230543
| **João Soares** | 1211064
| **Miguel Pais** | 1230851
| **Sofia Costa** | 1231006

### Academic Context

- **Course**: Laboratório de Projeto 5 (LAPR5)
- **Institution**: Instituto Superior de Engenharia do Porto (ISEP)
- **Department**: Departamento de Engenharia Informática
- **Academic Year**: 2024/2025
- **Semester**: 5th Semester
- **Group**: 02 - 3DD

---

## License

This project is developed for academic purposes as part of the LAPR5 course at ISEP.

---

## Links

- [Project Documentation](./docs/)
- [Domain Model](./docs/domain_model/)
- [API Documentation](https://localhost:5001/swagger)
- [ISEP](https://www.isep.ipp.pt/)

---

*Last updated: November 2024*
