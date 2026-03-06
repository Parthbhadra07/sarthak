# SSTR Traders — Catalog + Orders + WhatsApp (Netlify)

## Features
- **Catalog website** with tabs: **Catalog**, **Cart**, **Orders**
- **Checkout** creates an order and shows a **Receipt** page (print/save as PDF)
- **Admin**: login/logout, add/delete products, view orders, update order status
- **Persistent storage**: Products + Orders stored in **Netlify Blobs**
- **WhatsApp Cloud API**:
  - Sends a **new order notification** to your business WhatsApp number
  - Sends a **receipt** to the customer (template if configured; otherwise a best-effort text fallback)

## Local development

### 1) Install
```bash
npm install
```

### 2) Run
For Netlify Functions + Blobs locally, use Netlify CLI:
```bash
npm install -g netlify-cli
netlify dev
```

If you run only Vite (`npm run dev`), calls to `/.netlify/functions/*` won’t work.

## Deploy to Netlify
1. Push this folder to GitHub.
2. In Netlify, **New site from Git** and select the repo.
3. Build settings are already in `netlify.toml`.
4. Set environment variables (below).

## Environment variables (Netlify Site settings → Environment variables)

### Admin auth
- `ADMIN_PASSWORD`: the password you’ll use on `/admin/login`
- `JWT_SECRET`: a long random secret string used to sign tokens

### Netlify Blobs
No extra env vars are needed when deployed on Netlify. (Blobs are automatically available in functions.)

### WhatsApp Cloud API
Required for sending messages:
- `WA_ACCESS_TOKEN`: permanent/long-lived access token
- `WA_PHONE_NUMBER_ID`: phone number id for your WhatsApp sender
- `WA_BUSINESS_NOTIFY_TO`: your business WhatsApp number in E.164 (example: `919999999999`)

Optional (recommended) for receipts:
- `WA_RECEIPT_TEMPLATE_NAME`: approved template name for receipts (template body variables are sent in this order: `customerName`, `orderId`, `total`, `receiptUrl`)

## URLs
- Customer:
  - `/catalog`
  - `/cart`
  - `/orders`
  - `/receipt/:orderId`
- Admin:
  - `/admin/login`
  - `/admin/products`
  - `/admin/orders`

## Notes about WhatsApp templates
- WhatsApp often requires **template messages** for outbound messages outside the 24-hour customer care window.
- This project will try a template if `WA_RECEIPT_TEMPLATE_NAME` is set, otherwise it falls back to a plain text message (which may not always deliver depending on WhatsApp rules).

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
