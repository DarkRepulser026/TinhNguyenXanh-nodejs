# Available Scripts

## Setup

```bash
npm install
```

## NPM Scripts (from package.json)

```bash
npm run start
npm run dev:backend
npm run dev:frontend
npm run build:frontend
npm run preview:frontend
npm run smoke:test
npm run db:generate
npm run db:push
npm run db:seed
npm run db:reset
```

## What each script does

1. `npm run start`:
Runs backend with nodemon (`./bin/www`).

2. `npm run dev:backend`:
Runs backend development server with nodemon (`./bin/www`).

3. `npm run dev:frontend`:
Starts Vite frontend development server.

4. `npm run build:frontend`:
Builds frontend for production with Vite.

5. `npm run preview:frontend`:
Previews the production frontend build locally.

6. `npm run smoke:test`:
Runs reusable backend smoke test checks.

7. `npm run db:generate`:
Runs database generation script (`scripts/db-generate.js`).

8. `npm run db:seed`:
Populates demo database records (`scripts/db-seed.js`).

9. `npm run db:reset`:
Drops the entire configured MongoDB database (`scripts/db-reset.js`).

## Database reset and seed flow

```bash
npm run db:reset
npm run db:generate
npm run db:seed
```

## Smoke test optional flags

```bash
npm run smoke:test -- --help
npm run smoke:test -- --base-url http://localhost:3001
npm run smoke:test -- --token YOUR_JWT
npm run smoke:test -- --token YOUR_JWT --expect-auth 200,403
```