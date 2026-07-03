# PrintHub Web - Next.js Frontend

PrintHub customer-facing website built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- Modern, responsive UI with print-shop themed design
- Document upload with drag & drop
- Live price calculator
- Shop discovery with geolocation
- Real-time order tracking
- Secure checkout with Razorpay

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

## Project Structure

```
printhub-web/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── layout/       # Layout components
│   │   ├── home/         # Home page sections
│   │   ├── orders/       # Order-related components
│   │   ├── shops/        # Shop-related components
│   │   └── auth/         # Auth-related components
│   ├── lib/              # Utilities and API client
│   ├── store/            # Zustand stores
│   ├── hooks/            # Custom React hooks
│   └── styles/           # Global styles
├── public/               # Static assets
└── package.json
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home page with hero and features |
| `/login` | User login |
| `/register` | User registration |
| `/shops` | Find nearby print shops |
| `/shops/[id]` | Shop details |
| `/upload` | Document upload |
| `/configure` | Print options configuration |
| `/checkout` | Payment and checkout |
| `/orders` | Order history |
| `/orders/[id]` | Order details and tracking |

## Components

### UI Components
- `Button` - Primary, secondary, outline, ghost variants
- `Input` - Text input with label and error handling
- `Card` - Content card with header, body, footer
- `Badge` - Status badges with color variants

### Design System
- Primary: `#2F6FED` (Indigo Blue)
- Secondary: `#1A2740` (Deep Navy)
- Accent: `#22D3EE` (Cyan)
- Success: `#16A34A` (Emerald)
- Warning: `#F59E0B` (Amber)
- Error: `#DC2626` (Rose)
