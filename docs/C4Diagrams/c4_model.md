# The C4 Model for Software Architecture

The C4 model is an "abstraction-first" approach to diagramming software architecture, based on four hierarchical levels of diagrams: **Context**, **Containers**, **Components**, and **Code**. It helps software development teams describe and communicate software architecture at different levels of detail.

## Level 1: System Context Diagram
**Audience**: Technical and non-technical people, inside and outside the software development team.

The System Context diagram provides a "big picture" view of the software system. It shows:
- The software system you are building.
- Who uses it (people/roles).
- How it fits into the existing IT landscape (interactions with other software systems).

**Focus**: People and software systems.

## Level 2: Container Diagram
**Audience**: Technical people inside and outside the software development team (including software architects, developers, and operations/support staff).

The Container diagram zooms into the software system to show the high-level technical building blocks. A "container" is something like a server-side web application, single-page application, desktop application, mobile app, database schema, file system, etc.

It shows:
- The high-level shape of the software architecture.
- How responsibilities are distributed across the system.
- The major technology choices (e.g., Java, React, PostgreSQL).
- How the containers communicate with each other.

**Focus**: Containers (applications, data stores, microservices) and technology choices.

## Level 3: Component Diagram
**Audience**: Software architects and developers.

The Component diagram zooms into an individual container to show the components inside it. A "component" is a grouping of related functionality encapsulated behind a well-defined interface (e.g., a Controller, Service, or Repository class/interface).

It shows:
- The implementation details of a container.
- The components and their interactions.
- How the components relate to the code structure.

**Focus**: Components within a container.

## Level 4: Code
**Audience**: Software architects and developers.

This level zooms into an individual component to show how it is implemented. This usually takes the form of UML class diagrams, entity-relationship diagrams, etc.

**Note**: This level of detail is often not recommended for long-term documentation as it becomes outdated quickly. It is best generated on-demand from IDEs.

---
*Based on "The C4 Model for Software Architecture" by Simon Brown.*
