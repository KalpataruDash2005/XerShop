# PrintHub Admin Dashboard

Admin dashboard for PrintHub platform built with Vite, React, and TypeScript.

## Features

- Dashboard with real-time statistics and charts
- User management (view, edit, suspend)
- Shop approval workflow
- Order management and tracking
- Payment transaction history
- CMS for banners and pages
- Platform settings

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build**: Vite
- **Routing**: React Router 6
- **State**: Zustand + TanStack Query
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
printhub-admin/
├── src/
│   ├── components/       # Reusable components
│   │   └── Layout.tsx    # Main layout with sidebar
│   ├── pages/
│   │   ├── dashboard/    # Dashboard stats and charts
│   │   ├── users/        # User list and details
│   │   ├── shops/        # Shop approval and management
│   │   ├── orders/       # Order tracking
│   │   ├── payments/     # Payment history
│   │   ├── cms/          # Banners and pages
│   │   └── settings/     # Platform configuration
│   ├── lib/              # API client, utilities
│   ├── store/            # Zustand stores
│   └── styles/           # Global CSS
├── index.html
└── package.json
```

## Pages

| Path | Description |
|------|-------------|
| `/login` | Admin login |
| `/dashboard` | Statistics overview |
| `/users` | User management |
| `/users/:id` | User details |
| `/shops` | Shop management |
| `/shops/:id` | Shop details |
| `/orders` | Order list |
| `/orders/:id` | Order details |
| `/payments` | Payment transactions |
| `/cms` | Content management |
| `/settings` | Platform settings |

## Environment Variables

Create `.env` file:
```env
VITE_API_URL=http://localhost:8080/api/v1
```

## Authentication

Admin uses JWT authentication. Only users with `ADMIN` or `SUPER_ADMIN` role can access the dashboard.

## Development

The admin dashboard runs on port 5173 by default and proxies API requests to the backend at localhost:8080.
