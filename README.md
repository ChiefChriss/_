# Web Login App

A modern login/register app with Netlify Functions backend and Supabase PostgreSQL database.

## Setup Instructions

### 1. Create a Supabase Account (Free)
1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project (free tier available)
3. In your project dashboard, go to **SQL Editor** and create the users table:

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

4. Get your credentials:
   - Go to **Settings > API**
   - Copy your `Project URL` (SUPABASE_URL)
   - Copy your `anon public` key (SUPABASE_ANON_KEY)

### 2. Deploy to Netlify

1. Push this repo to GitHub (already done)
2. Go to [netlify.com](https://netlify.com) and sign in
3. Click **"Add new site"** → **"Import an existing project"**
4. Select your GitHub repository
5. In deploy settings:
   - **Build command**: leave blank
   - **Publish directory**: `.`
6. Click **"Deploy"**
7. After deploy starts, go to **Site settings** → **Build & deploy** → **Environment**
8. Add these environment variables:
   - `SUPABASE_URL` = your Project URL
   - `SUPABASE_ANON_KEY` = your anon key
9. Trigger a new deploy (the functions need to rebuild with the env vars)

### 3. Test Locally (Optional)

To run the Flask server locally during development:

```bash
cd server
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/python flask_server.py
```

Then visit http://localhost:3000/practice.html

## Features

- ✅ Register new users (allows duplicates)
- ✅ Login with email/password
- ✅ Passwords hashed with bcryptjs
- ✅ Redirect to YouTube video player on login success
- ✅ Fiery gradient background theme
- ✅ Fully serverless (Netlify Functions + Supabase)

## Files

- `practice.html` - Login form
- `success.html` - Post-login page with embedded video
- `styling.css` - Fiery theme styles
- `netlify/functions/register.js` - Registration endpoint
- `netlify/functions/login.js` - Login endpoint
- `server/flask_server.py` - Local Flask server (for dev only)
