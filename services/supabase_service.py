import logging
import re
from datetime import datetime, timezone
from config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SupabaseService")

# Real project fallback for Ephraim Kumar's portfolio
MOCK_PROJECTS = [
    {
        "id": 1,
        "title": "Flute-notation",
        "description": "A user-friendly flute notation website for searching and learning flute notations of popular Telugu songs, with lyrics and corresponding notes in an easy-to-follow format.",
        "technologies": ["HTML", "CSS", "JavaScript"],
        "github_url": "https://github.com/EphraimkumarRacheti/Flute-notation",
        "live_url": "",
        "image_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
]

# Exact specified skills for Ephraim Kumar
MOCK_SKILLS = [
    {"id": 1, "name": "Java", "category": "Programming", "level": "Learning", "icon": "fa-solid fa-mug-hot", "display_order": 1},
    {"id": 2, "name": "Python", "category": "Programming", "level": "Learning", "icon": "fa-brands fa-python", "display_order": 2},
    {"id": 3, "name": "C", "category": "Programming", "level": "Basic / Learning", "icon": "fa-solid fa-terminal", "display_order": 3},
    {"id": 4, "name": "Flask", "category": "Backend", "level": "Learning", "icon": "fa-solid fa-flask", "display_order": 4},
    {"id": 5, "name": "Spring Boot", "category": "Backend", "level": "Learning", "icon": "fa-solid fa-leaf", "display_order": 5},
    {"id": 6, "name": "PostgreSQL", "category": "Database", "level": "Learning", "icon": "fa-solid fa-database", "display_order": 6},
    {"id": 7, "name": "Supabase", "category": "Database", "level": "Learning", "icon": "fa-solid fa-bolt", "display_order": 7},
    {"id": 8, "name": "Git", "category": "Tools", "level": "Learning", "icon": "fa-brands fa-git-alt", "display_order": 8},
    {"id": 9, "name": "GitHub", "category": "Tools", "level": "Learning", "icon": "fa-brands fa-github", "display_order": 9},
    {"id": 10, "name": "VS Code", "category": "Tools", "level": "Tool", "icon": "fa-solid fa-code", "display_order": 10}
]

# Verified real achievements and certifications for Ephraim Kumar
MOCK_ACHIEVEMENTS = [
    {
        "id": 1,
        "title": "Shastra 4.0 Level 1 Coding Challenge",
        "description": "Achieved Runner-Up (3rd Prize) in Shastra 4.0 Level 1, a coding challenge conducted by Ramachandra College of Engineering, Eluru. Focused on algorithm design and logical problem-solving.",
        "issuer": "Ramachandra College of Engineering",
        "category": "Achievement",
        "date": "April 2026",
        "certificate_url": "",
        "image_url": "https://media.licdn.com/dms/image/v2/D5622AQF4fGqWTVgmBA/feedshare-image-high-res/B56Z1_lvR4J8AU-/0/1775962093073?e=2147483647&v=beta&t=M4gvEPzOQn4xdYHf4jxlek0hAnch6cEE3CdGgLy7wbk",
        "external_url": "https://lnkd.in/p/dPkPeBTs",
        "display_order": 1,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": 2,
        "title": "Java Certification",
        "description": "Successfully completed a Java Certification from Simplilearn. The certification helped strengthen my understanding of Java programming and improve my programming and problem-solving skills.",
        "issuer": "Simplilearn",
        "category": "Certification",
        "date": "",
        "certificate_url": "",
        "image_url": "/static/images/java-certification.jpg",
        "external_url": "https://lnkd.in/p/dY8ZfDEa",
        "display_order": 2,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
]

# Fallback local contact submissions
MOCK_CONTACTS = []

class SupabaseService:
    def __init__(self):
        self.client = None
        self.is_connected = False
        self._initialize_client()

    def _initialize_client(self):
        url = Config.SUPABASE_URL
        key = Config.SUPABASE_KEY

        if url and key and "your-supabase" not in url.lower() and "your-supabase" not in key.lower():
            try:
                from supabase import create_client
                self.client = create_client(url, key)
                self.is_connected = True
                logger.info("Successfully connected to Supabase backend SDK.")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}. Operating in fallback mode.")
                self.is_connected = False
        else:
            logger.info("Supabase URL or Key unconfigured. Operating in local fallback mode.")
            self.is_connected = False

    # -------------------------------------------------------------------------
    # ADMIN AUTHENTICATION & AUTHORIZATION
    # -------------------------------------------------------------------------
    def authenticate_admin(self, email: str, password: str):
        """
        Authenticates user via Supabase Auth and verifies admin_users table role.
        """
        email = email.strip() if email else ""
        if not email or not password:
            return False, "Email and password are required.", None

        if self.is_connected and self.client:
            try:
                auth_resp = self.client.auth.sign_in_with_password({
                    "email": email,
                    "password": password
                })
                
                if auth_resp and auth_resp.user:
                    user_id = str(auth_resp.user.id)
                    user_email = auth_resp.user.email
                    
                    # Verify admin authorization table
                    admin_check = self.client.table("admin_users").select("*").eq("user_id", user_id).execute()
                    if hasattr(admin_check, 'data') and admin_check.data and len(admin_check.data) > 0:
                        return True, "Login successful!", {
                            "user_id": user_id,
                            "email": user_email,
                            "access_token": auth_resp.session.access_token if auth_resp.session else ""
                        }
                    else:
                        return False, "Access denied. Your account is not authorized as an administrator.", None
            except Exception as e:
                logger.error(f"Supabase auth error: {e}")
                err_msg = str(e)
                if "Invalid login credentials" in err_msg:
                    return False, "Invalid email or password.", None
                return False, f"Authentication error: {err_msg}", None

        # Fallback Local Admin Login for local development testing
        if email.lower() in ["ephraimkumar123@gmail.com", "ephraimkumar123@gmai.com"] and password == "Ephraim2008":
            return True, "Local Admin Session Started", {
                "user_id": "ephraim-admin-uuid-9999",
                "email": email,
                "access_token": "mock-local-token"
            }

        return False, "Invalid credentials or Supabase unconfigured. (Local Admin: ephraimkumar123@gmail.com)", None

    def is_admin_authorized(self, user_id: str):
        """Verifies if a user_id UUID exists in admin_users table."""
        if not user_id:
            return False
        if not self.is_connected:
            return user_id in ["ephraim-admin-uuid-9999", "local-admin-uuid-12345"]

        try:
            res = self.client.table("admin_users").select("*").eq("user_id", user_id).execute()
            return hasattr(res, 'data') and res.data and len(res.data) > 0
        except Exception as e:
            logger.error(f"Error checking admin_users table: {e}")
            return False

    # -------------------------------------------------------------------------
    # PROJECTS CRUD
    # -------------------------------------------------------------------------
    def fetch_projects(self):
        if self.is_connected and self.client:
            try:
                response = self.client.table("projects").select("*").order("id", desc=False).execute()
                if hasattr(response, 'data') and response.data is not None:
                    projects = []
                    for proj in response.data:
                        techs = proj.get("technologies", [])
                        if isinstance(techs, str):
                            techs = [t.strip() for t in techs.split(",") if t.strip()]
                        proj_copy = dict(proj)
                        proj_copy["technologies"] = techs
                        projects.append(proj_copy)
                    return projects
            except Exception as e:
                logger.error(f"Supabase query error in fetch_projects: {e}")

        return MOCK_PROJECTS

    def create_project(self, data: dict):
        title = data.get("title", "").strip()
        description = data.get("description", "").strip()
        techs = data.get("technologies", [])
        if isinstance(techs, str):
            techs = [t.strip() for t in techs.split(",") if t.strip()]

        if not title: return False, "Project title is required."
        if not description: return False, "Description is required."

        payload = {
            "title": title,
            "description": description,
            "technologies": techs,
            "github_url": data.get("github_url", "").strip(),
            "live_url": data.get("live_url", "").strip(),
            "image_url": data.get("image_url", "").strip(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        if self.is_connected and self.client:
            try:
                res = self.client.table("projects").insert(payload).execute()
                if hasattr(res, 'data') and res.data:
                    return True, "Project created successfully!"
            except Exception as e:
                return False, f"Failed to create project: {str(e)}"

        payload["id"] = len(MOCK_PROJECTS) + 1
        MOCK_PROJECTS.append(payload)
        return True, "Project added successfully! (Local Mode)"

    def update_project(self, project_id: int, data: dict):
        techs = data.get("technologies", [])
        if isinstance(techs, str):
            techs = [t.strip() for t in techs.split(",") if t.strip()]

        payload = {
            "title": data.get("title", "").strip(),
            "description": data.get("description", "").strip(),
            "technologies": techs,
            "github_url": data.get("github_url", "").strip(),
            "live_url": data.get("live_url", "").strip(),
            "image_url": data.get("image_url", "").strip(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        if self.is_connected and self.client:
            try:
                res = self.client.table("projects").update(payload).eq("id", project_id).execute()
                if hasattr(res, 'data') and res.data:
                    return True, "Project updated successfully!"
            except Exception as e:
                return False, f"Failed to update project: {str(e)}"

        for proj in MOCK_PROJECTS:
            if proj["id"] == int(project_id):
                proj.update(payload)
                return True, "Project updated successfully! (Local Mode)"
        return False, "Project not found."

    def delete_project(self, project_id: int):
        if self.is_connected and self.client:
            try:
                self.client.table("projects").delete().eq("id", project_id).execute()
                return True, "Project deleted successfully!"
            except Exception as e:
                return False, f"Failed to delete project: {str(e)}"

        global MOCK_PROJECTS
        MOCK_PROJECTS = [p for p in MOCK_PROJECTS if p["id"] != int(project_id)]
        return True, "Project deleted successfully! (Local Mode)"

    # -------------------------------------------------------------------------
    # SKILLS CRUD
    # -------------------------------------------------------------------------
    def fetch_skills(self):
        if self.is_connected and self.client:
            try:
                response = self.client.table("skills").select("*").order("display_order", desc=False).execute()
                if hasattr(response, 'data') and response.data is not None:
                    return response.data
            except Exception as e:
                logger.error(f"Supabase query error in fetch_skills: {e}")

        return MOCK_SKILLS

    def create_skill(self, data: dict):
        name = data.get("name", "").strip()
        category = data.get("category", "Programming").strip()
        level = data.get("level", "Learning").strip()

        if not name: return False, "Skill name is required."

        payload = {
            "name": name,
            "category": category,
            "level": level,
            "icon": data.get("icon", "").strip(),
            "display_order": int(data.get("display_order", 0)),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        if self.is_connected and self.client:
            try:
                res = self.client.table("skills").insert(payload).execute()
                if hasattr(res, 'data') and res.data:
                    return True, "Skill created successfully!"
            except Exception as e:
                return False, f"Failed to create skill: {str(e)}"

        payload["id"] = len(MOCK_SKILLS) + 1
        MOCK_SKILLS.append(payload)
        return True, "Skill created successfully! (Local Mode)"

    def update_skill(self, skill_id: int, data: dict):
        payload = {
            "name": data.get("name", "").strip(),
            "category": data.get("category", "").strip(),
            "level": data.get("level", "").strip(),
            "icon": data.get("icon", "").strip(),
            "display_order": int(data.get("display_order", 0)),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        if self.is_connected and self.client:
            try:
                self.client.table("skills").update(payload).eq("id", skill_id).execute()
                return True, "Skill updated successfully!"
            except Exception as e:
                return False, f"Failed to update skill: {str(e)}"

        for s in MOCK_SKILLS:
            if s["id"] == int(skill_id):
                s.update(payload)
                return True, "Skill updated! (Local Mode)"
        return False, "Skill not found."

    def delete_skill(self, skill_id: int):
        if self.is_connected and self.client:
            try:
                self.client.table("skills").delete().eq("id", skill_id).execute()
                return True, "Skill deleted successfully!"
            except Exception as e:
                return False, f"Failed to delete skill: {str(e)}"

        global MOCK_SKILLS
        MOCK_SKILLS = [s for s in MOCK_SKILLS if s["id"] != int(skill_id)]
        return True, "Skill deleted successfully! (Local Mode)"

    # -------------------------------------------------------------------------
    # ACHIEVEMENTS & CERTIFICATIONS CRUD
    # -------------------------------------------------------------------------
    def fetch_achievements(self):
        if self.is_connected and self.client:
            try:
                response = self.client.table("achievements").select("*").order("display_order", desc=False).execute()
                if hasattr(response, 'data') and response.data is not None:
                    return response.data
            except Exception as e:
                logger.error(f"Supabase query error in fetch_achievements: {e}")

        return MOCK_ACHIEVEMENTS

    def create_achievement(self, data: dict):
        title = data.get("title", "").strip()
        description = data.get("description", "").strip()

        if not title: return False, "Title is required."
        if not description: return False, "Description is required."

        payload = {
            "title": title,
            "description": description,
            "issuer": data.get("issuer", "").strip(),
            "date": data.get("date", "").strip(),
            "category": data.get("category", "Achievement").strip(),
            "certificate_url": data.get("certificate_url", "").strip(),
            "image_url": data.get("image_url", "").strip(),
            "external_url": data.get("external_url", "").strip(),
            "display_order": int(data.get("display_order", 0)),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        if self.is_connected and self.client:
            try:
                res = self.client.table("achievements").insert(payload).execute()
                return True, "Achievement created successfully!"
            except Exception as e:
                return False, f"Failed to create achievement: {str(e)}"

        payload["id"] = len(MOCK_ACHIEVEMENTS) + 1
        MOCK_ACHIEVEMENTS.append(payload)
        return True, "Achievement created! (Local Mode)"

    def update_achievement(self, achievement_id: int, data: dict):
        payload = {
            "title": data.get("title", "").strip(),
            "description": data.get("description", "").strip(),
            "issuer": data.get("issuer", "").strip(),
            "date": data.get("date", "").strip(),
            "category": data.get("category", "Achievement").strip(),
            "certificate_url": data.get("certificate_url", "").strip(),
            "image_url": data.get("image_url", "").strip(),
            "external_url": data.get("external_url", "").strip(),
            "display_order": int(data.get("display_order", 0)),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        if self.is_connected and self.client:
            try:
                self.client.table("achievements").update(payload).eq("id", achievement_id).execute()
                return True, "Achievement updated successfully!"
            except Exception as e:
                return False, f"Failed to update achievement: {str(e)}"

        for a in MOCK_ACHIEVEMENTS:
            if a["id"] == int(achievement_id):
                a.update(payload)
                return True, "Achievement updated! (Local Mode)"
        return False, "Achievement not found."

    def delete_achievement(self, achievement_id: int):
        if self.is_connected and self.client:
            try:
                self.client.table("achievements").delete().eq("id", achievement_id).execute()
                return True, "Achievement deleted successfully!"
            except Exception as e:
                return False, f"Failed to delete achievement: {str(e)}"

        global MOCK_ACHIEVEMENTS
        MOCK_ACHIEVEMENTS = [a for a in MOCK_ACHIEVEMENTS if a["id"] != int(achievement_id)]
        return True, "Achievement deleted successfully! (Local Mode)"

    # -------------------------------------------------------------------------
    # CONTACTS CRUD & SUBMISSION
    # -------------------------------------------------------------------------
    def save_contact(self, name: str, email: str, message: str):
        name = name.strip() if name else ""
        email = email.strip() if email else ""
        message = message.strip() if message else ""

        if not name: return False, "Name is required."
        if not email: return False, "Email address is required."
        
        email_regex = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
        if not re.match(email_regex, email):
            return False, "Please provide a valid email address."
            
        if not message or len(message) < 5:
            return False, "Message must be at least 5 characters long."

        payload = {
            "name": name,
            "email": email,
            "message": message,
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        if self.is_connected and self.client:
            try:
                res = self.client.table("contacts").insert(payload).execute()
                if hasattr(res, 'data') and res.data:
                    return True, "Thank you! Your message has been sent successfully."
            except Exception as e:
                logger.error(f"Supabase contact insert error: {e}")
                return False, f"Database insertion failed: {str(e)}"

        payload["id"] = len(MOCK_CONTACTS) + 1
        MOCK_CONTACTS.append(payload)
        return True, "Thank you! Your message has been sent successfully."

    def fetch_contacts(self):
        if self.is_connected and self.client:
            try:
                res = self.client.table("contacts").select("*").order("created_at", desc=True).execute()
                if hasattr(res, 'data') and res.data is not None:
                    return res.data
            except Exception as e:
                logger.error(f"Error fetching contacts: {e}")

        return sorted(MOCK_CONTACTS, key=lambda c: c.get("created_at", ""), reverse=True)

    def delete_contact(self, contact_id: int):
        if self.is_connected and self.client:
            try:
                self.client.table("contacts").delete().eq("id", contact_id).execute()
                return True, "Contact message deleted successfully!"
            except Exception as e:
                return False, f"Failed to delete contact: {str(e)}"

        global MOCK_CONTACTS
        MOCK_CONTACTS = [c for c in MOCK_CONTACTS if c["id"] != int(contact_id)]
        return True, "Contact message deleted! (Local Mode)"

# Singleton service instance
supabase_service = SupabaseService()
