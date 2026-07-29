# Expense Tracker - Launch Step-by-Step Guide

**Time Required:** 30-45 minutes  
**Difficulty:** Beginner-friendly  
**Goal:** Get the app running locally, then deployed to production

---

## Part 1: Set Up Supabase (5 minutes)

### Step 1.1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub or email
4. Create new project:
   - **Name:** expense-tracker (or your choice)
   - **Password:** Create a strong password (you won't need this again)
   - **Region:** Choose closest to you
   - Click "Create new project"

⏳ **Wait 2-3 minutes for project to spin up**

### Step 1.2: Get Your Credentials
1. In Supabase dashboard, click "Connect"
2. Copy these two values and save them somewhere safe:
   - `NEXT_PUBLIC_SUPABASE_URL` (looks like: `https://xxxxx.supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (long string starting with `eyJ...`)
3. Keep this tab open (you'll use it again)

---

## Part 2: Set Up Database (3 minutes)

### Step 2.1: Run Migrations
1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Paste the entire contents from this file:
   - Location: `supabase/migrations/20240101000000_init.sql`
   - You can find it in the project folder
4. Click **"Run"** (green play button)
5. Wait for success message

✅ **Your database is now set up with all tables and security policies**

---

## Part 3: Configure Google OAuth (5 minutes)

### Step 3.1: Create Google Cloud Project
1. Go to https://console.cloud.google.com
2. Click project dropdown (top left) → "New Project"
3. Name: `Expense Tracker`
4. Click "Create"
5. Wait for creation

### Step 3.2: Enable Google OAuth
1. Search for "OAuth" in Google Cloud search bar
2. Click "OAuth consent screen" (left sidebar)
3. Choose "External" → Click "Create"
4. Fill in:
   - **App name:** Expense Tracker
   - **User support email:** your-email@gmail.com
   - **Developer contact:** your-email@gmail.com
   - Click "Save and Continue"
5. Click "Save and Continue" twice more (skip optional sections)
6. Click "Back to Dashboard"

### Step 3.3: Create OAuth Credentials
1. Go to **Credentials** (left sidebar)
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. Choose **"Web application"**
4. Fill in:
   - **Name:** Expense Tracker Web
   - **Authorized JavaScript origins:** Add both:
     - `http://localhost:3000` (for local testing)
     - `https://yourdomain.com` (for production - update later)
   - **Authorized redirect URIs:** Add:
     - `http://localhost:3000/auth/callback`
     - `https://yourdomain.com/auth/callback` (update after Vercel deployment)
5. Click "Create"
6. Copy your **Client ID** and **Client Secret** somewhere safe

### Step 3.4: Add to Supabase
1. Go back to Supabase dashboard
2. Go to **Authentication** → **Providers** (left sidebar)
3. Find **Google** and click it
4. Toggle **"Enable Google"**
5. Paste your **Client ID** and **Client Secret** from Google Cloud
6. Click "Save"

✅ **Google OAuth is now configured**

---

## Part 4: Set Up Local Project (5 minutes)

### Step 4.1: Navigate to Project
Open Terminal and run:
```bash
cd "path/to/My Expense Tracker"
```
(Replace with actual path - usually: `~/Desktop/Claude\ CoWork/Outputs/My\ Expense\ Tracker`)

### Step 4.2: Install Dependencies
```bash
npm install
```
⏳ **Wait 2-3 minutes** (first time only)

### Step 4.3: Create Environment File
1. In project folder, find `.env.example`
2. Create new file called `.env.local`
3. Copy contents from `.env.example` into `.env.local`
4. Replace placeholder values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Use the credentials from **Step 1.2** (Supabase dashboard)

✅ **Your environment is configured**

---

## Part 5: Test Locally (10 minutes)

### Step 5.1: Start Development Server
```bash
npm run dev
```

You should see:
```
> Ready in 2.5s
> Local: http://localhost:3000
```

### Step 5.2: Open App
1. Open browser → Go to `http://localhost:3000`
2. You should see login page with "Sign in with Google" button

### Step 5.3: Test Google Login
1. Click "Sign in with Google"
2. Choose your Google account
3. Click "Continue" (may ask for permissions)
4. You should be redirected to **Dashboard**

### Step 5.4: Test Adding Expense
1. On dashboard, click **"Add Expense"** button
2. Fill in:
   - **Amount:** 12.50
   - **Category:** Coffee
   - **Description:** Morning coffee
3. Click **"Save Expense"**
4. ✅ Expense appears in "Recent Expenses"
5. Dashboard stats update (Today shows $12.50)

### Step 5.5: Test Charts
- Look for **"Spending Trend"** chart (should show your expense)
- Look for **"Spending by Category"** pie chart (should show Coffee)
- Both should be interactive (hover to see details)

### Step 5.6: Stop Dev Server
Press `Ctrl + C` in terminal to stop

✅ **Everything works locally!**

---

## Part 6: Deploy to Vercel (10 minutes)

### Step 6.1: Create GitHub Repository
1. Go to https://github.com
2. Create new repository:
   - **Name:** expense-tracker
   - **Private** (recommended)
   - Click "Create repository"

### Step 6.2: Push Code to GitHub
In Terminal (in project folder), run:
```bash
git init
git add .
git commit -m "Initial commit: Phase 2 complete"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username

### Step 6.3: Deploy to Vercel
1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click **"New Project"**
4. Find and click on **"expense-tracker"** repository
5. Click **"Import"**
6. Add Environment Variables:
   - Click **"Environment Variables"**
   - Add two variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL = [your value from Step 1.2]
     NEXT_PUBLIC_SUPABASE_ANON_KEY = [your value from Step 1.2]
     ```
   - Click **"Deploy"**

⏳ **Wait 3-5 minutes for deployment to complete**

### Step 6.4: Get Your Production URL
After deployment completes:
1. You'll see "Congratulations! Deployed successfully"
2. Copy your Vercel URL (looks like: `https://expense-tracker-xxx.vercel.app`)
3. Save it somewhere

✅ **Your app is now live!**

---

## Part 7: Update Google OAuth for Production (2 minutes)

### Step 7.1: Update Google Cloud
1. Go to https://console.cloud.google.com
2. Go to **Credentials**
3. Click your OAuth 2.0 Client ID
4. Add your Vercel URL to **Authorized JavaScript origins**:
   - `https://your-vercel-url.vercel.app`
5. Add to **Authorized redirect URIs**:
   - `https://your-vercel-url.vercel.app/auth/callback`
6. Click "Save"

### Step 7.2: Update Supabase OAuth
1. Go to Supabase dashboard
2. Go to **Authentication** → **Providers** → **Google**
3. Scroll down to "Redirect URL" section
4. Add your production URL:
   - `https://your-vercel-url.vercel.app/auth/callback`

✅ **Production OAuth is configured**

---

## Part 8: Final Testing in Production (5 minutes)

### Step 8.1: Test Production URL
1. Open your Vercel URL in browser
2. Click "Sign in with Google"
3. Complete login
4. You should see **Dashboard**

### Step 8.2: Test Full Flow
1. Add an expense (same as Step 5.4)
2. Verify it appears on dashboard
3. Verify charts update
4. Try deleting an expense
5. Try logging out

### Step 8.3: Performance Check
1. Open browser DevTools (F12)
2. Go to **Lighthouse** tab (or use PageSpeed Insights)
3. Run report
4. Should see score > 90

✅ **Production is working perfectly!**

---

## Troubleshooting

### "Sign in with Google" doesn't work
- **Problem:** OAuth not configured correctly
- **Solution:** 
  1. Verify Google Cloud Client ID and Secret are in Supabase
  2. Check redirect URLs in both Google Cloud AND Supabase match your URL
  3. Ensure localhost:3000/auth/callback is added for local testing

### "Failed to add expense" error
- **Problem:** Database not set up or RLS policies blocked
- **Solution:**
  1. Go to Supabase dashboard
  2. Check SQL Editor → Run query:
     ```sql
     SELECT * FROM expenses LIMIT 1;
     ```
  3. If error, re-run the migration from Part 2

### Charts don't show
- **Problem:** Data not fetching
- **Solution:**
  1. Open browser console (F12)
  2. Check for errors
  3. Verify you added expense first (charts need data)

### "Environment variable not found"
- **Problem:** `.env.local` not created properly
- **Solution:**
  1. Delete `.env.local`
  2. Recreate it exactly as in Step 4.3
  3. Restart dev server (`npm run dev`)

### Production URL doesn't work
- **Problem:** Vercel deployment failed or env vars missing
- **Solution:**
  1. Go to Vercel dashboard
  2. Check deployment logs (Deployments tab)
  3. Verify environment variables are set
  4. Re-deploy by pushing to GitHub

---

## Next Steps After Launch

### Immediately After (Tomorrow)
1. ✅ Share with friends (test with real users)
2. ✅ Monitor for errors (browser console, Vercel logs)
3. ✅ Verify performance (Lighthouse score)

### Phase 3 Features (Next Week)
- Budget management with alerts
- Settings page (currency, date format, theme)
- Advanced filtering
- Export to CSV/PDF
- Recurring expenses
- Analytics dashboard

### Maintenance
- Check Vercel logs weekly
- Monitor Supabase usage (stays free tier well under limits)
- Update Google OAuth credentials before expiry

---

## Success Checklist

- [ ] Supabase project created
- [ ] Database migrations run
- [ ] Google OAuth configured
- [ ] `.env.local` created with credentials
- [ ] Local app works (`npm run dev`)
- [ ] Can add expense locally
- [ ] Charts display locally
- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Production URL works
- [ ] Can add expense in production
- [ ] Google OAuth works in production

**All checked? You're done! 🎉**

---

## URLs to Bookmark

Save these for later:

1. **Supabase Dashboard:** https://app.supabase.com
2. **Vercel Dashboard:** https://vercel.com/dashboard
3. **Google Cloud Console:** https://console.cloud.google.com
4. **Your Production App:** https://your-vercel-url.vercel.app
5. **GitHub Repository:** https://github.com/YOUR_USERNAME/expense-tracker

---

## Support

If you get stuck:
1. Check troubleshooting section above
2. See `README.md` for more technical details
3. Check browser console for error messages (F12)
4. Check Vercel deployment logs

**You've got this! 🚀**
