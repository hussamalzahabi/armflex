# AW Training App — Agent Instructions

This file provides guidance for AI coding agents (Codex) working in this repository.

Agents should follow these instructions to maintain project consistency, scope, and architecture.


# Project Overview

This project is a **web-first arm wrestling training application**.

The goal is to help athletes:

- structure their training
- log workouts
- track long-term progress
- generate structured training programs

The long-term vision is to build a **performance intelligence platform for arm wrestlers**, but the current focus is **v0.1 only**.


# Current Version Scope (v0.1)

v0.1 is intentionally minimal.

The goal is to create a working product that allows a user to:

1. Create an account
2. Define a training profile
3. View exercises
4. Log workouts
5. Generate a simple training program

The application should remain **simple and maintainable**.


# Features Included in v0.1

The following features are allowed in v0.1:

- Authentication
- User Profile
- Exercise Model
- Initial Exercise Seed Data
- Workout Logging
- Basic Program Generator (rule-based)


# Out of Scope (Do NOT implement)

The following features must NOT be implemented in v0.1:

- Payments
- Subscriptions
- Leaderboards
- Social features
- Notifications
- Messaging
- Mobile applications
- AI-generated programs
- Advanced analytics
- Performance prediction
- Complex periodization algorithms

If a feature is not explicitly listed in the **v0.1 scope**, assume it belongs to a later version.


# Technology Stack

Backend
- Laravel

Frontend
- React
- Inertia.js

Styling
- TailwindCSS
- PrimeReact

Database
- PostgreSQL

Infrastructure
- CI/CD pipeline enabled


# ORM and Database Layer

The project uses **Laravel's Eloquent ORM**.

All database interactions should be implemented using:

- Eloquent Models
- Laravel Migrations
- Laravel Query Builder when necessary

Avoid raw SQL unless absolutely required.

Although the database is PostgreSQL, Eloquent should remain the **primary interface** for database operations.

Migrations must remain compatible with PostgreSQL.

Primary keys should use Laravel's default **big integer auto-increment** unless there is a strong reason to use UUID.


# Development Principles

Agents should follow these principles when writing code:

1. Prefer **simple implementations**
2. Avoid unnecessary abstraction
3. Avoid premature optimization
4. Do not introduce new frameworks or libraries unless required
5. Maintain readability and clarity
6. Follow Laravel conventions


# Database Guidelines

- Prefer relational design with clear foreign keys
- Add indexes for foreign key columns
- Use database constraints where appropriate
- Avoid complex schemas in v0.1
- Avoid premature use of JSON unless necessary


# Frontend Guidelines

Use:

- **PrimeReact** for complex UI components
- **TailwindCSS** for layout and spacing
- Responsive layouts by default (mobile-first), ensuring core screens are usable on mobile, tablet, and desktop

Examples of PrimeReact components:

- DataTable
- Dropdown
- Dialog
- Toast
- Input components

Avoid excessive custom styling of PrimeReact components.


# Code Quality

All generated code must:

- pass CI/CD checks
- avoid breaking existing functionality
- follow the existing project structure
- include validation where appropriate

When modifying existing code:

- preserve existing behavior
- make minimal necessary changes

# Testing Strategy

Testing is required for all core features.

Use Laravel's testing framework with PHPUnit.

Testing should focus on behaviors and observable outcomes rather than internal technical implementation details.

Two types of tests should be written when appropriate:

Unit Tests
- Test isolated business logic
- Test services, helpers, and rule-based logic
- Should not rely on database state when avoidable
- At the unit-test level, BDD means testing the contract and observable outcome of the unit from the client perspective.

Feature / Acceptance Tests
- Test full application behavior
- Test HTTP endpoints
- Test authentication flows
- Test database interactions

Example areas that should have tests:

- Authentication
- User profile creation and updates
- Exercise retrieval
- Workout logging
- Program generation logic


# Testing Rules

Agents should follow these testing rules:

- Add tests for new business logic
- Prefer **Feature tests** for API or controller behavior
- Prefer **Unit tests** for algorithmic logic
- Write behavior-first tests; assert externally visible behavior, not private implementation details
- Use behavior-style test names with the word `should` (for example: `test_user_should_register`)
- Tests must pass CI/CD checks
- Do not remove existing tests unless they are invalid

# Working Style for Agents

When implementing a feature:

1. Understand the task scope
2. Implement the smallest working solution
3. Avoid adding unrelated improvements
4. Respect existing architecture
5. Do not expand project scope


# Philosophy

This project prioritizes:

- clarity
- incremental progress
- maintainability
- real-world usability

Agents should help move the project toward a **working product**, not toward unnecessary complexity.
