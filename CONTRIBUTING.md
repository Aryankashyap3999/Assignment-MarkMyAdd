# Contributing Guidelines

Thank you for your interest in contributing to the RBAC Configuration Tool! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Git
- A code editor (VS Code recommended)

### Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/rbac-tool.git
cd rbac-tool

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local with your local database URL

# 4. Setup database
npx prisma migrate dev --name init

# 5. Start development server
npm run dev
```

Visit http://localhost:3000 to see the application running.

## Project Structure

```
src/
├── app/                  # Next.js app directory
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   └── dashboard/      # Protected pages
├── components/         # React components
├── config/            # Configuration
├── dto/               # Data validation schemas
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
├── middleware/        # Custom middleware
├── models/            # Data models
├── repositories/      # Data access layer
├── services/          # Business logic
├── types/             # TypeScript types
└── utils/             # Utility functions
```

## Code Style & Standards

### TypeScript

- Use strict mode: `"strict": true` in tsconfig.json
- Type all function parameters and return types
- Avoid `any` type unless absolutely necessary
- Use interfaces for object types, types for unions/primitives

### Naming Conventions

- **Files**: kebab-case (`user-service.ts`)
- **Components**: PascalCase (`UserProfile.tsx`)
- **Functions/Variables**: camelCase (`getUserById`)
- **Constants**: UPPER_SNAKE_CASE (`API_URL`)
- **Classes**: PascalCase (`UserService`)

### Code Organization

```typescript
// Order of imports
import external from 'npm-package'; // 1. External packages
import { internal } from '@/lib/utils'; // 2. Internal modules

// Function organization
export const fn = () => {};
export class Cls {}
export type Type = {};
```

## Making Changes

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Follow Commit Conventions

```bash
# Feature
git commit -m "feat: add user authentication"

# Bug fix
git commit -m "fix: resolve login validation error"

# Documentation
git commit -m "docs: update API documentation"

# Style
git commit -m "style: format code with prettier"

# Refactor
git commit -m "refactor: extract validation logic"

# Tests
git commit -m "test: add authentication tests"
```

### 3. Testing

```bash
# Run linting
npm run lint

# Run type checking
npx tsc --noEmit

# Build the project
npm run build
```

## Adding Features

### Adding a New API Endpoint

1. Create DTOs for validation:
```typescript
// src/dto/new-entity.dto.ts
export const CreateNewEntityDto = z.object({
  name: z.string(),
});
```

2. Create service:
```typescript
// src/services/new-entity.service.ts
export const newEntityService = {
  create: async (data) => { ... },
};
```

3. Create repository (if needed):
```typescript
// src/repositories/new-entity.repository.ts
export const newEntityRepository = {
  create: async (data) => { ... },
};
```

4. Create API route:
```typescript
// src/app/api/new-entity/route.ts
export async function POST(req: NextRequest) {
  // Implement endpoint
}
```

### Adding a New UI Component

1. Create component:
```typescript
// src/components/new-component.tsx
export default function NewComponent() {
  return <div>Component</div>;
}
```

2. Use in page:
```typescript
import NewComponent from '@/components/new-component';

export default function Page() {
  return <NewComponent />;
}
```

## Database Changes

### Creating Migrations

```bash
# Make changes to schema.prisma
# Then run:
npx prisma migrate dev --name describe_changes

# This creates a migration file in prisma/migrations/
```

### Verifying Changes

```bash
# Review migration
cat prisma/migrations/[timestamp]_describe_changes/migration.sql

# Rollback if needed
npx prisma migrate resolve --rolled-back [migration_name]
```

## Pull Request Process

1. **Before submitting**, ensure:
   - Code compiles without errors
   - No TypeScript errors
   - Tests pass
   - Commits are atomic and well-messaged

2. **Create PR** with description:
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation
   - [ ] Refactoring

   ## Testing
   How to test the changes

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex logic
   - [ ] Documentation updated
   - [ ] No new warnings generated
   ```

3. **Respond to feedback** and make requested changes

4. **Merge** once approved

## Documentation

### Code Comments

```typescript
/**
 * Creates a new user with the provided credentials
 * @param email - User's email address
 * @param password - User's password (will be hashed)
 * @returns Created user object without password
 */
export const createUser = (email: string, password: string) => {};
```

### README Updates

Update README.md when adding:
- New dependencies
- New API endpoints
- Breaking changes
- Configuration options

### API Documentation

Document new endpoints in README.md:

```markdown
#### Create User
```
POST /api/users
Headers: Authorization: Bearer <token>
Body: {
  "email": "user@example.com"
}
```
```

## Testing

### Unit Tests (Future)

```typescript
describe('authService', () => {
  it('should hash passwords correctly', async () => {
    // Test implementation
  });
});
```

### Manual Testing Checklist

- [ ] Feature works as expected
- [ ] Error handling works
- [ ] All inputs are validated
- [ ] No console errors
- [ ] Responsive design maintained
- [ ] Works on different browsers

## Performance Guidelines

1. **Database Queries**:
   - Use pagination for large datasets
   - Optimize queries with proper indexes
   - Avoid N+1 query problems

2. **Component Rendering**:
   - Use `React.memo()` for expensive components
   - Implement proper dependency arrays in hooks
   - Lazy load components when possible

3. **Bundle Size**:
   - Keep dependencies minimal
   - Use dynamic imports for large modules
   - Monitor bundle size with Next.js build output

## Security Guidelines

1. **Authentication**:
   - Never store plain passwords
   - Use proper hashing (bcryptjs)
   - Validate JWT tokens

2. **API Security**:
   - Validate all inputs with Zod
   - Implement proper error handling
   - Never leak sensitive data in errors

3. **Database Security**:
   - Use parameterized queries (Prisma handles this)
   - Apply principle of least privilege
   - Never hardcode credentials

4. **Code Security**:
   - Regular dependency updates
   - Security audit: `npm audit`
   - Avoid XSS vulnerabilities
   - Validate and sanitize inputs

## Common Issues & Solutions

### Issue: `npm install` fails

**Solution**:
```bash
npm install --legacy-peer-deps
```

### Issue: Database migration fails

**Solution**:
```bash
# Reset database (WARNING: deletes data)
npx prisma migrate reset --force
```

### Issue: Type errors after changes

**Solution**:
```bash
# Regenerate Prisma client
npx prisma generate

# Check for type errors
npx tsc --noEmit
```

## Questions & Support

- Open an issue for bugs
- Start a discussion for questions
- Email for security concerns
- Contact: +91-7700000766

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Code of Conduct

- Be respectful and inclusive
- Constructive feedback only
- No harassment or discrimination
- Report violations to maintainers

Thank you for contributing! 🎉
