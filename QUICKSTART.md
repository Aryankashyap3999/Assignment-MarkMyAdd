# Quick Start Guide

Get the RBAC Configuration Tool running in 5 minutes!

## Prerequisites

- Node.js 18+
- PostgreSQL (or Docker)
- Git

## Option 1: Run Locally (Quickest)

### 1. Start PostgreSQL with Docker

```bash
docker run --name rbac-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=rbac_tool \
  -p 5432:5432 \
  -d postgres:15
```

### 2. Clone & Setup

```bash
git clone https://github.com/yourusername/rbac-tool.git
cd rbac-tool

npm install --legacy-peer-deps

# Create .env.local
cat > .env.local << EOF
DATABASE_URL="postgresql://postgres:password@localhost:5432/rbac_tool"
JWT_SECRET="your-secret-key-min-32-chars-long-here"
NEXT_PUBLIC_API_URL="http://localhost:3000"
EOF

# Setup database
npx prisma migrate dev --name init

# Start server
npm run dev
```

### 3. Access Application

- **URL**: http://localhost:3000
- **Sign Up**: Use any email/password (min 8 chars)
- **Or Login**: admin@example.com / password123

## Option 2: Deploy to Vercel (1-Click)

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Select this GitHub repository
4. Add environment variables:
   - `DATABASE_URL`: PostgreSQL URL from Neon or Vercel Postgres
   - `JWT_SECRET`: Random 32+ character string
   - `NEXT_PUBLIC_API_URL`: Your Vercel deployment URL
5. Click "Deploy"

**Done!** Your app is live.

## First Steps

After login:

1. **Create Permissions**:
   - Go to "Manage Permissions"
   - Add: `edit:articles`, `delete:articles`, `view:dashboard`

2. **Create Roles**:
   - Go to "Manage Roles"
   - Add: `Editor`, `Admin`, `Viewer`

3. **Attach Permissions to Roles**:
   - Click "Manage Permissions" on a role
   - Add permissions to the role

4. **Try AI Commands** (Optional):
   - Go to "AI Commands"
   - Try: "Give the editor role the edit articles permission"

## Database Setup (If Not Using Docker)

### Using Neon (Free Cloud Postgres)

```bash
# 1. Visit https://neon.tech
# 2. Sign up and create a project
# 3. Copy connection string
# 4. Add to .env.local:
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.neon.tech/dbname?sslmode=require"

# Then run migrations:
npx prisma migrate dev --name init
```

### Using Local Postgres

```bash
# Mac (with Homebrew)
brew install postgresql
brew services start postgresql
createdb rbac_tool

# Linux (Ubuntu/Debian)
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb rbac_tool

# Windows
# Download from https://www.postgresql.org/download/windows/

# Update .env.local with your connection details
```

## Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
npm install --legacy-peer-deps
npx prisma generate
```

### "database does not exist"
```bash
# Create database
createdb rbac_tool
npx prisma migrate dev --name init
```

### "Connection refused"
```bash
# Check PostgreSQL is running:
docker ps  # If using Docker
# or
brew services list  # If using Homebrew
```

### "JWT_SECRET is not set"
```bash
# Make sure .env.local has:
JWT_SECRET="your-secret-key-min-32-chars"
```

## Available Scripts

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm start         # Start production server
npm run lint      # Check linting

# Prisma commands
npx prisma studio          # Open Prisma Studio
npx prisma migrate dev     # Create migration
npx prisma db push        # Push schema to DB
npx prisma generate       # Generate client
```

## Project Structure

```
src/
├── app/api/           # Backend API routes
├── app/auth/          # Login/signup pages
├── app/dashboard/     # Main application
├── components/        # React components
├── services/          # Business logic
└── utils/             # Helper functions
```

## Environment Variables Explained

| Variable | Example | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `postgresql://...` | Database connection |
| `JWT_SECRET` | `abc123...` | Token signing key |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000` | Frontend API base URL |
| `NEXT_PUBLIC_GEMINI_API_KEY` | `ai-xxx` | AI feature (optional) |

## Features Overview

### ✅ Core Features
- ✅ User authentication (signup/login)
- ✅ Role CRUD operations
- ✅ Permission CRUD operations
- ✅ Attach/detach permissions to roles
- ✅ Responsive UI with Shadcn components

### ⭐ Bonus Features
- ⭐ AI-powered natural language commands
- ⭐ Modular architecture
- ⭐ Production-ready code

## API Quick Reference

### Authentication

```bash
# Signup
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "signup",
    "email": "user@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "login",
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Permission

```bash
curl -X POST http://localhost:3000/api/permissions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "edit:articles",
    "description": "Can edit articles"
  }'
```

### Create Role

```bash
curl -X POST http://localhost:3000/api/roles \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "editor"}'
```

## Next Steps

1. **Read** `README.md` for full documentation
2. **Check** `DEPLOYMENT.md` for production setup
3. **Review** `CONTRIBUTING.md` for development guidelines
4. **Explore** `DEVELOPING.md` (create this for advanced topics)

## Need Help?

- 📖 See `README.md` for full documentation
- 🚀 See `DEPLOYMENT.md` for deployment help
- 👨‍💻 See `CONTRIBUTING.md` for development guidelines
- 📧 Contact: +91-7700000766 (Akshay Gaur)
- 🐛 Open an issue on GitHub

## Performance Tips

- Database queries are optimized with Prisma
- Use pagination for large datasets
- Implement caching for frequently accessed data
- Monitor build size with `npm run build`

## Security Notes

- Change `JWT_SECRET` in production
- Use HTTPS in production
- Keep dependencies updated: `npm audit fix`
- Don't commit `.env.local` to git

## Success Checklist

- [x] Node.js and PostgreSQL installed
- [x] Repository cloned
- [x] Dependencies installed
- [x] `.env.local` configured
- [x] Database migrations ran
- [x] Server running at localhost:3000
- [x] Can sign up and login
- [x] Can create roles and permissions

## What's Next?

After getting it running:

1. Create sample data
2. Test all features
3. Deploy to Vercel
4. Configure custom domain
5. Set up continuous monitoring
6. Add your own features!

Happy coding! 🎉
