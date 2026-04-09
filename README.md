# TinhNguyenXanh Node.js Platform

TinhNguyenXanh is a volunteer coordination platform for connecting volunteers, organizations, and administrators in one web app. The repository combines an Express/Mongoose API with a React + Vite frontend that is split into public pages, role-based dashboards, and reusable UI components.

Core entry points and modules:
- Backend app bootstrap: [app.js](app.js)
- API routing layer: [routes](routes/)
- Business logic controllers: [controllers](controllers/)
- Data schemas: [schemas](schemas/)
- Frontend app shell and route graph: [public/App.tsx](public/App.tsx)
- Frontend API client layer: [public/lib/api.ts](public/lib/api.ts)

## Interesting Techniques

- Route-level code splitting with React lazy loading and suspense boundaries in [public/App.tsx](public/App.tsx), built on JavaScript [import()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import).
- Event-driven auth invalidation with browser [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent) between [public/lib/api.ts](public/lib/api.ts) and [public/contexts/AuthContext.tsx](public/contexts/AuthContext.tsx).
- Cookie-first JWT session flow with Bearer fallback in [utils/authHandler.js](utils/authHandler.js) and [routes/auth.js](routes/auth.js), aligned with [Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie).
- Payment webhook signature verification using HMAC-SHA256 in [controllers/paymentController.js](controllers/paymentController.js), following the [HMAC](https://developer.mozilla.org/en-US/docs/Glossary/HMAC) model.
- Single-flight MongoDB connection bootstrapping in [utils/mongo-connection.js](utils/mongo-connection.js) to avoid duplicate concurrent connects.
- Lazy model resolution with runtime guards in [utils/models.js](utils/models.js), so missing model registration fails early and clearly.
- Stable API serialization for ObjectId and Decimal128 values in [utils/mongo.js](utils/mongo.js).
- Query efficiency patterns with Mongoose `lean()` and targeted `populate()` in files like [controllers/eventController.js](controllers/eventController.js) and [controllers/organizerController.js](controllers/organizerController.js).
- CSS accessibility and layout primitives such as [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), [clamp()](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp), and [overscroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior) in [public/App.css](public/App.css) and [public/styles/variables.css](public/styles/variables.css).

## Non-Obvious Libraries and Technologies

- [Radix UI Primitives](https://www.radix-ui.com/primitives): composable headless UI primitives used in [public/components/ui](public/components/ui/).
- [class-variance-authority](https://cva.style/docs): typed variant system for components, used in [public/components/ui/button.tsx](public/components/ui/button.tsx).
- [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge): class composition and conflict resolution in [public/lib/utils.ts](public/lib/utils.ts).
- [Lucide React](https://lucide.dev/guide/packages/lucide-react): icon system used across [public/components](public/components/) and [public/pages](public/pages/).
- [SweetAlert2](https://sweetalert2.github.io/): async feedback and confirmation dialogs in files such as [public/components/EventRegistrationForm.tsx](public/components/EventRegistrationForm.tsx).
- [Nodemailer](https://nodemailer.com/about/): email transport setup in [utils/mailer.js](utils/mailer.js).
- [MoMo Developer Platform](https://developers.momo.vn/): external payment flow integrated in [controllers/paymentController.js](controllers/paymentController.js).

### Fonts used in UI styles

- [Inter](https://fonts.google.com/specimen/Inter) referenced in [public/styles/variables.css](public/styles/variables.css)
- [Poppins](https://fonts.google.com/specimen/Poppins) referenced in [public/styles/variables.css](public/styles/variables.css)

## Project Structure

```text
.
├── app.js
├── package.json
├── tsconfig.json
├── vite.config.mjs
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
│   └── output/
├── test/
├── sample/
│   └── jira/
└── utils/
```

Interesting directories:
- [controllers](controllers/): API business logic grouped by domain (auth, events, moderation, organizer, admin, payments).
- [schemas](schemas/): Mongoose schema definitions for users, events, organizations, moderation, and donations.
- [public/components/ui](public/components/ui/): reusable UI primitives for consistent interaction and styling.
- [public/lib](public/lib/): shared frontend infrastructure (API layer, error normalization, utilities).
- [scripts](scripts/): database helpers and reusable smoke-test tooling.
- [routes](routes/): HTTP contract surface that maps requests to controller methods.
