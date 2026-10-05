# 🚀 Ephraim Kumar - Personal Portfolio & Secure Admin Panel

**Ephraim's Era | Thiranex Internship Task 1**  
A full-stack Personal Portfolio Website & Secure Admin Panel for **Ephraim Kumar** (*Java & Python Learner | Aspiring Software Engineer*). Built with **Python Flask**, **Supabase PostgreSQL & Auth**, and a **Black & Crimson Red** design system.

---

## 🌟 1. Project Overview & Features

This application is built with a production-ready, full-stack architecture featuring a public developer portfolio website and a password-protected, role-authorized Admin Panel.

### Public Website Features
- **Hero Section**: Personal introduction for Ephraim Kumar, profile avatar (`static/images/profile.jpg`), social links, and CTAs.
- **About Section**: Honest profile highlighting studies in Java, Python, C, Flask, Spring Boot, PostgreSQL, and Supabase.
- **Dynamic Skills**: Queried from Supabase PostgreSQL `skills` table with explicit *Learning* status badges.
- **Dynamic Projects**: Queried from Supabase `projects` table displaying real repository links (e.g. `Flute-notation`).
- **Education Section**: Academic timeline for CSE (Cyber Security) at Ramachandra College of Engineering (2025–2029).
- **Interactive Contact Form**: Client-side & server-side validation saving submissions into the `contacts` table in Supabase.

### Admin Panel Features (`/admin/login` & `/admin`)
- **Supabase Authentication & RLS Authorization**: Authenticates via Supabase Auth and verifies user UUID against a dedicated `admin_users` database table.
- **Dashboard Overview (`/admin`)**: Real-time summary counts for Projects, Skills, Achievements, and Contact Messages.
- **Projects Management (`/admin/projects`)**: Full CRUD (Create, Read, Update, Delete) modal interface.
- **Skills Management (`/admin/skills`)**: Full CRUD interface for adding, editing, ordering, and categorizing skills.
- **Achievements Management (`/admin/achievements`)**: Full CRUD interface for certifications and awards.
- **Contact Message Viewer (`/admin/contacts`)**: View and delete contact form submissions.

---

## 🛠️ 2. Technology Stack

- **Backend**: Python 3.14+ / Flask 3.1.0, Flask-CORS, Python-Dotenv, Gunicorn
- **Database & Auth**: Supabase PostgreSQL SDK (`supabase-py`), Supabase Auth, Row Level Security (RLS)
- **Frontend**: HTML5, Vanilla CSS3 (Black & Red Design System), Vanilla JavaScript (ES6+ Fetch API)
- **Typography & Icons**: Google Fonts (*Space Grotesk*, *Inter*, *JetBrains Mono*), FontAwesome 6.5

---

## 📁 3. Project Structure

```
Portfolio/
├── app.py                      # Main Flask app, public REST APIs, & protected admin routes
├── config.py                   # Environment configuration loader
├── requirements.txt            # Python dependencies (Flask, supabase, python-dotenv, gunicorn)
├── .env                        # Local secret environment variables (Git-ignored)
├── .env.example                # Template showing required environment variables
├── .gitignore                  # Git exclusion rules
├── README.md                   # Project documentation & setup guide
│
├── services/
│   └── supabase_service.py     # Supabase SDK CRUD & Auth business logic
│
├── database/
│   └── schema.sql              # Supabase DDL schema, RLS security policies, & seed data
│
├── templates/
│   ├── index.html              # Main public portfolio website template
│   └── admin/
│       ├── layout.html         # Admin sidebar & topbar layout wrapper
│       ├── login.html          # Secure admin login template
│       ├── dashboard.html      # Overview metrics dashboard
│       ├── projects.html       # Projects CRUD interface & modal
│       ├── skills.html         # Skills CRUD interface & modal
│       ├── achievements.html   # Achievements CRUD interface & modal
│       └── contacts.html       # Private contact form submissions viewer
│
└── static/
    ├── css/
    │   ├── style.css           # Public website stylesheet (Black & Red Theme)
    │   └── admin.css           # Admin panel stylesheet
    │
    ├── js/
    │   ├── script.js           # Public website JavaScript
    │   └── admin.js            # Admin panel JavaScript & async CRUD fetchers
    │
    └── images/
        └── profile.jpg         # Ephraim Kumar's profile picture
```

---

## 💻 4. Local Installation & Setup Instructions

### Step 1: Clone or Download the Repository
```bash
git clone https://github.com/EphraimkumarRacheti/Portfolio.git
cd Portfolio
```

### Step 2: Install Python Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Navigate to **Project Settings -> API** and copy your **Project URL** (`https://<project-id>.supabase.co`) and **Anon Public Key**.

### Step 4: Execute Database DDL Schema
1. Open the **SQL Editor** in your Supabase Dashboard.
2. Copy and paste the contents of [`database/schema.sql`](file:///c:/Users/EPHRAIM/OneDrive/Documents/Portfolio/database/schema.sql) and click **Run**.
3. This creates the `projects`, `skills`, `achievements`, `contacts`, and `admin_users` tables along with secure Row Level Security (RLS) policies and initial skill/project records.

### Step 5: Create Admin User in Supabase Auth & Authorize UUID

Follow these exact steps to set up your personal admin login (`ephraimkumar123@gmail.com`):

1. **Create the Admin User in Supabase Authentication**:
   - In your Supabase Dashboard, navigate to **Authentication -> Users**.
   - Click **Add User -> Create User**.
   - Enter your admin email (`ephraimkumar123@gmail.com`) and your chosen secure admin password (e.g. `Ephraim2008`).
   - Click **Create User**.

2. **Get the User's UUID**:
   - In the **Authentication -> Users** list, locate `ephraimkumar123@gmail.com`.
   - Copy the generated **User UID** (UUID string, e.g. `a1b2c3d4-e5f6-7890-abcd-ef1234567890`).

3. **Add & Authorize that UUID in the `admin_users` Table**:
   - Go to the **SQL Editor** in your Supabase Dashboard.
   - Run the following SQL statement replacing `'YOUR_SUPABASE_USER_UUID_HERE'` with your copied UUID:
     ```sql
     INSERT INTO admin_users (user_id, email)
     VALUES ('YOUR_SUPABASE_USER_UUID_HERE', 'ephraimkumar123@gmail.com');
     ```

4. **Log In Through `/admin/login`**:
   - Start your local Flask server (`python app.py`).
   - Open `http://127.0.0.1:5000/admin/login` in your browser.
   - Log in using `ephraimkumar123@gmail.com` and your password. Supabase Auth will authenticate your credentials, and the Flask backend will verify that your user UUID exists in the `admin_users` table to grant full admin access.

### Step 6: Create Local `.env` File
Create a `.env` file in the root project folder:

```ini
SUPABASE_URL=https://your-supabase-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key-here

FLASK_ENV=development
PORT=5000
SECRET_KEY=ephraim-portfolio-secret-key-2026
```

### Step 7: Run the Flask Application
```bash
python app.py
```

- **Public Portfolio URL**: `http://127.0.0.1:5000`
- **Admin Login Panel URL**: `http://127.0.0.1:5000/admin/login`

---

## 🔒 5. Security & Row Level Security (RLS) Explanation

- **Public Read Protection**: Public visitors can SELECT public portfolio data (`projects`, `skills`, `achievements`) and INSERT into `contacts`, but cannot access private contact submissions or modify database records.
- **Admin Role Security**: Write operations (`INSERT`, `UPDATE`, `DELETE`) on database tables and access to `/admin/contacts` are strictly restricted to authenticated users whose UUID is verified in the `admin_users` table.
- **Environment Secrets**: Zero credentials or API keys are embedded in source code, HTML templates, or JavaScript files. Secrets are managed exclusively via git-ignored `.env` variables.

---

## 🌐 6. Future Deployment Instructions

- **Render / Railway / Heroku**: Connect your GitHub repository, set the build command to `pip install -r requirements.txt`, start command to `gunicorn app:app`, and add your `SUPABASE_URL`, `SUPABASE_KEY`, and `SECRET_KEY` environment variables.
- **Vercel**: Add a `vercel.json` WSGI configuration routing requests to `app.py`.
