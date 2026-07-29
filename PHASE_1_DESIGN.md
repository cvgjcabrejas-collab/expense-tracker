# Expense Tracker - Phase 1 Design Document

**Project:** Multi-tenant SaaS Expense Tracker  
**Phase:** 1 - Foundation (Database + Quick-Add UI + Dashboard)  
**Status:** Design Complete - Ready for Implementation Approval  
**Date:** July 30, 2026

---

## 1. Database Schema Design

### Overview
Normalized, multi-tenant schema with row-level security (RLS) for data isolation. All tables include `user_id` to ensure users only access their own data.

### Tables

#### `users` (Auth-managed by Supabase Auth)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```
- Linked to Supabase Auth (Google OAuth handles creation)
- No password storage—Google Login only
- Minimal user data to start; extensible for future features

---

#### `expenses` (Core transaction table)
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id),
  description TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT positive_amount CHECK (amount > 0)
);

CREATE INDEX idx_expenses_user_date ON expenses(user_id, date DESC);
CREATE INDEX idx_expenses_user_category ON expenses(user_id, category_id);
```

**Why this structure:**
- `id`: Unique identifier for each expense
- `user_id`: Multi-tenancy key; RLS will isolate data
- `amount`: Decimal for precise money handling
- `category_id`: Foreign key to categories (supports custom categories per user)
- `date` + `time`: Separate for efficient queries and time-of-day analysis
- `notes`: Optional; stores receipt details, tags, or context
- Indexes on user_id + date for fast dashboard queries
- Indexes on user_id + category for category filtering
- `CHECK` constraint ensures positive amounts (no negative expenses at this stage)

---

#### `categories` (User-customizable categories)
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color HEX COLOR DEFAULT '#2563EB',
  icon_name TEXT DEFAULT 'tag',
  is_default BOOLEAN DEFAULT FALSE,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_user_categories UNIQUE(user_id, name)
);

CREATE INDEX idx_categories_user ON categories(user_id);
```

**Why this structure:**
- `user_id`: Each user has their own category set
- Default categories seeded on signup (Food, Coffee, etc.)
- Users can create custom categories
- `color` + `icon_name`: Support aesthetic design (colored category badges)
- `order_index`: Allows reordering in UI
- `is_default`: Marks system default vs. user-created
- Unique constraint on (user_id, name) prevents duplicate category names per user

---

#### `budgets` (Budget limits and tracking)
```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID DEFAULT NULL REFERENCES categories(id),
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly')),
  limit_amount DECIMAL(12, 2) NOT NULL,
  month_year CHAR(7) DEFAULT NULL, -- 'YYYY-MM' for monthly budgets
  week_start DATE DEFAULT NULL, -- start date of week for weekly budgets
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT positive_limit CHECK (limit_amount > 0)
);

CREATE INDEX idx_budgets_user_period ON budgets(user_id, period);
CREATE INDEX idx_budgets_user_month ON budgets(user_id, month_year);
```

**Why this structure:**
- `category_id` nullable: NULL = overall budget for the period, specific ID = category-specific budget
- `period`: Weekly or monthly (no daily/yearly in MVP)
- `month_year`: Efficient filtering for "this month's budget"
- Supports multiple budgets simultaneously (overall + category-specific)

---

#### `settings` (User preferences)
```sql
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  currency TEXT DEFAULT 'USD',
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  budget_alert_threshold INT DEFAULT 80, -- alert at 80% of budget
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_settings_user ON settings(user_id);
```

**Why this structure:**
- One settings row per user
- `currency`: Future multi-currency support
- `theme`: Light/dark mode toggle
- `budget_alert_threshold`: 50%, 75%, 90%, 100% alerts configurable
- Extensible for future settings (language, timezone, etc.)

---

### Row-Level Security (RLS) Policies

All tables protected with RLS policies ensuring users only see/modify their own data:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Users can only see their own record
CREATE POLICY "users_own_record" ON users
  FOR ALL USING (auth.uid() = id);

-- Users can only see their own expenses
CREATE POLICY "expenses_own" ON expenses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "expenses_insert_own" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "expenses_update_own" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "expenses_delete_own" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Users can only see their own categories
CREATE POLICY "categories_own" ON categories
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "categories_insert_own" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "categories_update_own" ON categories
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "categories_delete_own" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Same pattern for budgets and settings
```

This ensures data isolation at the database level—even if a query is malformed, RLS prevents unauthorized access.

---

### Default Categories (Seeded on User Signup)
```
Food
Coffee
Groceries
Transportation
Gas
Shopping
Bills
Subscriptions
Entertainment
Health
Business
Family
Travel
Education
Savings
Investment
Gifts
Miscellaneous
```

---

## 2. User Flows

### Flow 1: Google OAuth Signup/Login

```
User lands on app
  ↓
Click "Sign in with Google"
  ↓
Redirected to Google OAuth
  ↓
Grant permissions
  ↓
Redirect back to app with auth token
  ↓
Supabase confirms user (new or existing)
  ↓
If NEW:
  - Create user record
  - Seed default categories
  - Create default settings
  - Redirect to onboarding OR dashboard
↓
If EXISTING:
  - Redirect to dashboard
```

**Key Decision:** No signup form—only Google OAuth. Simplifies auth, improves security, reduces friction.

---

### Flow 2: Quick-Add Expense (Under 5 Seconds)

```
User on dashboard
  ↓
Click "Add Expense" button (or keyboard shortcut)
  ↓
Modal/form opens (pre-focused on Amount field)
  ↓
User types amount (e.g., "12.50")
  ↓
User presses Tab or clicks Category dropdown
  ↓
User selects category (e.g., "Coffee")
  ↓
User types description (e.g., "Morning coffee" - OPTIONAL for speed)
  ↓
User presses Enter or clicks Save
  ↓
API call: POST /api/expenses
  ↓
Optimistic update: expense appears on dashboard immediately
  ↓
Form clears
  ↓
Focus returns to Amount field (ready for next entry)
  ↓
Server confirms (expense saved to DB)
```

**Timing Target:** 
- Open form: < 0.5s
- Type amount: 1-2s
- Select category: 1-2s
- Type description: optional
- Save: < 1s
- **Total: < 5s**

**Key Optimizations:**
- Form always open or one-click away
- Amount field focused by default
- Tab to cycle through fields
- Enter key to submit
- Optimistic updates (don't wait for server response to clear form)
- Pre-load category list

---

### Flow 3: Dashboard View

```
User logs in
  ↓
Query: Fetch today's expenses, this week's, this month's
  ↓
Query: Fetch categories (with colors/icons)
  ↓
Query: Fetch budgets for current period
  ↓
Dashboard renders with:
  - Today's total
  - This week's total
  - This month's total
  - Top spending category
  - Recent 10 expenses (sortable, clickable)
  - Monthly budget progress bar
  - Charts (daily/weekly/category breakdown)
  ↓
User can:
  - Filter by date range
  - Filter by category
  - Search by description
  - Click expense to edit/delete
  - Click category to drill-down
```

---

### Flow 4: Filtering & Search

```
User on dashboard
  ↓
Click filter icon / search bar
  ↓
Options appear:
  - Date range (Today, Yesterday, This Week, Last Week, This Month, Last Month, This Year, Custom)
  - Category (multi-select)
  - Amount range (min/max sliders)
  - Keyword search
  ↓
User selects filters
  ↓
Query updates in real-time (debounced)
  ↓
Dashboard re-renders with filtered results
  ↓
Results show count, total, and filtered expense list
```

---

## 3. Wireframes

### 3.1 Dashboard (Home Screen)

```
┌─────────────────────────────────────────┐
│ Expense Tracker        [Settings] [+Add] │
├─────────────────────────────────────────┤
│                                         │
│  TODAY'S SPENDING        THIS WEEK      │
│  $42.50                  $187.30        │
│                                         │
│  THIS MONTH              THIS YEAR      │
│  $1,245.67               $12,456.89     │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  MONTHLY BUDGET PROGRESS                │
│  ████████████░░░░░░░░░░░░░░░░░░  65%   │
│  $1,300 / $2,000                        │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  TOP SPENDING CATEGORY                  │
│  Food: $450 (36%)                       │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  RECENT EXPENSES         [Filters]      │
│  ┌────────────────────────────────────┐ │
│  │ Coffee        ☕  $5.50   Today    │ │
│  │ Groceries    🛒 $67.80  Today    │ │
│  │ Gas          ⛽ $52.00  Yesterday │ │
│  │ Dinner       🍽️  $38.45  Yesterday │ │
│  │ Subscription 📺 $14.99  2d ago    │ │
│  └────────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  SPENDING CHART (Last 7 Days)           │
│  [Line chart showing daily totals]      │
│                                         │
└─────────────────────────────────────────┘
```

**Design Notes:**
- Large, readable numbers (18-24px for totals)
- Color-coded categories with icons
- Progress bar visual feedback for budget
- Recent expenses as clickable cards
- Chart embedded for quick visual reference
- "+Add" button prominent, always accessible

---

### 3.2 Quick-Add Expense Modal

```
┌─────────────────────────────────────┐
│ Add Expense              [✕]        │
├─────────────────────────────────────┤
│                                     │
│ Amount *                            │
│ ┌─────────────────────────────────┐ │
│ │ 0.00                    [$]     │ │ (large input, auto-focus)
│ └─────────────────────────────────┘ │
│                                     │
│ Category *                          │
│ ┌─────────────────────────────────┐ │
│ │ Select category...        [▼]   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Description                         │
│ ┌─────────────────────────────────┐ │
│ │ What did you spend on?          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Date                                │
│ ┌─────────────────────────────────┐ │
│ │ 07/30/2026              [📅]    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Notes (optional)                    │
│ ┌─────────────────────────────────┐ │
│ │ Receipt, tags, anything else... │ │
│ └─────────────────────────────────┘ │
│                                     │
│          [Cancel]  [Save Expense]   │
│                                     │
└─────────────────────────────────────┘
```

**Design Notes:**
- Amount field takes 70% of width (prominent)
- Large input boxes with clear placeholder text
- Date defaults to today
- Description & Notes optional (encourage speed)
- Save button prominent, clear call-to-action
- Cancel minimized
- Smooth open/close animations

---

### 3.3 Analytics/Reports View

```
┌─────────────────────────────────────────┐
│ Analytics              [This Month ▼]   │
├─────────────────────────────────────────┤
│                                         │
│  SPENDING SUMMARY                       │
│  Daily Avg:    $42.19                   │
│  Weekly Avg:   $295.33                  │
│  Month Total:  $1,245.67                │
│  Largest:      $189.50 (Shopping)       │
│  Smallest:     $2.50 (Coffee)           │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  SPENDING BY CATEGORY (Pie Chart)       │
│  ┌───────────────────────────────────┐  │
│  │        [Pie chart visual]         │  │
│  │   Food: 36%  Shopping: 28%        │  │
│  │   Transport: 18%  Other: 18%      │  │
│  └───────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  TOP CATEGORIES                         │
│  1. Food:          $450.00 (36%)        │
│  2. Shopping:      $347.55 (28%)        │
│  3. Transportation: $223.80 (18%)       │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  MONTHLY TREND (Last 6 Months)          │
│  ┌───────────────────────────────────┐  │
│  │     [Line chart showing trend]    │  │
│  │   Trending: Slight increase       │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

**Design Notes:**
- Summary stats at top (scannable)
- Pie chart for category breakdown (visual)
- Line chart for trends (actionable insight)
- All charts interactive (hover for details)
- Period selector (This Month / Last Month / Custom)

---

### 3.4 Filters Sidebar

```
┌──────────────────────────┐
│ FILTERS                  │
├──────────────────────────┤
│                          │
│ Date Range:              │
│ ☐ Today                  │
│ ☐ Yesterday              │
│ ☐ This Week              │
│ ☐ Last Week              │
│ ☐ This Month             │
│ ☐ Last Month             │
│ ☐ This Year              │
│ ☐ Custom Range           │
│   [From] [To]            │
│                          │
├──────────────────────────┤
│                          │
│ Category:                │
│ ☑ Food                   │
│ ☑ Coffee                 │
│ ☐ Groceries              │
│ ☐ Transportation         │
│ ☐ Gas                    │
│ ☑ Shopping               │
│ [View All]               │
│                          │
├──────────────────────────┤
│                          │
│ Amount Range:            │
│ Min: [$0.00]             │
│ Max: [$500.00]           │
│                          │
├──────────────────────────┤
│                          │
│ Search:                  │
│ [Search by keyword...]   │
│                          │
├──────────────────────────┤
│                          │
│ [Apply Filters]  [Reset] │
│                          │
└──────────────────────────┘
```

**Design Notes:**
- Sidebar or modal depending on screen size
- Date range has quick options + custom
- Multi-select checkboxes for categories
- Sliders for amount range (visual)
- Search box for keyword filtering
- Apply/Reset buttons

---

## 4. Component Architecture

### Component Tree

```
<App>
├── <AuthProvider>
│   ├── <Layout>
│   │   ├── <Header>
│   │   │   ├── Logo
│   │   │   ├── SearchBar
│   │   │   └── UserMenu
│   │   ├── <Sidebar>
│   │   │   ├── NavLinks
│   │   │   └── SettingsToggle
│   │   └── <MainContent>
│   │       ├── <Dashboard>
│   │       │   ├── <SummaryCards>
│   │       │   ├── <BudgetProgress>
│   │       │   ├── <TopCategory>
│   │       │   ├── <RecentExpenses>
│   │       │   ├── <SpendingChart>
│   │       │   └── <Filters>
│   │       ├── <Analytics>
│   │       │   ├── <SummaryStats>
│   │       │   ├── <PieChart>
│   │       │   ├── <TopCategories>
│   │       │   └── <TrendChart>
│   │       ├── <Settings>
│   │       └── <ExpenseDetail>
│   └── <QuickAddModal>
│       ├── <AmountInput>
│       ├── <CategorySelect>
│       ├── <DescriptionInput>
│       ├── <DatePicker>
│       ├── <NotesInput>
│       └── <ActionButtons>
└── <ToastNotification>
```

---

### TypeScript Interfaces

```typescript
// User
interface User {
  id: string; // UUID from Supabase Auth
  email: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Expense (core entity)
interface Expense {
  id: string; // UUID
  userId: string;
  amount: number; // Decimal, e.g., 12.50
  categoryId: string; // UUID
  description: string;
  date: Date;
  time?: string; // HH:MM format
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Category (user-customizable)
interface Category {
  id: string;
  userId: string;
  name: string;
  color: string; // Hex, e.g., #2563EB
  iconName: string; // icon identifier
  isDefault: boolean;
  orderIndex: number;
  createdAt: Date;
}

// Budget
interface Budget {
  id: string;
  userId: string;
  categoryId?: string; // null = overall budget
  period: 'weekly' | 'monthly';
  limitAmount: number;
  monthYear?: string; // 'YYYY-MM'
  weekStart?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Settings
interface Settings {
  id: string;
  userId: string;
  currency: string; // 'USD', 'EUR', etc.
  theme: 'light' | 'dark';
  dateFormat: string; // 'MM/DD/YYYY', etc.
  notificationsEnabled: boolean;
  budgetAlertThreshold: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ExpenseWithCategory extends Expense {
  category: Category;
}

// Dashboard Stats
interface DashboardStats {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  yearTotal: number;
  transactionCount: number;
  topCategory: { name: string; amount: number; percentage: number };
  budgetProgress: number; // 0-100
}
```

---

### State Management Pattern

**Use React Context + useReducer for:**
- User auth state
- Expenses list
- Filters (date, category, amount range)
- UI state (modal open/close, loading)

**Use React Query (TanStack Query) for:**
- Server data fetching
- Caching & revalidation
- Background sync

**Example:**
```typescript
// ExpenseContext
const ExpenseContext = createContext<{
  expenses: Expense[];
  filters: ExpenseFilters;
  setFilters: (filters: ExpenseFilters) => void;
  addExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}>(null);

// Use in components
const { expenses, filters, setFilters } = useContext(ExpenseContext);
```

---

### Key Component Behaviors

**<QuickAddModal>:**
- Opens with amount field focused
- Tab cycles through fields: Amount → Category → Description → Date → Notes
- Enter submits; Escape closes
- Optimistic update on submit (show expense immediately)
- Clear form after successful save
- Show toast notification on success/error

**<RecentExpenses>:**
- Load last 10 expenses by default
- Clickable rows open edit/delete modal
- Show category badge with color & icon
- Display relative time (e.g., "2 hours ago")
- Pagination or infinite scroll for older entries

**<SpendingChart>:**
- Recharts library for rendering
- Responsive: full-width on mobile, fixed on desktop
- Interactive tooltips on hover
- Click data point to drill-down by day/category
- Smooth animations on load

**<Filters>:**
- Debounce search input (300ms) to avoid excessive queries
- Multi-select categories with checkboxes
- Slider for amount range
- Date range with quick presets + custom picker
- Apply filters immediately (no button needed) or use Apply button for batch changes
- Show active filter count

---

## 5. Technical Decisions

### Why Supabase?
- **Auth:** Google OAuth built-in, no password management
- **Database:** PostgreSQL with RLS (data isolation at DB level)
- **Real-time:** Realtime subscriptions for live updates (Phase 2)
- **Simplicity:** No backend code needed for MVP; use Edge Functions for complex logic later

### Why React + TypeScript?
- **Type Safety:** Catch errors at compile time; reduces bugs
- **Component Reusability:** Build once, use many times (DRY)
- **Ecosystem:** Rich libraries (React Query, shadcn/ui, Recharts)
- **Performance:** Virtual DOM optimization; only re-render what changed

### Why Next.js?
- **API Routes:** Minimal backend setup; serverless functions
- **Deployment:** Direct to Vercel with one-click deployment
- **Performance:** Image optimization, automatic code splitting
- **File-based Routing:** Intuitive file structure

### Why Recharts?
- **Beautiful by Default:** Aesthetic charts without manual styling
- **Responsive:** Adapts to screen size
- **Interactive:** Tooltips, legends, click handlers
- **Lightweight:** ~55KB minified

### Why shadcn/ui?
- **Accessibility:** Built on Radix UI (WCAG compliant)
- **Aesthetic:** Modern, clean components
- **Customizable:** Tailwind CSS—modify colors/spacing easily
- **Copy-Paste:** Components ship as code, not black boxes

### State Management: Context + React Query
- **Context API:** Lightweight, built-in, sufficient for MVP
- **React Query:** Handles server state, caching, background sync
- **Not Redux:** Overkill for this scope; adds complexity without benefit

### Decimal Precision for Money
- Use `DECIMAL(12, 2)` in database (precise to cent)
- Use JavaScript `Decimal.js` library or BigInt for calculations (avoid floating-point errors)
- Display with `.toFixed(2)` for UI

### RLS for Multi-Tenancy
- Row-level security policies enforce data isolation at database level
- No need for application-level auth checks on queries
- Fail-safe: if query is misconfigured, RLS still prevents unauthorized access

### Optimistic Updates
- When user saves an expense, show it on UI immediately (don't wait for server)
- Update Supabase in background
- If server rejects, roll back and show error toast
- Gives perception of speed (under 5 seconds)

---

## 6. API Endpoints (Next.js Routes)

**Phase 1 Core APIs:**

```
GET /api/expenses
  Query params: startDate, endDate, categoryId, minAmount, maxAmount
  Returns: Expense[]

POST /api/expenses
  Body: { amount, categoryId, description, date, notes }
  Returns: Expense (with id)

PATCH /api/expenses/[id]
  Body: Partial<Expense>
  Returns: Expense

DELETE /api/expenses/[id]
  Returns: { success: boolean }

GET /api/categories
  Returns: Category[]

POST /api/categories
  Body: { name, color, iconName }
  Returns: Category

GET /api/dashboard
  Returns: DashboardStats

GET /api/budgets
  Query params: period (weekly|monthly)
  Returns: Budget[]
```

All endpoints use Supabase RLS (no server-side auth needed—RLS enforces data isolation).

---

## 7. Database Seeding

On user signup, seed:
- Default categories (19 items)
- Default settings (currency: USD, theme: light, etc.)

```typescript
async function seedUserData(userId: string) {
  const categories = [
    { name: 'Food', color: '#F59E0B', iconName: 'utensils' },
    { name: 'Coffee', color: '#78350F', iconName: 'coffee' },
    { name: 'Groceries', color: '#16A34A', iconName: 'shopping-cart' },
    // ... 16 more
  ];

  await supabase
    .from('categories')
    .insert(categories.map(cat => ({ user_id: userId, ...cat })));

  await supabase
    .from('settings')
    .insert({
      user_id: userId,
      currency: 'USD',
      theme: 'light',
      // ... defaults
    });
}
```

---

## 8. Performance Considerations

### Load Time Target: < 2 seconds

**Optimizations:**
- **Code Splitting:** Next.js automatically splits by route
- **Image Optimization:** Next.js Image component for responsive images
- **CSS-in-JS:** Tailwind CSS (tree-shaking removes unused styles)
- **Database Queries:** Indexed on user_id + date for fast filtering
- **Caching:** React Query caches expenses; minimal re-fetches
- **Lazy Loading:** Dashboard charts load after critical content

### Keyboard Shortcuts for Speed
- `Cmd/Ctrl + K`: Open quick-add modal
- `Escape`: Close modal
- `Tab`: Cycle through form fields
- `Enter`: Submit form

---

## 9. Deployment Architecture

**Stack:**
- **Frontend:** Vercel (Next.js)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Google OAuth)

**Deployment Flow:**
1. Push code to GitHub
2. Vercel auto-deploys on every push to `main`
3. Environment variables stored in Vercel dashboard
4. Database migrations applied manually (Phase 2 automation)

**Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_KEY=[service-key] # for sensitive operations
```

---

## 10. Phase 1 Summary

### What's Built
✅ Database schema (normalized, RLS-protected)
✅ User flows (auth, quick-add, dashboard, filters)
✅ Wireframes (dashboard, quick-add, analytics, filters)
✅ Component architecture (React structure, TypeScript types)
✅ API route design
✅ Performance strategy

### What's Ready for Implementation
✅ All database tables designed
✅ Component structure defined
✅ TypeScript interfaces ready
✅ Deployment pipeline ready (Vercel + Supabase)
✅ Auth flow documented

### Phase 2 Deliverables
- Implement UI components (dashboard, quick-add modal, filters)
- Wire up Supabase (migrations, RLS policies)
- Build API routes
- Integrate auth (Google OAuth)
- Test optimistic updates
- Performance validation

---

## 11. Key Design Principles Embedded in Phase 1

1. **Under 5 Seconds to Add Expense:** Optimistic updates + focused form design
2. **Aesthetic + Interactive:** Recharts for beautiful charts, shadcn/ui for polished components, smooth animations
3. **Multi-Tenant SaaS:** RLS at database level, user_id on every table, isolation by design
4. **Scalable:** Normalized schema, indexed queries, prepared for future features (income, investments, etc.)
5. **Type-Safe:** Full TypeScript coverage, strong interfaces
6. **Performance-First:** < 2s load time, instant filtering, cached queries

---

## Approval Checkpoint

**Ready to proceed to Phase 2 (Implementation)?**

- [ ] Database schema approved
- [ ] Component architecture approved
- [ ] User flows approved
- [ ] Wireframes approved
- [ ] Tech stack approved

**Questions or changes before Phase 2?**

Please review and confirm above before we begin building the UI and wiring up Supabase.
