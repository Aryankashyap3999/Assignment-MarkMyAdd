# RBAC Configuration Tool

A modern, full-stack web application for managing Role-Based Access Control (RBAC) with an intuitive user interface.

## 🎯 What is RBAC? (Explained Simply)

Imagine you're a teacher in a school. Not everyone should be able to do everything:
- **Teachers** can view grades and attendance
- **Principals** can view everything and delete student records
- **Students** can only view their own grades

RBAC is like assigning special badges (roles) to people. Each badge comes with specific superpowers (permissions). This tool lets you create and manage these badges and superpowers!

## ✨ Features

- **User Authentication**: Secure signup/login with password hashing and JWT tokens
- **Role Management**: Create, read, update, and delete roles
- **Permission Management**: Create, read, update, and delete permissions
- **Role-Permission Association**: Attach/detach permissions to roles
- **Natural Language Commands**: Use plain English to configure RBAC (AI-powered bonus feature)
- **Responsive UI**: Clean, modern interface built with Shadcn and Tailwind CSS

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 with TypeScript, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcryptjs
- **State Management**: Zustand
- **AI Integration**: Google Gemini API (for natural language parsing)

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- Google Gemini API key (for bonus feature)

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd assignmentmarkmyword
npm install --legacy-peer-deps
```

### 2. Environment Setup

Create `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rbac_tool"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRY="7d"

# API
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Gemini AI (for bonus feature)
NEXT_PUBLIC_GEMINI_API_KEY="your-gemini-api-key-here"
```

### 3. Setup Database

```bash
npx prisma migrate dev --name init
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000 in your browser.

## 📚 Project Structure

```
src/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── permissions/    # Permission CRUD endpoints
│   │   ├── roles/          # Role CRUD endpoints
│   │   └── ai/             # AI command parsing endpoint
│   ├── auth/               # Login/signup pages
│   └── dashboard/          # Protected dashboard pages
├── components/              # React components
│   └── ui/                 # Shadcn UI components
├── config/                 # Configuration files
├── dto/                    # Data Transfer Objects (Zod schemas)
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
├── middleware/             # Authentication middleware
├── models/                 # Data models
├── repositories/           # Data access layer
├── services/               # Business logic layer
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## 🔐 Authentication Flow

1. User signs up with email and password
2. Password is hashed with bcryptjs
3. JWT token is generated and stored in localStorage
4. Token is sent with each API request in Authorization header
5. Middleware verifies token before accessing protected routes

## 📖 API Documentation

### Authentication

#### Signup/Login
```
POST /api/auth
Body: {
  "action": "signup" | "login",
  "email": "user@example.com",
  "password": "password123"
}
```

### Permissions

#### Create Permission
```
POST /api/permissions
Headers: Authorization: Bearer <token>
Body: {
  "name": "edit:posts",
  "description": "Can edit posts"
}
```

#### Get All Permissions
```
GET /api/permissions?skip=0&take=10
Headers: Authorization: Bearer <token>
```

### Roles

#### Create Role
```
POST /api/roles
Headers: Authorization: Bearer <token>
Body: { "name": "editor" }
```

#### Get All Roles
```
GET /api/roles?skip=0&take=10
Headers: Authorization: Bearer <token>
```

### Role Permissions

#### Add Permission to Role
```
POST /api/roles/:id/permissions
Headers: Authorization: Bearer <token>
Body: { "permissionId": "<permission-id>" }
```

#### Remove Permission from Role
```
DELETE /api/roles/:id/permissions
Headers: Authorization: Bearer <token>
Body: { "permissionId": "<permission-id>" }
```

### AI Commands (Bonus)

#### Parse Natural Language Command
```
POST /api/ai/parse-command
Headers: Authorization: Bearer <token>
Body: { "command": "Give the editor role the edit articles permission" }
```

## 🧪 Test Credentials

Email: `admin@example.com`
Password: `password123`

## 🌐 Deployment on Vercel

1. Push your code to GitHub
2. Go to https://vercel.com
3. Connect your GitHub repository
4. Add environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_GEMINI_API_KEY`
5. Deploy!

## 📝 Database Schema

### users
- id (uuid, PK)
- email (text, UNIQUE)
- password (text, hashed)
- createdAt (timestamp)
- updatedAt (timestamp)

### roles
- id (uuid, PK)
- name (text, UNIQUE)
- createdAt (timestamp)
- updatedAt (timestamp)

### permissions
- id (uuid, PK)
- name (text, UNIQUE)
- description (text, nullable)
- createdAt (timestamp)
- updatedAt (timestamp)

### role_permissions (Junction Table)
- roleId (uuid, FK)
- permissionId (uuid, FK)

### user_roles (Junction Table)
- userId (uuid, FK)
- roleId (uuid, FK)

## 🤖 Natural Language Commands (Bonus Feature)

The AI command feature uses Google's Gemini API to parse natural language commands. Examples:

- "Create a new role called manager"
- "Create a permission to edit articles"
- "Give the editor role the delete articles permission"

## ⚠️ Security Considerations

- Never share your JWT_SECRET in version control
- Use strong passwords in production
- Always use HTTPS in production
- Implement rate limiting for production
- Add CORS configuration as needed
- Validate and sanitize all inputs

## 📄 License

MIT

## 👨‍💻 Support

For issues or questions, please reach out at +91-7700000766 (Akshay Gaur)
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
