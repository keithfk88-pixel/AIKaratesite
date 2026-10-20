# Kinnotaka Karate Academy (金鷹空手道場)

Full-stack official dojo website and student registration system built with **React 18**, **Tailwind CSS**, **Python FastAPI**, and **Supabase (PostgreSQL)**.

---

## Features

- **Official Student Admission Form (`#registration`)**
  - Captures and validates **Full Name**, **Age** (auto-computed from Date of Birth or entered directly), **Sex** (`Male`, `Female`, `Other`), **Date of Birth**, **Place of Birth**, and **Residential Address**.
  - Live real-time Student Registration Card preview & printable official enrollment slip with auto-assigned Student ID (`KKA-2026-XXXX`), `10th Kyu · White Belt` rank, and age-matched division.
- **Registered Students Directory (`#registry`)**
  - Full search across Name, Student ID, Place of Birth, and Address, sex filter tabs, edit & delete actions, printable admission slips, and one-click **CSV Export**.
- **FastAPI + Supabase PostgreSQL Backend (`backend/`)**
  - Full REST CRUD API with Pydantic v2 validation and interactive OpenAPI 3.1 documentation at `/docs` & `/redoc`.
  - Powered by official `supabase-py` targeting `public.students`, with automatic local JSON fallback (`data/students.json`) and one-click **Sync Local Records to Supabase**.

---

## Project Structure

```text
├── backend/
│   ├── main.py          # FastAPI app, REST endpoints, CORS & SPA static serving
│   ├── database.py      # Supabase PostgreSQL client + automatic local fallback repo
│   └── models.py        # Pydantic v2 schemas & field validation
├── supabase/
│   └── schema.sql       # PostgreSQL table DDL, indexes, trigger & RLS policies
├── src/                 # React + Tailwind CSS frontend source
│   ├── components/      # Modular UI components (Hero, Registration, Registry, Modals)
│   ├── App.jsx
│   └── main.jsx
├── public/images/       # Custom dojo photography assets
├── web/                 # Production-compiled frontend bundle
├── .env.example         # Supabase environment configuration template
├── requirements.txt     # Python dependencies
└── Dockerfile           # Production container build
```

---

## Quick Start

### 1. Supabase Database Setup

1. Open your project in the [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**.
2. Paste and run the contents of [`supabase/schema.sql`](./supabase/schema.sql) to create the `public.students` table and Row Level Security policies.
3. Copy `.env.example` to `.env` and add your credentials:

```bash
cp .env.example .env
```

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-or-service-role-key
SUPABASE_TABLE=students
PORT=3000
```

*(You can also configure `SUPABASE_URL` and `SUPABASE_KEY` live from the website navbar via the **FastAPI · Supabase** button.)*

### 2. Run Backend & Website

```bash
pip install -r requirements.txt
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 3000
```

- **Website**: `http://localhost:3000`
- **Swagger OpenAPI Docs**: `http://localhost:3000/docs`

### 3. Rebuild Frontend (Optional for UI Development)

```bash
npm install
npm run build
```
