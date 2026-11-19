# CWAD Fullstack Monorepo

A professional fullstack monorepo foundation designed for real applications, not a demo-only scaffold.

The repository contains a React/Vite web application, an Express/TypeScript API, reusable shared packages, centralized validation/contracts, workspace-level tooling, Docker development infrastructure, tests, CI, security middleware, structured logging, and production-oriented application boundaries.

## Architecture

```text
cwad-fullstack-monorepo/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── middlewares/
│   │   │   ├── routes/
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   ├── tests/
│   │   ├── .env.example
│   │   ├── eslint.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/
│       ├── src/
│       │   ├── components/
│       │   ├── config/
│       │   ├── lib/
│       │   ├── pages/
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── styles.css
│       ├── tests/
│       ├── .env.example
│       ├── eslint.config.js
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
│
├── packages/
│   ├── config/
│   ├── types/
│   ├── utils/
│   └── validation/
│
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker/
│   ├── api.Dockerfile
│   └── web.Dockerfile
├── docker-compose.yml
├── package.json
├── turbo.json
├── tsconfig.base.json
└── README.md
```

## Technology

Current package baselines are pinned around the current stable ecosystem:

- React 19.3
- Vite 8.3
- Express 5.2
- Turborepo 2.11
- TypeScript 5.9
- Zod
- Pino
- Helmet
- CORS
- Vitest
- ESLint
- Prettier

## Requirements

- Node.js 20+
- npm 10+
- Docker Desktop is optional for containerized development

## Install

```bash
npm install
```

## Development

Start web and API together:

```bash
npm run dev
```

Applications:

```text
Web: http://localhost:5173
API: ${process.env.NEXT_PUBLIC_API_URL}
Health: ${process.env.NEXT_PUBLIC_API_URL}/api/v1/health
Readiness: ${process.env.NEXT_PUBLIC_API_URL}/api/v1/ready
```

## Environment

API:

```bash
cp apps/api/.env.example apps/api/.env
```

Windows PowerShell:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

Web:

```bash
cp apps/web/.env.example apps/web/.env
```

Public Vite variables use the `VITE_` prefix.

Never put secrets in `VITE_*` variables.

## Build

```bash
npm run build
```

Then start production applications:

```bash
npm run start
```

## Docker

Build and run both applications:

```bash
docker compose up --build
```

Stop:

```bash
docker compose down
```

## Quality

```bash
npm run lint
npm run typecheck
npm run test
npm run format:check
```

## Shared packages

### `@cwad/types`

Shared TypeScript contracts.

### `@cwad/validation`

Shared Zod schemas. This is where request/response validation can live without duplicating schemas between applications.

### `@cwad/utils`

Framework-independent reusable utilities.

### `@cwad/config`

Reserved package for shared configuration primitives. Application-specific runtime configuration remains inside each application.

## API architecture

The API follows:

```text
Route
  ↓
Controller
  ↓
Service boundary
  ↓
External / database capability
```

Cross-cutting concerns are handled through middleware:

```text
Request
  ↓
Helmet
  ↓
CORS
  ↓
JSON parser
  ↓
Request logger
  ↓
Route
  ↓
Error handler
```

The template intentionally leaves database/auth implementations out of the base template. They should be added by capability modules rather than becoming mandatory dependencies for every project.

## API endpoints

### Health

```http
GET /api/v1/health
```

Response:

```json
{
  "status": "ok",
  "service": "api",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

### Readiness

```http
GET /api/v1/ready
```

Used as the application readiness boundary. Capability modules can extend this check when a database, cache, queue, or external service is introduced.

## Testing

API tests:

```bash
npm run test --workspace=@cwad/api
```

Web tests:

```bash
npm run test --workspace=@cwad/web
```

Shared package tests:

```bash
npm run test --workspace=@cwad/validation
```

## CI

GitHub Actions runs:

1. Install dependencies
2. Typecheck
3. Lint
4. Test
5. Build

The workflow is intentionally simple so it can be extended with deployment, database migrations, security scanning, or release automation.

## Design rule

Do not turn this monorepo into a dependency dump.

The base template provides the architecture required by most serious fullstack applications. Optional capabilities such as:

- PostgreSQL
- Prisma
- Redis
- BullMQ
- Authentication
- OAuth
- S3/object storage
- WebSockets
- OpenTelemetry

should be composed into the generated project only when selected.

That keeps CWAD-generated projects fast, understandable, and maintainable.
