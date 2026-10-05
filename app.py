from functools import wraps
from flask import Flask, render_template, jsonify, request, session, redirect, url_for
from flask_cors import CORS
from config import Config
from services.supabase_service import supabase_service

app = Flask(__name__)
app.config.from_object(Config)
app.secret_key = Config.SECRET_KEY

# Enable CORS for cross-origin frontend support
CORS(app)

# -----------------------------------------------------------------------------
# ADMIN AUTHORIZATION DECORATOR
# -----------------------------------------------------------------------------
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        admin_id = session.get("admin_id")
        if not admin_id or not supabase_service.is_admin_authorized(admin_id):
            if request.path.startswith("/api/admin/"):
                return jsonify({"status": "error", "message": "Unauthorized access. Admin privileges required."}), 401
            return redirect(url_for("admin_login"))
        return f(*args, **kwargs)
    return decorated_function

# -----------------------------------------------------------------------------
# PUBLIC WEBSITE & REST API ROUTES
# -----------------------------------------------------------------------------
@app.route("/")
def index():
    """Renders main single-page portfolio application."""
    return render_template("index.html")

@app.route("/api/projects", methods=["GET"])
def get_projects():
    """Returns dynamic projects list from Supabase."""
    try:
        projects = supabase_service.fetch_projects()
        return jsonify({"status": "success", "count": len(projects), "data": projects}), 200
    except Exception as e:
        app.logger.error(f"Error fetching projects: {e}")
        return jsonify({"status": "error", "message": "Failed to fetch projects."}), 500

@app.route("/api/skills", methods=["GET"])
def get_skills():
    """Returns dynamic skills list from Supabase."""
    try:
        skills = supabase_service.fetch_skills()
        return jsonify({"status": "success", "count": len(skills), "data": skills}), 200
    except Exception as e:
        app.logger.error(f"Error fetching skills: {e}")
        return jsonify({"status": "error", "message": "Failed to fetch skills."}), 500

@app.route("/api/achievements", methods=["GET"])
def get_achievements():
    """Returns dynamic achievements list from Supabase."""
    try:
        achievements = supabase_service.fetch_achievements()
        return jsonify({"status": "success", "count": len(achievements), "data": achievements}), 200
    except Exception as e:
        app.logger.error(f"Error fetching achievements: {e}")
        return jsonify({"status": "error", "message": "Failed to fetch achievements."}), 500

@app.route("/api/contact", methods=["POST"])
def submit_contact():
    """Processes contact form submissions and stores in Supabase contacts table."""
    try:
        data = request.get_json() or request.form
        if not data:
            return jsonify({"status": "error", "message": "No input data provided."}), 400

        name = data.get("name")
        email = data.get("email")
        message = data.get("message")

        success, msg = supabase_service.save_contact(name, email, message)
        return jsonify({"status": "success" if success else "error", "message": msg}), (200 if success else 400)

    except Exception as e:
        app.logger.error(f"Error handling contact submission: {e}")
        return jsonify({"status": "error", "message": "Internal server error."}), 500

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "supabase_connected": supabase_service.is_connected,
        "environment": Config.FLASK_ENV
    }), 200

# -----------------------------------------------------------------------------
# ADMIN AUTHENTICATION ROUTES
# -----------------------------------------------------------------------------
@app.route("/admin/login", methods=["GET"])
def admin_login():
    """Admin Login HTML Page."""
    if session.get("admin_id") and supabase_service.is_admin_authorized(session.get("admin_id")):
        return redirect(url_for("admin_dashboard"))
    return render_template("admin/login.html")

@app.route("/admin/login", methods=["POST"])
def process_admin_login():
    """Processes admin login request via Supabase Auth."""
    data = request.get_json() or request.form
    email = data.get("email")
    password = data.get("password")

    success, message, user_info = supabase_service.authenticate_admin(email, password)
    if success and user_info:
        session["admin_id"] = user_info["user_id"]
        session["admin_email"] = user_info["email"]
        session["access_token"] = user_info.get("access_token", "")
        return jsonify({"status": "success", "message": message, "redirect": url_for("admin_dashboard")}), 200
    else:
        return jsonify({"status": "error", "message": message}), 401

@app.route("/admin/logout", methods=["GET", "POST"])
def admin_logout():
    """Logs out admin user and clears session."""
    session.clear()
    return redirect(url_for("admin_login"))

# -----------------------------------------------------------------------------
# PROTECTED ADMIN PANEL PAGES
# -----------------------------------------------------------------------------
@app.route("/admin")
@admin_required
def admin_dashboard():
    """Admin Dashboard overview with real database counts."""
    projects = supabase_service.fetch_projects()
    skills = supabase_service.fetch_skills()
    achievements = supabase_service.fetch_achievements()
    contacts = supabase_service.fetch_contacts()

    total_ach = len([a for a in achievements if (a.get("category") or "").strip().lower() == "achievement"])
    total_cert = len([a for a in achievements if (a.get("category") or "").strip().lower() == "certification"])

    counts = {
        "projects": len(projects),
        "skills": len(skills),
        "achievements": total_ach,
        "certifications": total_cert,
        "contacts": len(contacts)
    }

    return render_template("admin/dashboard.html", counts=counts, admin_email=session.get("admin_email"))

@app.route("/admin/projects")
@admin_required
def admin_projects():
    """Admin Projects Management Page."""
    projects = supabase_service.fetch_projects()
    return render_template("admin/projects.html", projects=projects, admin_email=session.get("admin_email"))

@app.route("/admin/skills")
@admin_required
def admin_skills():
    """Admin Skills Management Page."""
    skills = supabase_service.fetch_skills()
    return render_template("admin/skills.html", skills=skills, admin_email=session.get("admin_email"))

@app.route("/admin/achievements")
@admin_required
def admin_achievements():
    """Admin Achievements Management Page."""
    achievements = supabase_service.fetch_achievements()
    return render_template("admin/achievements.html", achievements=achievements, admin_email=session.get("admin_email"))

@app.route("/admin/contacts")
@admin_required
def admin_contacts():
    """Admin Contact Submissions Page."""
    contacts = supabase_service.fetch_contacts()
    return render_template("admin/contacts.html", contacts=contacts, admin_email=session.get("admin_email"))

# -----------------------------------------------------------------------------
# PROTECTED ADMIN REST APIs (PROJECTS CRUD)
# -----------------------------------------------------------------------------
@app.route("/api/admin/projects", methods=["POST"])
@admin_required
def create_project_api():
    data = request.get_json() or request.form
    success, message = supabase_service.create_project(data)
    return jsonify({"status": "success" if success else "error", "message": message}), (200 if success else 400)

@app.route("/api/admin/projects/<int:project_id>", methods=["PUT", "POST"])
@admin_required
def update_project_api(project_id):
    data = request.get_json() or request.form
    success, message = supabase_service.update_project(project_id, data)
    return jsonify({"status": "success" if success else "error", "message": message}), (200 if success else 400)

@app.route("/api/admin/projects/<int:project_id>", methods=["DELETE"])
@admin_required
def delete_project_api(project_id):
    success, message = supabase_service.delete_project(project_id)
    return jsonify({"status": "success" if success else "error", "message": message}), (200 if success else 400)

# -----------------------------------------------------------------------------
# PROTECTED ADMIN REST APIs (SKILLS CRUD)
# -----------------------------------------------------------------------------
@app.route("/api/admin/skills", methods=["POST"])
@admin_required
def create_skill_api():
    data = request.get_json() or request.form
    success, message = supabase_service.create_skill(data)
    return jsonify({"status": "success" if success else "error", "message": message}), (200 if success else 400)

@app.route("/api/admin/skills/<int:skill_id>", methods=["PUT", "POST"])
@admin_required
def update_skill_api(skill_id):
    data = request.get_json() or request.form
    success, message = supabase_service.update_skill(skill_id, data)
    return jsonify({"status": "success" if success else "error", "message": message}), (200 if success else 400)

@app.route("/api/admin/skills/<int:skill_id>", methods=["DELETE"])
@admin_required
def delete_skill_api(skill_id):
    success, message = supabase_service.delete_skill(skill_id)
    return jsonify({"status": "success" if success else "error", "message": message}), (200 if success else 400)

# -----------------------------------------------------------------------------
# PROTECTED ADMIN REST APIs (ACHIEVEMENTS CRUD)
# -----------------------------------------------------------------------------
@app.route("/api/admin/achievements", methods=["POST"])
@admin_required
def create_achievement_api():
    data = request.get_json() or request.form
    success, message = supabase_service.create_achievement(data)
    return jsonify({"status": "success" if success else "error", "message": message}), (200 if success else 400)

@app.route("/api/admin/achievements/<int:achievement_id>", methods=["PUT", "POST"])
@admin_required
def update_achievement_api(achievement_id):
    data = request.get_json() or request.form
    success, message = supabase_service.update_achievement(achievement_id, data)
    return jsonify({"status": "success" if success else "error", "message": message}), (200 if success else 400)

@app.route("/api/admin/achievements/<int:achievement_id>", methods=["DELETE"])
@admin_required
def delete_achievement_api(achievement_id):
    success, message = supabase_service.delete_achievement(achievement_id)
    return jsonify({"status": "success" if success else "error", "message": message}), (200 if success else 400)

# -----------------------------------------------------------------------------
# PROTECTED ADMIN REST APIs (CONTACTS DELETE)
# -----------------------------------------------------------------------------
@app.route("/api/admin/contacts/<int:contact_id>", methods=["DELETE"])
@admin_required
def delete_contact_api(contact_id):
    success, message = supabase_service.delete_contact(contact_id)
    return jsonify({"status": "success" if success else "error", "message": message}), (200 if success else 400)

# -----------------------------------------------------------------------------
# ERROR HANDLERS
# -----------------------------------------------------------------------------
@app.errorhandler(404)
def not_found(e):
    if request.path.startswith("/api/"):
        return jsonify({"status": "error", "message": "API endpoint not found"}), 404
    return render_template("index.html"), 404

@app.errorhandler(500)
def server_error(e):
    if request.path.startswith("/api/"):
        return jsonify({"status": "error", "message": "Internal server error"}), 500
    return "Internal Server Error", 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=Config.PORT, debug=(Config.FLASK_ENV == "development"))
