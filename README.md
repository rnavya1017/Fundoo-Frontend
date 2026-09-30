# 📝 Fundoo Notes – Angular Frontend

A modern **Google Keep-inspired Notes Management application** built using **Angular, TypeScript, HTML, CSS, Reactive Forms, RxJS and REST APIs**.

The application provides user authentication and a complete notes management interface with features such as creating, editing, deleting, pinning, archiving, restoring notes, labels, reminders, attachments, searching and filtering.

---

## 📌 Project Overview

**Fundoo Notes** is a full-stack Notes Management application.

This repository contains the **Angular frontend** responsible for:

* User registration
* User login
* Forgot password
* Reset password
* JWT token management
* Protected routes
* Notes CRUD operations
* Pin and unpin notes
* Archive and unarchive notes
* Trash and restore notes
* Permanent note deletion
* Labels
* Reminders
* Attachments
* Searching notes
* Filtering notes
* Pagination
* Responsive Notes UI
* Angular SSR configuration

The frontend communicates with a **Spring Boot REST API** using Angular's `HttpClient`.

---

## 🚀 Technologies Used

| Technology     | Purpose                             |
| -------------- | ----------------------------------- |
| Angular 21     | Frontend framework                  |
| TypeScript     | Application programming language    |
| HTML5          | UI structure                        |
| CSS3           | Styling and responsive design       |
| Reactive Forms | Form creation and validation        |
| RxJS           | Asynchronous programming            |
| Angular Router | Application navigation              |
| HttpClient     | REST API communication              |
| Signals        | Reactive application state          |
| JWT            | Authentication                      |
| Angular SSR    | Server-side rendering configuration |
| Vitest         | Unit testing                        |
| npm            | Package management                  |
| Git & GitHub   | Version control                     |

---

## ✨ Features

### 🔐 Authentication

The application provides complete authentication functionality.

* User Registration
* User Login
* Logout
* Forgot Password
* Reset Password
* Password validation
* Email validation
* Confirm password validation
* JWT token storage
* Automatic JWT Authorization header
* Protected routes using Angular Route Guards

### 📝 Notes Management

Users can manage their notes through the Notes dashboard.

* Create note
* View notes
* Update note
* Delete note
* Pin note
* Unpin note
* Archive note
* Unarchive note
* Move note to trash
* Restore note
* Permanently delete note
* Empty trash

### 🔎 Search and Filters

Notes can be searched and filtered using:

* Keyword search
* Pinned notes
* Archived notes
* Trashed notes
* Reminder notes
* Date filtering
* Color filtering
* Label filtering

### 🏷️ Labels

Users can organize notes using labels.

* Create label
* View labels
* Update label
* Delete label
* Add label to note
* Remove label from note
* Filter notes by label

### ⏰ Reminders

The application supports reminders for notes.

* Create reminder
* View reminders
* Delete reminder
* Associate reminder with a note

### 📎 Attachments

Notes can have file attachments.

* Upload attachment
* View attachments
* Delete attachment

### 📄 Pagination

Notes support paginated API requests to efficiently load large numbers of notes.

### 🎨 Notes UI

The Notes interface provides a Google Keep-inspired experience with:

* Sidebar navigation
* Notes grid
* Note cards
* Color selection
* Pinning
* Labels
* Reminders
* Archive
* Trash
* Search
* Filters
* Confirmation dialogs
* Loading states
* Empty states
* Profile/logout functionality

---

# 📂 Project Structure

```text
fundoo-notes/
│
├── .vscode/
│   ├── extensions.json
│   ├── launch.json
│   ├── mcp.json
│   └── tasks.json
│
├── public/
│   └── favicon.ico
│
├── src/
│   │
│   ├── app/
│   │   ├── core/
│   │   │   ├── config/
│   │   │   │   └── api.config.ts
│   │   │   │
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   │
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts
│   │   │   │
│   │   │   ├── models/
│   │   │   │   ├── api-error.model.ts
│   │   │   │   └── user.model.ts
│   │   │   │
│   │   │   └── services/
│   │   │       ├── auth.service.ts
│   │   │       └── storage.service.ts
│   │   │
│   │   ├── features/
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── models/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── signup/
│   │   │   │   │   ├── forgot-password/
│   │   │   │   │   └── reset-password/
│   │   │   │   └── auth.routes.ts
│   │   │   │
│   │   │   └── notes/
│   │   │       ├── components/
│   │   │       │   ├── note-actions/
│   │   │       │   ├── note-card/
│   │   │       │   ├── note-form/
│   │   │       │   └── note-list/
│   │   │       │
│   │   │       ├── models/
│   │   │       ├── pages/
│   │   │       │   ├── notes/
│   │   │       │   ├── archive/
│   │   │       │   └── trash/
│   │   │       │
│   │   │       ├── services/
│   │   │       │   ├── notes.service.ts
│   │   │       │   ├── label.service.ts
│   │   │       │   ├── reminder.service.ts
│   │   │       │   └── attachment.service.ts
│   │   │       │
│   │   │       └── notes.routes.ts
│   │   │
│   │   ├── shared/
│   │   │   └── components/
│   │   │       ├── confirmation-dialog/
│   │   │       ├── empty-state/
│   │   │       ├── loading/
│   │   │       └── navbar/
│   │   │
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   └── app.ts
│   │
│   ├── index.html
│   ├── main.ts
│   ├── main.server.ts
│   ├── server.ts
│   └── styles.css
│
├── angular.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── .gitignore
└── README.md
```

---

# 🏗️ Application Architecture

The project follows a feature-based Angular architecture.

```text
                    ┌─────────────────────┐
                    │      Browser        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Angular Components  │
                    │ HTML + TypeScript   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Angular Services    │
                    │ Auth / Notes / etc. │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Angular HttpClient  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ JWT Interceptor     │
                    │ Authorization       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Spring Boot REST API│
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Database / Redis    │
                    └─────────────────────┘
```

---

# 🔐 Authentication Flow

```text
User
 │
 ▼
Login Page
 │
 ▼
Login Form
 │
 ▼
AuthService
 │
 ▼
POST /api/auth/login
 │
 ▼
Spring Boot Backend
 │
 ▼
Validate Credentials
 │
 ▼
Generate JWT
 │
 ▼
Angular receives JWT
 │
 ▼
Store token
 │
 ▼
Navigate to /notes
```

For protected API requests:

```text
Angular Request
      │
      ▼
Auth Interceptor
      │
      ▼
Read JWT Token
      │
      ▼
Authorization: Bearer <JWT>
      │
      ▼
Spring Boot API
      │
      ▼
Authenticated Request
```

---

# 🛡️ Route Guard

Protected notes routes use an Angular authentication guard.

Example:

```typescript
{
  path: 'notes',
  component: Notes,
  canActivate: [authGuard]
}
```

The guard checks whether the user is authenticated before allowing access to the Notes application.

---

# 🔑 JWT Interceptor

The authentication interceptor automatically adds the JWT token to protected API requests.

```text
HTTP Request
     │
     ▼
Auth Interceptor
     │
     ├── Token available
     │       │
     │       ▼
     │ Authorization: Bearer JWT
     │
     ▼
Backend API
```

This avoids manually adding the token in every service method.

---

# 🔌 Backend API Configuration

The API base URL is configured in:

```text
src/app/core/config/api.config.ts
```

Current configuration:

```typescript
export const API_BASE_URL = 'http://localhost:8081/api';
```

If the Spring Boot backend is running on another port, update this value.

For example:

```typescript
export const API_BASE_URL = 'http://localhost:8080/api';
```

For production deployment, replace the local backend URL with the deployed backend URL.

---

# 📡 Main API Modules

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

## Notes

```text
POST   /api/notes
GET    /api/notes
GET    /api/notes/{id}
PUT    /api/notes/{id}
DELETE /api/notes/{id}

GET    /api/notes/trash

PATCH  /api/notes/{id}/pin
PATCH  /api/notes/{id}/unpin

PATCH  /api/notes/{id}/archive
PATCH  /api/notes/{id}/unarchive

PATCH  /api/notes/{id}/restore

DELETE /api/notes/{id}/permanent
```

## Search and Filtering

```text
GET /api/notes/search
GET /api/notes/filter/pinned
GET /api/notes/filter/archived
GET /api/notes/filter/trashed
GET /api/notes/filter/reminder
GET /api/notes/filter/date
GET /api/notes/filter/color
GET /api/notes/filter/label
GET /api/notes/page
```

## Labels

```text
POST   /api/labels
GET    /api/labels
PUT    /api/labels/{id}
DELETE /api/labels/{id}
```

## Reminders

```text
POST   /api/notes/{id}/reminder
GET    /api/reminders
DELETE /api/reminders/{id}
```

## Attachments

```text
POST   /api/notes/{id}/attachments
GET    /api/notes/{id}/attachments
DELETE /api/attachments/{id}
```

---

# 📋 Prerequisites

Before running the application, install:

* Node.js
* npm
* Angular CLI
* Git

Check the installed versions:

```bash
node --version
```

```bash
npm --version
```

```bash
ng version
```

```bash
git --version
```

---

# ⚙️ Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Move into the project:

```bash
cd fundoo-notes
```

Install dependencies:

```bash
npm install
```

---

# ▶️ Run the Application

Start the Angular development server:

```bash
npm start
```

or:

```bash
ng serve
```

Open:

```text
http://localhost:4200
```

---

# 🏗️ Build the Application

To create a production build:

```bash
ng build
```

The generated files are placed inside:

```text
dist/
```

---

# 🧪 Run Tests

Run unit tests using Vitest:

```bash
npm test
```

or:

```bash
ng test
```

---

# 🎨 Angular Concepts Used

This project demonstrates several important Angular concepts:

* Standalone Components
* Components
* Services
* Dependency Injection
* Reactive Forms
* Form Validation
* Angular Router
* Route Guards
* HTTP Interceptors
* HttpClient
* Observables
* RxJS
* Signals
* Computed Signals
* Effects
* Reactive State Management
* Feature-based project structure
* Shared Components
* Models and Interfaces
* Lazy/feature route organization
* Server-Side Rendering configuration

---

# 🧩 Core Folder

The `core` folder contains application-wide functionality.

```text
core/
├── config/
├── guards/
├── interceptors/
├── models/
└── services/
```

### Config

Contains centralized API configuration and endpoint definitions.

### Guards

Controls access to protected routes.

### Interceptors

Automatically adds authentication information to HTTP requests.

### Models

Defines TypeScript interfaces used throughout the application.

### Services

Contains reusable business/API communication logic such as authentication and browser storage.

---

# 🧩 Features Folder

The `features` folder contains functionality grouped by business feature.

```text
features/
├── auth/
└── notes/
```

### Auth

Responsible for:

* Login
* Signup
* Forgot password
* Reset password

### Notes

Responsible for:

* Notes
* Labels
* Reminders
* Attachments
* Archive
* Trash
* Search
* Filtering

---

# 🔄 Notes CRUD Flow

### Create Note

```text
Notes UI
   ↓
NotesStore
   ↓
POST /api/notes
   ↓
Spring Boot
   ↓
Database
   ↓
Response
   ↓
Update Angular State
```

### Update Note

```text
Edit Note
   ↓
NotesStore
   ↓
PUT /api/notes/{id}
   ↓
Backend
   ↓
Database
   ↓
Updated Note
   ↓
Angular UI
```

### Delete Note

Normal delete moves a note to trash:

```text
Delete
  ↓
DELETE /api/notes/{id}
  ↓
Trash
```

Permanent deletion:

```text
Permanent Delete
       ↓
DELETE /api/notes/{id}/permanent
       ↓
Database
       ↓
Note permanently removed
```

---

# 📁 Important Services

## AuthService

Responsible for:

* Registration
* Login
* Logout
* Forgot password
* Reset password
* Current user information
* Authentication state

## NotesStore

Responsible for:

* Loading notes
* Creating notes
* Updating notes
* Deleting notes
* Restoring notes
* Archiving notes
* Pinning notes
* Searching
* Filtering
* Pagination
* Trash management

## LabelService

Responsible for label operations.

## ReminderService

Responsible for reminder operations.

## AttachmentService

Responsible for note attachment operations.

## StorageService

Responsible for browser-side storage such as authentication information.

---

# 🧑‍💻 Development Workflow

```text
Create Component
       ↓
Create HTML UI
       ↓
Create TypeScript Logic
       ↓
Create Service
       ↓
Call REST API
       ↓
Receive Backend Response
       ↓
Update Application State
       ↓
Update UI
```

---

# 🔀 Git Workflow

Initialize Git:

```bash
git init
```

Check status:

```bash
git status
```

Add a file:

```bash
git add <file>
```

Commit:

```bash
git commit -m "[Navya] : message"
```

View commits:

```bash
git log --oneline
```

Push to GitHub:

```bash
git push -u origin main
```

---

# 📌 Important Files

| File                                               | Purpose                         |
| -------------------------------------------------- | ------------------------------- |
| `package.json`                                     | Dependencies and npm scripts    |
| `angular.json`                                     | Angular workspace configuration |
| `src/app/app.routes.ts`                            | Application routing             |
| `src/app/core/config/api.config.ts`                | API endpoint configuration      |
| `src/app/core/services/auth.service.ts`            | Authentication logic            |
| `src/app/core/guards/auth.guard.ts`                | Route protection                |
| `src/app/core/interceptors/auth.interceptor.ts`    | JWT handling                    |
| `src/app/features/notes/services/notes.service.ts` | Notes API operations            |
| `src/app/features/notes/pages/notes/notes.ts`      | Main Notes page                 |
| `src/app/features/auth/pages/login/login.ts`       | Login logic                     |
| `src/app/features/auth/pages/signup/signup.ts`     | Registration logic              |

---

---



# 👩‍💻 Author

**Navya**

Fundoo Notes – Angular Frontend Application

---

# 📄 License

This project is developed for learning, training and project demonstration purposes.
