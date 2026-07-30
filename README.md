# Expense Tracker - Production Ready

A minimal, aesthetic expense tracker built with Next.js, Supabase, and Tailwind CSS. Track spending under 5 seconds. Multi-tenant SaaS ready.

## Features

- ⚡ Add expenses in under 5 seconds
- 📊 Beautiful charts and analytics
- 💰 Budget tracking with alerts
- 🔒 Data isolated by user (RLS)
- 🌙 Dark mode support
- 📱 Mobile responsive
- 🔐 Google OAuth authentication

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Data Fetching:** React Query (TanStack Query)
- **Charts:** Recharts
- **Backend:** Next.js API routes
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth (Google OAuth)
- **Deployment:** Vercel

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier)

### Setup

1. **Clone and install**
```bash
cd expense-tracker
npm install
```

2. **Create `.env.local`** from `.env.example`
```bash
cp .env.example .env.local
```

3. **Get Supabase credentials**
   - Go to https://supabase.com
   - Create new project
   - Copy URL and anon key to `.env.local`

4. **Setup database**
   - In Supabase dashboard, SQL Editor
   - Create new query
   - Paste contents of `supabase/migrations/20240101000000_init.sql`
   - Run to create tables and RLS policies

5. **Configure Google OAuth**
   - In Supabase: Authentication → Providers → Google
   - Add credentials from Google Cloud Console
   - Set redirect URLs:
     - Development: `http://localhost:3000/auth/callback`
     - Production: `https://yourdomain.com/auth/callback`

6. **Run dev server**
```bash
npm run dev
```

Open http://localhost:3000

## Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── dashboard/       # Main dashboard
│   ├── login/          # Login page
│   ├── api/            # API routes
│   └── auth/           # Auth callback
├── components/         # Reusable UI components
├── context/            # React Context (auth)
├── hooks/              # React Query hooks
├── lib/                # Utilities and config
├── styles/             # Global CSS
└── types/              # TypeScript types

supabase/
└── migrations/         # Database setup

scripts/
└── seed.ts            # Seeding script
```

## API Routes

### Expenses
- `GET /api/expenses` - Fetch expenses (with filters)
- `POST /api/expenses` - Create expense
- `PATCH /api/expenses/[id]` - Update expense
- `DELETE /api/expenses/[id]` - Delete expense

### Categories
- `GET /api/categories` - List user categories
- `POST /api/categories` - Create category

### Dashboard
- `GET /api/dashboard` - Get dashboard stats

## Keyboard Shortcuts

- `Cmd/Ctrl + K` - Open quick add expense modal
- `Escape` - Close modal
- `Tab` - Navigate form fields

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Phase 2 complete"
git push origin main
```

2. **Create Vercel project**
   - Go to vercel.com
   - Import GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Deploy

3. **Update Supabase OAuth redirect**
   - Add production URL to Google OAuth providers

## Performance

- **Load Time:** < 2 seconds
- **First Contentful Paint:** < 1.5s
- **Lighthouse Score:** 90+

## Testing

```bash
# Run linter
npm run lint

# Type check
npm run type-check
```

## Database

Migrations run once on first setup. All tables have:
- Row-level security (RLS) for data isolation
- Indexes for fast queries
- Proper foreign key constraints
- Automatic updated_at timestamps

### Seeding

Default categories (18 total) and settings are automatically seeded on user signup.

## Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key

Optional:
- `SUPABASE_SERVICE_KEY` - For server-side operations (not used in Phase 2)

## Roadmap

### Phase 3 (Coming)
- Budget alerts (50%, 75%, 90%, 100%)
- Advanced filtering and search
- Settings page (currency, date format, theme)
- Analytics dashboard
- Export (CSV, PDF, JSON)
- Recurring expenses
- Mobile optimizations

### Phase 4 (Future)
- Income tracking
- Savings goals
- Investment tracking
- Tax reporting
- Bank syncing
- Receipt OCR

## Support

For issues or questions, refer to:
- Phase 1 Design: `PHASE_1_DESIGN.md`
- Phase 2 Summary: `PHASE_2_SUMMARY.md`

## License

Private project - Jolen only
"# test" 
