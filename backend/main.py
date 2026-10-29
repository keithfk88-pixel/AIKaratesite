from __future__ import annotations

from pathlib import Path
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from backend.database import BASE_DIR, repo
from backend.models import (
    StudentListResponse,
    StudentMutationResponse,
    StudentPayload,
    StudentRecord,
    SupabaseConfigRequest,
    SupabaseStatusResponse,
)

WEB_DIR = BASE_DIR / "web"
PUBLIC_DIR = BASE_DIR / "public"

app = FastAPI(
    title="Kinnotaka Karate Academy API",
    description=(
        "FastAPI + Supabase backend for Kinnotaka Karate Academy (金鷹空手道場) "
        "student admissions, roster management, and official enrollment records."
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://aikaratesite.keithfk88.workers.dev"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def custom_validation_exception_handler(_: Request, exc: RequestValidationError):
    field_errors: dict[str, str] = {}
    for err in exc.errors():
        loc = err.get("loc", ())
        field_name = str(loc[-1]) if loc else "form"
        msg = err.get("msg", "Invalid field value").replace("Value error, ", "")
        field_errors[field_name] = msg
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": "Please check the required registration fields.",
            "errors": field_errors,
            "detail": exc.errors(),
        },
    )


# ---------------------------------------------------------------------------
# Health & Supabase Integration Endpoints
# ---------------------------------------------------------------------------
@app.get("/api/health", tags=["System & Supabase"])
def health_check():
    students = repo.list_students()
    supa = repo.get_status()
    return {
        "status": "ok",
        "academy": "Kinnotaka Karate Academy",
        "backend": "FastAPI",
        "storage": repo.active_storage_label,
        "supabaseConnected": supa["connected"],
        "supabaseTableReady": supa["tableReady"],
        "count": len(students),
    }


@app.get("/api/supabase/status", response_model=SupabaseStatusResponse, tags=["System & Supabase"])
def get_supabase_status():
    return repo.reload_credentials()


@app.post("/api/supabase/config", response_model=SupabaseStatusResponse, tags=["System & Supabase"])
def configure_supabase(config: SupabaseConfigRequest):
    result = repo.save_runtime_credentials(config.url, config.key)
    if not result["connected"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result


@app.delete("/api/supabase/config", response_model=SupabaseStatusResponse, tags=["System & Supabase"])
def disconnect_runtime_supabase():
    return repo.clear_runtime_credentials()


@app.post("/api/supabase/sync", tags=["System & Supabase"])
def sync_local_records_to_supabase():
    try:
        return repo.sync_local_to_supabase()
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


# ---------------------------------------------------------------------------
# Student Registration CRUD Endpoints
# ---------------------------------------------------------------------------
@app.get("/api/students", response_model=StudentListResponse, tags=["Students"])
def list_students():
    students = repo.list_students()
    return {
        "students": students,
        "backend": "fastapi",
        "storage": repo.active_storage_label,
    }


@app.get("/api/students/{student_id}", response_model=StudentRecord, tags=["Students"])
def get_student(student_id: str):
    student = repo.get_student(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found.")
    return student


@app.post(
    "/api/students",
    response_model=StudentMutationResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Students"],
)
def register_student(payload: StudentPayload):
    created = repo.create_student(payload)
    return {
        "message": "Student registered successfully.",
        "student": created,
        "storage": repo.active_storage_label,
    }


@app.put("/api/students/{student_id}", response_model=StudentMutationResponse, tags=["Students"])
def update_student(student_id: str, payload: StudentPayload):
    updated = repo.update_student(student_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Student record not found.")
    return {
        "message": "Student registration updated.",
        "student": updated,
        "storage": repo.active_storage_label,
    }


@app.delete("/api/students/{student_id}", tags=["Students"])
def delete_student(student_id: str):
    deleted = repo.delete_student(student_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Student record not found.")
    return {
        "message": "Student registration removed.",
        "id": student_id,
        "storage": repo.active_storage_label,
    }


# ---------------------------------------------------------------------------
# Static Frontend Serving (React SPA in `web/`)
# ---------------------------------------------------------------------------
@app.get("/{full_path:path}", include_in_schema=False)
def serve_frontend(full_path: str):
    clean_rel = full_path.lstrip("/")
    if clean_rel:
        web_candidate = (WEB_DIR / clean_rel).resolve()
        if str(web_candidate).startswith(str(WEB_DIR.resolve())) and web_candidate.is_file():
            return FileResponse(web_candidate)

        pub_candidate = (PUBLIC_DIR / clean_rel).resolve()
        if str(pub_candidate).startswith(str(PUBLIC_DIR.resolve())) and pub_candidate.is_file():
            return FileResponse(pub_candidate)

    index_file = WEB_DIR / "index.html"
    if index_file.is_file():
        return FileResponse(index_file, headers={"Cache-Control": "no-cache"})

    return JSONResponse({"status": "running", "docs": "/docs"}, status_code=200)
