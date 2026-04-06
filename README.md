# TinhNguyenXanh

TinhNguyenXanh is a volunteer coordination platform for connecting volunteers, organizations, and administrators in one web app. The repository combines an Express/Mongoose API with a React + Vite frontend that is split into public pages, role-based dashboards, and reusable UI components.

## What stands out

- [public/App.tsx](public/App.tsx) uses `React.lazy()` and `Suspense` to split page bundles and keep the initial load smaller.
- [public/components/auth/RequireAuth.tsx](public/components/auth/RequireAuth.tsx) and the role constants in [public/constants/roles.ts](public/constants/roles.ts) protect routes by role, which is a straightforward pattern for mixed user types.
- [public/components/layout/MainLayout.tsx](public/components/layout/MainLayout.tsx) changes the shell based on the current route, so admin and organizer views can skip the public header and footer.
- [public/components/layout/Header.tsx](public/components/layout/Header.tsx) reads query parameters with `URLSearchParams`, then pushes filtered event searches back into React Router state.
- [public/components/layout/Header.tsx](public/components/layout/Header.tsx) also leans on Bootstrap’s collapse and dropdown behavior, which keeps the navigation responsive without custom state-heavy code.
- [public/styles/variables.css](public/styles/variables.css) uses CSS variables, `position: sticky`, and gradient layers for the header and search area, which makes the shell easy to tune without rewriting component styles.
- [public/App.css](public/App.css) uses `clamp()`, `object-fit`, and `line-clamp` for layout stability and text truncation on mixed-size cards and hero sections. See MDN for [`clamp()`](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp), [`object-fit`](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit), and [`line-clamp`](https://developer.mozilla.org/en-US/docs/Web/CSS/line-clamp).
- [app.js](app.js) mounts the API routes under a shared `/api/v1` prefix and serves uploaded files from `/uploads`, which keeps the deployment story simple.

## Libraries and tools worth noting

- [React](https://react.dev/) and [React Router](https://reactrouter.com/) drive the frontend routing model.
- [Vite](https://vite.dev/) handles the frontend build and dev server.
- [Express](https://expressjs.com/) powers the backend HTTP layer.
- [Mongoose](https://mongoosejs.com/) is used for MongoDB modeling and connection logic.
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) handles token-based auth.
- [express-validator](https://express-validator.github.io/) is present for request validation.
- [bcrypt](https://www.npmjs.com/package/bcrypt) is used for password hashing.
- [axios](https://axios-http.com/) is the HTTP client used by the frontend.
- [Bootstrap](https://getbootstrap.com/) and [Bootstrap Icons](https://icons.getbootstrap.com/) provide the base UI layer and icon set.
- [Radix UI Avatar](https://www.radix-ui.com/primitives/docs/components/avatar), [Dialog](https://www.radix-ui.com/primitives/docs/components/dialog), [Dropdown Menu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu), [Separator](https://www.radix-ui.com/primitives/docs/components/separator), and [Slot](https://www.radix-ui.com/primitives/docs/components/slot) are in the dependency tree for accessible primitives.
- [lucide-react](https://lucide.dev/) supplies the icon set used across the header and dashboards.
- [class-variance-authority](https://cva.style/), [clsx](https://github.com/lukeed/clsx), and [tailwind-merge](https://github.com/dcastil/tailwind-merge) support component class composition.
- [SweetAlert2](https://sweetalert2.github.io/) is available for richer confirmation and feedback flows.
- [slugify](https://www.npmjs.com/package/slugify) is useful for clean URL and label generation.

## Fonts

The UI uses [Inter](https://fonts.google.com/specimen/Inter) and [Poppins](https://fonts.google.com/specimen/Poppins) in [public/styles/variables.css](public/styles/variables.css). The fallback stack in [public/index.css](public/index.css) keeps the app readable if those fonts are unavailable.

## Project structure

```text
.
├── app.js
├── bin/
├── controllers/
├── public/
│   ├── assets/
│   ├── components/
│   │   ├── auth/
│   │   ├── examples/
│   │   ├── layout/
│   │   └── ui/
│   ├── constants/
│   ├── contexts/
│   ├── images/
│   │   ├── avatars/
│   │   ├── events/
│   │   └── organizations/
│   ├── lib/
│   ├── pages/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── events/
│   │   ├── organizations/
│   │   ├── organizer/
│   │   ├── public/
│   │   └── volunteer/
│   └── styles/
├── routes/
├── schemas/
├── scripts/
├── test/
├── utils/
├── package.json
├── tsconfig.json
└── vite.config.mjs
```

[controllers](controllers), [routes](routes), and [schemas](schemas) contain the backend application flow, request wiring, and data models. [public/components](public/components) holds reusable React pieces, while [public/pages](public/pages) groups the route-level screens by audience. [public/images](public/images) contains the branded assets and page imagery used throughout the UI.

## API surface

The backend exposes route groups for [auth](routes/auth.js), [events](routes/events.js), [organizations](routes/organizations.js), [volunteers](routes/volunteers.js), [payments](routes/payments.js), [moderation](routes/moderation.js), [admin](routes/admin.js), and [organizer](routes/organizer.js), all mounted from [app.js](app.js). The app also serves `uploads` as static files for user content and media.

## Notes for maintainers

- `npm run db:generate` and `npm run db:push` both run [scripts/db-generate.js](scripts/db-generate.js), which matches the current database workflow.
- The project uses a modern Mongoose connection path, so avoid legacy connection flags such as `useNewUrlParser` and `useUnifiedTopology`.
- The frontend build is configured in [vite.config.mjs](vite.config.mjs) to serve from `public` and emit to `dist`.

