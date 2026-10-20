from __future__ import annotations

import json
import os
import re
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from dotenv import load_dotenv
from supabase import Client, create_client

from backend.models import StudentPayload

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
LOCAL_STUDENTS_FILE = DATA_DIR / "students.json"
RUNTIME_SUPABASE_CONFIG = DATA_DIR / "supabase_config.json"
SCHEMA_SQL_FILE = BASE_DIR / "supabase" / "schema.sql"

load_dotenv(BASE_DIR / ".env")


def _mask_url(url: str) -> str:
    if not url:
        return ""
    return url.strip().rstrip("/")


def _row_to_camel(row: dict[str, Any], source: str = "supabase") -> dict[str, Any]:
    return {
        "id": str(row.get("id", "")),
        "name": row.get("name", ""),
        "age": int(row.get("age", 0)),
        "sex": row.get("sex", "Male"),
        "dateOfBirth": str(row.get("date_of_birth") or row.get("dateOfBirth") or ""),
        "placeOfBirth": row.get("place_of_birth") or row.get("placeOfBirth") or "",
        "address": row.get("address", ""),
        "program": row.get("program", "Adult Traditional Karate (Ages 18+)"),
        "rank": row.get("rank", "10th Kyu · White Belt"),
        "registeredAt": str(row.get("registered_at") or row.get("registeredAt") or ""),
        "updatedAt": str(row.get("updated_at") or row.get("updatedAt") or "") or None,
        "source": source,
    }


def _record_to_supabase_row(record: dict[str, Any]) -> dict[str, Any]:
    row = {
        "id": record["id"],
        "name": record["name"],
        "age": int(record["age"]),
        "sex": record["sex"],
        "date_of_birth": record["dateOfBirth"],
        "place_of_birth": record["placeOfBirth"],
        "address": record["address"],
        "program": record["program"],
        "rank": record.get("rank") or "10th Kyu · White Belt",
    }
    if record.get("registeredAt"):
        row["registered_at"] = record["registeredAt"]
    return row


class StudentRepository:
    """
    Dual-mode repository powered by official `supabase-py`:
      - Primary: Supabase PostgreSQL (`public.students`) whenever credentials + table are ready.
      - Automatic Fallback: Local JSON store (`data/students.json`) when Supabase is not yet connected.
    """

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self.table_name = os.getenv("SUPABASE_TABLE", "students").strip() or "students"
        self._client: Optional[Client] = None
        self._supabase_url: str = ""
        self._supabase_key: str = ""
        self._connected: bool = False
        self._table_ready: bool = False
        self._status_message: str = "Supabase credentials not configured yet. Using local fallback store."
        self._ensure_local_store()
        self.reload_credentials()

    def _ensure_local_store(self) -> None:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        if not LOCAL_STUDENTS_FILE.exists():
            LOCAL_STUDENTS_FILE.write_text("[]\n", encoding="utf-8")

    def get_schema_sql(self) -> str:
        if SCHEMA_SQL_FILE.exists():
            return SCHEMA_SQL_FILE.read_text(encoding="utf-8")
        return ""

    def reload_credentials(self) -> dict[str, Any]:
        load_dotenv(BASE_DIR / ".env", override=True)
        url = (os.getenv("SUPABASE_URL") or "").strip()
        key = (
            os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            or os.getenv("SUPABASE_KEY")
            or os.getenv("SUPABASE_ANON_KEY")
            or ""
        ).strip()

        if (not url or not key or "your-project-id" in url) and RUNTIME_SUPABASE_CONFIG.exists():
            try:
                cfg = json.loads(RUNTIME_SUPABASE_CONFIG.read_text(encoding="utf-8"))
                url = (cfg.get("url") or "").strip()
                key = (cfg.get("key") or "").strip()
            except Exception:
                pass

        if not url or not key or "your-project-id" in url:
            self._client = None
            self._supabase_url = ""
            self._supabase_key = ""
            self._connected = False
            self._table_ready = False
            self._status_message = (
                "Awaiting Supabase project URL & API key. Local persistence is active so registration works uninterrupted."
            )
            return self.get_status()

        return self._connect_and_probe(url, key)

    def _connect_and_probe(self, url: str, key: str) -> dict[str, Any]:
        self._supabase_url = url.strip().rstrip("/")
        self._supabase_key = key.strip()
        try:
            client = create_client(self._supabase_url, self._supabase_key)
            # Probe `public.students` table
            client.table(self.table_name).select("id").limit(1).execute()
            self._client = client
            self._connected = True
            self._table_ready = True
            self._status_message = f"Connected to Supabase ({self._supabase_url}) — `{self.table_name}` table active."
        except Exception as exc:
            err_str = str(exc)
            # Distinguish missing table vs invalid credentials/host
            if "PGRST205" in err_str or "42P01" in err_str or "does not exist" in err_str or "schema cache" in err_str:
                self._client = client  # Credentials reached PostgREST, table needs creation
                self._connected = True
                self._table_ready = False
                self._status_message = (
                    f"Connected to Supabase project ({self._supabase_url}), "
                    f"but table `public.{self.table_name}` does not exist yet. Run `supabase/schema.sql` in the Supabase SQL Editor."
                )
            else:
                self._client = None
                self._connected = False
                self._table_ready = False
                self._status_message = f"Supabase connection failed: {err_str}"
        return self.get_status()

    def save_runtime_credentials(self, url: str, key: str) -> dict[str, Any]:
        cleaned_url = url.strip().rstrip("/")
        cleaned_key = key.strip()
        status = self._connect_and_probe(cleaned_url, cleaned_key)
        if self._connected:
            DATA_DIR.mkdir(parents=True, exist_ok=True)
            RUNTIME_SUPABASE_CONFIG.write_text(
                json.dumps({"url": cleaned_url, "key": cleaned_key}, indent=2) + "\n",
                encoding="utf-8",
            )
        return status

    def clear_runtime_credentials(self) -> dict[str, Any]:
        if RUNTIME_SUPABASE_CONFIG.exists():
            RUNTIME_SUPABASE_CONFIG.unlink()
        return self.reload_credentials()

    @property
    def use_supabase(self) -> bool:
        return bool(self._client and self._connected and self._table_ready)

    @property
    def active_storage_label(self) -> str:
        return "supabase" if self.use_supabase else "local_json_fallback"

    def get_status(self) -> dict[str, Any]:
        return {
            "backend": "FastAPI",
            "supabaseSdkInstalled": True,
            "configured": bool(self._supabase_url and self._supabase_key),
            "connected": self._connected,
            "tableReady": self._table_ready,
            "activeStorage": self.active_storage_label,
            "projectUrlMasked": _mask_url(self._supabase_url) if self._supabase_url else None,
            "tableName": self.table_name,
            "message": self._status_message,
            "schemaSql": self.get_schema_sql(),
        }

    # --- Local helper methods ---
    def _read_local(self) -> list[dict[str, Any]]:
        self._ensure_local_store()
        try:
            raw = json.loads(LOCAL_STUDENTS_FILE.read_text(encoding="utf-8"))
            return raw if isinstance(raw, list) else []
        except Exception:
            return []

    def _write_local(self, records: list[dict[str, Any]]) -> None:
        self._ensure_local_store()
        tmp_path = LOCAL_STUDENTS_FILE.with_suffix(".json.tmp")
        tmp_path.write_text(json.dumps(records, indent=2) + "\n", encoding="utf-8")
        tmp_path.replace(LOCAL_STUDENTS_FILE)

    def _next_id(self, existing: list[dict[str, Any]]) -> str:
        max_num = 1000
        for item in existing:
            match = re.search(r"(\d+)$", str(item.get("id", "")))
            if match:
                n = int(match.group(1))
                if n > max_num:
                    max_num = n
        return f"KKA-2026-{max_num + 1}"

    # --- CRUD Operations ---
    def list_students(self) -> list[dict[str, Any]]:
        if self.use_supabase and self._client:
            res = (
                self._client.table(self.table_name)
                .select("*")
                .order("registered_at", desc=True)
                .execute()
            )
            return [_row_to_camel(r, source="supabase") for r in (res.data or [])]

        with self._lock:
            records = self._read_local()
        sorted_records = sorted(
            records,
            key=lambda s: str(s.get("registeredAt", "")),
            reverse=True,
        )
        return [_row_to_camel(r, source="local") for r in sorted_records]

    def get_student(self, student_id: str) -> Optional[dict[str, Any]]:
        if self.use_supabase and self._client:
            res = (
                self._client.table(self.table_name)
                .select("*")
                .eq("id", student_id)
                .limit(1)
                .execute()
            )
            if res.data:
                return _row_to_camel(res.data[0], source="supabase")
            return None

        with self._lock:
            for item in self._read_local():
                if item.get("id") == student_id:
                    return _row_to_camel(item, source="local")
        return None

    def create_student(self, payload: StudentPayload) -> dict[str, Any]:
        now_iso = datetime.now(timezone.utc).isoformat()
        existing = self.list_students()
        new_id = self._next_id(existing)

        record = {
            "id": new_id,
            "name": payload.name,
            "age": payload.age,
            "sex": payload.sex,
            "dateOfBirth": payload.dateOfBirth,
            "placeOfBirth": payload.placeOfBirth,
            "address": payload.address,
            "program": payload.resolved_program(),
            "rank": "10th Kyu · White Belt",
            "registeredAt": now_iso,
        }

        if self.use_supabase and self._client:
            row = _record_to_supabase_row(record)
            res = self._client.table(self.table_name).insert(row).execute()
            created = res.data[0] if res.data else row
            return _row_to_camel(created, source="supabase")

        with self._lock:
            local_items = self._read_local()
            record["id"] = self._next_id(local_items)
            local_items.append(record)
            self._write_local(local_items)
        return _row_to_camel(record, source="local")

    def update_student(self, student_id: str, payload: StudentPayload) -> Optional[dict[str, Any]]:
        now_iso = datetime.now(timezone.utc).isoformat()

        if self.use_supabase and self._client:
            update_fields = {
                "name": payload.name,
                "age": payload.age,
                "sex": payload.sex,
                "date_of_birth": payload.dateOfBirth,
                "place_of_birth": payload.placeOfBirth,
                "address": payload.address,
                "program": payload.resolved_program(),
                "updated_at": now_iso,
            }
            res = (
                self._client.table(self.table_name)
                .update(update_fields)
                .eq("id", student_id)
                .execute()
            )
            if not res.data:
                return None
            return _row_to_camel(res.data[0], source="supabase")

        with self._lock:
            local_items = self._read_local()
            for idx, item in enumerate(local_items):
                if item.get("id") == student_id:
                    updated = {
                        **item,
                        "name": payload.name,
                        "age": payload.age,
                        "sex": payload.sex,
                        "dateOfBirth": payload.dateOfBirth,
                        "placeOfBirth": payload.placeOfBirth,
                        "address": payload.address,
                        "program": payload.resolved_program(),
                        "updatedAt": now_iso,
                    }
                    local_items[idx] = updated
                    self._write_local(local_items)
                    return _row_to_camel(updated, source="local")
        return None

    def delete_student(self, student_id: str) -> bool:
        if self.use_supabase and self._client:
            res = (
                self._client.table(self.table_name)
                .delete()
                .eq("id", student_id)
                .execute()
            )
            return bool(res.data)

        with self._lock:
            local_items = self._read_local()
            filtered = [item for item in local_items if item.get("id") != student_id]
            if len(filtered) == len(local_items):
                return False
            self._write_local(filtered)
            return True

    def sync_local_to_supabase(self) -> dict[str, Any]:
        self.reload_credentials()
        if not self.use_supabase or not self._client:
            raise RuntimeError(self._status_message)
        local_items = self._read_local()
        if not local_items:
            return {"synced": 0, "message": "No local student records to sync."}
        rows = [_record_to_supabase_row(r) for r in local_items]
        res = self._client.table(self.table_name).upsert(rows, on_conflict="id").execute()
        count = len(res.data) if res.data else len(rows)
        return {"synced": count, "message": f"Successfully synced {count} student record(s) to Supabase."}


repo = StudentRepository()
