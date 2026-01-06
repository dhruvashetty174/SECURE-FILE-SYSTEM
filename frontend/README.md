# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Project-specific notes

This frontend is a simple React + Vite app that talks to the backend API.

- Set backend base URL in `.env` (example: `VITE_API_BASE_URL=http://localhost:5000`).
- Install dependencies: `npm install` inside `frontend/`.
- Run dev server: `npm run dev` inside `frontend/`.

Implemented pages and features:

- `/login` — login form
- `/register` — public registration
- `/dashboard` — authenticated file listing and upload
- `/download/:link` — public file download flow (passcode/default support)

Next steps / TODOs:

- Add rules UI (set passcode/expiry)
- Add tests for components and API flows
- Improve styling and accessibility
