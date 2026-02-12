# Teacher Curriculum Builder

An AI-powered curriculum building tool for educators. Upload your teaching materials and generate lesson plans, program outlines, and assessments using Claude AI.

## Features

- **Document Management**: Upload and organize PDFs, DOCX, and TXT files
- **AI-Powered Generation**: Generate lesson plans, program outlines, and assessments
- **Rich Text Editor**: Edit generated content with a full-featured editor
- **Export Options**: Download as PDF or DOCX
- **User Authentication**: Secure JWT-based authentication
- **Production Ready**: Rate limiting, compression, security headers

## Tech Stack

### Backend
- Node.js 20+ / Express / TypeScript
- Prisma ORM with PostgreSQL
- JWT authentication with refresh tokens
- Claude AI (Anthropic) for content generation
- PDF/DOCX export generation

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS
- TipTap rich text editor
- React Router v6

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/curriculum-builder.git
cd curriculum-builder

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# In backend directory
cp ../.env.example .env

# Edit .env with your settings:
# - Keep DATABASE_URL as SQLite for local dev
# - Add your CLAUDE_API_KEY (optional - uses mock data without it)
```

For local development with SQLite, use:
```
DATABASE_URL="file:./dev.db"
```

### 3. Initialize Database

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

---

## Production Deployment (DigitalOcean App Platform)

### Prerequisites
- DigitalOcean account
- GitHub repository with this code
- Claude API key from [Anthropic Console](https://console.anthropic.com/)

### Option 1: One-Click Deploy

1. Push code to GitHub
2. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
3. Click "Create App" → Select your GitHub repo
4. DigitalOcean will detect the `app.yaml` in `.do/` folder
5. Configure environment variables:
   - `JWT_SECRET`: Generate with `openssl rand -base64 32`
   - `REFRESH_SECRET`: Generate with `openssl rand -base64 32`
   - `CLAUDE_API_KEY`: Your Anthropic API key
6. Click Deploy

### Option 2: Using doctl CLI

```bash
# Install doctl
brew install doctl  # macOS
# or see: https://docs.digitalocean.com/reference/doctl/how-to/install/

# Authenticate
doctl auth init

# Deploy
doctl apps create --spec .do/app.yaml
```

### Option 3: Docker Compose (Self-Hosted)

```bash
# Set environment variables
export JWT_SECRET=$(openssl rand -base64 32)
export REFRESH_SECRET=$(openssl rand -base64 32)
export CLAUDE_API_KEY=your-api-key

# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec backend npx prisma migrate deploy
```

Access at http://localhost

---

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | No | development |
| `PORT` | Backend server port | No | 3001 |
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `JWT_SECRET` | Secret for JWT access tokens | Yes | - |
| `REFRESH_SECRET` | Secret for refresh tokens | Yes | - |
| `CLAUDE_API_KEY` | Anthropic API key | No | Uses mock data |
| `FRONTEND_URL` | Frontend URL for CORS | No | http://localhost:5173 |

---

## API Endpoints

### Authentication
```
POST /api/auth/register  - Create new account
POST /api/auth/login     - Login and get tokens
POST /api/auth/refresh   - Refresh access token
POST /api/auth/logout    - Logout (invalidate refresh token)
```

### Users
```
GET   /api/users/me      - Get current user profile
PATCH /api/users/me      - Update profile
```

### Projects
```
GET    /api/projects     - List all projects
POST   /api/projects     - Create new project
GET    /api/projects/:id - Get project with documents
PATCH  /api/projects/:id - Update project
DELETE /api/projects/:id - Delete project
```

### Documents
```
POST   /api/documents/upload - Upload document (multipart/form-data)
GET    /api/documents        - List documents
GET    /api/documents/:id    - Get document
DELETE /api/documents/:id    - Delete document
```

### Generations
```
POST  /api/generations/lesson     - Generate lesson plan
POST  /api/generations/program    - Generate program outline
POST  /api/generations/assessment - Generate assessment
GET   /api/generations            - List generations
GET   /api/generations/:id        - Get generation
PATCH /api/generations/:id        - Update generation
```

### Exports
```
POST /api/exports/pdf  - Export as PDF
POST /api/exports/docx - Export as DOCX
```

---

## Project Structure

```
curriculum-builder/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, rate limiting, errors
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic (Claude, export)
│   │   ├── types/          # TypeScript declarations
│   │   ├── utils/          # Helpers
│   │   └── server.ts       # Express app
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/            # API client
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── .do/
│   └── app.yaml            # DigitalOcean App Platform spec
├── docker-compose.yml      # Local Docker setup
├── .env.example
└── README.md
```

---

## Development Commands

### Backend
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run typecheck     # Type check without building
npm run prisma:studio # Open Prisma Studio
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## Security Features

- **Rate Limiting**: 100 requests/15min (API), 10/15min (auth)
- **Password Hashing**: bcrypt with 12 rounds
- **JWT Tokens**: 15min access, 7-day refresh
- **Helmet**: Security headers
- **CORS**: Configurable origins
- **Input Validation**: Zod schemas

---

## License

MIT
