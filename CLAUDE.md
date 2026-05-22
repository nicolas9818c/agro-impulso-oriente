# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Agro Impulso Oriente

Fair-trade e-commerce platform connecting Colombian farmers (Orinoquía / Vichada region) directly with buyers. Spanish-language UI throughout.

## Commands

From the repo root:

```bash
npm install          # Install all workspace dependencies
npm run dev          # Start all three apps (web :3000, api :3001, pocketbase)
npm run build        # Build the web app → dist/apps/web
npm run lint         # Lint web + api
```

Per-app (from root):

```bash
npm run dev --prefix apps/web
npm run dev --prefix apps/api
npm run dev --prefix apps/pocketbase
```

## Architecture

### Monorepo layout

```
/
├── apps/web/        React + Vite frontend (port 3000)
├── apps/api/        Express.js backend (port 3001) — Stripe webhooks only
└── apps/pocketbase/ PocketBase binary + migrations + hooks
```

### Two separate data backends

**PocketBase** (`apps/pocketbase/`) is the primary database and auth layer. The frontend talks to it directly via the JS SDK; the URL proxy path is `/hcgi/platform` (see `apps/web/src/lib/pocketbaseClient.js`). Collections: `users`, `products`, `orders`, `cart_items`, `productores`, `articles`, `promotions`, `reviews`, `seller_ratings`, `contactos`, `productores_solicitudes`, `compradores_solicitudes`.

**Hostinger Ecommerce API** (`apps/web/src/api/EcommerceApi.js`) is a secondary product/checkout API at `https://api-ecommerce.hostinger.com`. It handles Hostinger storefront products and checkout flow, completely separate from PocketBase products.

**Express API** (`apps/api/`) is thin: it only handles Stripe webhook events and `/health`. Does not own any other routes.

### Frontend (`apps/web/src/`)

- **`App.jsx`** — router root. Two user roles: `seller` (role = `'seller'` | `'admin'`) and buyer. Seller routes (`/vendedor/*`) guarded by `<ProtectedRoute requireSeller>`.
- **`contexts/AuthContext.jsx`** — wraps PocketBase auth. Exposes `currentUser`, `isAuthenticated`, `isSeller`, `isAdmin`, `login`, `signup`, `logout`. Persists via PocketBase's built-in auth store.
- **`hooks/useCart.jsx`** — cart in `localStorage` (`e-commerce-cart`). Items store full product + variant objects; total is computed at read time.
- **`lib/pocketbaseClient.js`** — singleton `pb` client. Always import this to query collections directly from components/pages.
- **`api/EcommerceApi.js`** — `getProducts`, `getProduct`, `getProductQuantities`, `getCategories`, `initializeCheckout` for the Hostinger store. Completely separate from PocketBase products.

### User roles

`users.role`: `'buyer'` (default), `'seller'`, `'admin'`. `isSeller` is `true` for both `seller` and `admin`. Protected seller routes redirect to `/` if not a seller.

### PocketBase

- Migrations in `pb_migrations/` run automatically on startup.
- Hooks in `pb_hooks/` are JSVM JavaScript: `order-confirmation.pb.js`, `builder-mailer.pb.js`, `external-dashboard.pb.js`.
- Products schema key fields: `name`, `description`, `category` (select), `price`, `stock`, `images` (file×5), `specifications`, `vendorId`, `location` (select), `available` (bool), `discount`, `soldCount`, `rating`, `reviewCount`, `freeShipping`, `isNew`, `isTrending`.
- Product `updateRule`: `vendorId = @request.auth.id` — sellers can only edit their own products.

### Styling

- **Color palette** (defined as CSS variables in `src/index.css`): primary = deep forest green (`hsl(152 60% 22%)`), secondary = Colombian gold/amber (`hsl(36 88% 42%)`), accent = Orinoquía terracotta (`hsl(14 58% 32%)`).
- **Fonts**: Playfair Display (headings — serif), DM Sans (body/UI).
- **Components**: shadcn/ui in `src/components/ui/`. Add new ones via `shadcn` CLI.
- **Custom classes** in `index.css`: `.container-custom`, `.card-elevation`, `.glass-panel`, `.btn-transition`, `.badge-primary/secondary/accent`, `.category-tag`, `.news-card`, `.section-divider`, `.cta-banner`.
- Framer Motion for page/section animations.

## Key conventions

- Path alias `@/` → `apps/web/src/` (vite + jsconfig).
- All PocketBase queries use `$autoCancel: false` to prevent cancellation on re-renders.
- Toasts via `sonner` (`import { toast } from 'sonner'`).
- Forms use `react-hook-form` + `zod`.
- Delete confirmations use shadcn `AlertDialog`, not `window.confirm`.
- All routes, labels, and copy are in **Spanish**.
- Product prices are stored in full COP (pesos colombianos), not cents. Format with `.toLocaleString('es-CO')`.
