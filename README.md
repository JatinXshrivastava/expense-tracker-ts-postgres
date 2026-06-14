# Expense Tracker

A full-stack Expense Tracker application built with TypeScript and PostgreSQL. The application allows users to securely manage their finances by tracking income and expenses with complete CRUD functionality.

## Features

### Authentication & Security

* User registration and login
* JWT-based authentication and authorization
* Password hashing using bcrypt
* Input validation with Zod

### Income Management

* Add new income records
* View all income records
* Update existing income entries
* Delete income entries

### Expense Management

* Add new expense records
* View all expense records
* Update existing expense entries
* Delete expense entries

### Data Management

* Persistent storage using PostgreSQL
* Cloud-hosted database with NeonDB
* Type-safe API development using TypeScript

## Tech Stack

### Backend

* TypeScript
* Bun Runtime
* PostgreSQL
* NeonDB

### Security & Validation

* JWT (Authentication & Authorization)
* bcrypt (Password Hashing)
* Zod (Schema Validation & Type Safety)

### Development Tools

* Turborepo (Monorepo Management)
* Git (Version Control)
* dotenv (Environment Variable Management)

## Project Structure

* Authentication Layer
* CRUD APIs for Income Management
* CRUD APIs for Expense Management
* PostgreSQL Database Integration
* Input Validation & Error Handling

## Getting Started

### Install Dependencies

```bash
bun install
```

### Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_jwt_secret
```


### Start Development Server

```bash
bun backend/index.ts
```

## API Capabilities

| Operation | Income | Expense |
| --------- | ------ | ------- |
| Create    | ✅      | ✅       |
| Read      | ✅      | ✅       |
| Update    | ✅      | ✅       |
| Delete    | ✅      | ✅       |

## Future Improvements

* Category-wise expense tracking
* Monthly and yearly analytics
* Budget planning
* Dashboard with charts and insights
* Export reports (CSV/PDF)
* Recurring transactions

## License

This project is open-source and available under the MIT License.
