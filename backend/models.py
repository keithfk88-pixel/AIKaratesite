from typing import Optional
from pydantic import BaseModel, Field, field_validator


def derive_program_by_age(age: int) -> str:
    if age <= 12:
        return "Youth Foundation (Ages 5–12)"
    if age <= 17:
        return "Junior & Teen Cadets (Ages 13–17)"
    return "Adult Traditional Karate (Ages 18+)"


class StudentPayload(BaseModel):
    name: str = Field(..., description="Full name of the student")
    age: int = Field(..., ge=3, le=110, description="Age in completed years (3–110)")
    sex: str = Field(..., description="Student sex (Male, Female, or Other)")
    dateOfBirth: str = Field(..., description="Date of birth in YYYY-MM-DD format")
    placeOfBirth: str = Field(..., description="City and state/country of birth")
    address: str = Field(..., description="Full residential street address")
    program: Optional[str] = Field(None, description="Assigned karate division")

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        cleaned = v.strip()
        if len(cleaned) < 2:
            raise ValueError("Please enter the student’s full name (at least 2 characters).")
        return cleaned

    @field_validator("sex")
    @classmethod
    def validate_sex(cls, v: str) -> str:
        cleaned = v.strip()
        if cleaned not in ("Male", "Female", "Other"):
            raise ValueError("Sex must be Male, Female, or Other.")
        return cleaned

    @field_validator("dateOfBirth")
    @classmethod
    def validate_dob(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Please provide the student’s date of birth.")
        return cleaned

    @field_validator("placeOfBirth")
    @classmethod
    def validate_pob(cls, v: str) -> str:
        cleaned = v.strip()
        if len(cleaned) < 2:
            raise ValueError("Please enter the student’s place of birth.")
        return cleaned

    @field_validator("address")
    @classmethod
    def validate_address(cls, v: str) -> str:
        cleaned = v.strip()
        if len(cleaned) < 5:
            raise ValueError("Please enter the complete residential address.")
        return cleaned

    def resolved_program(self) -> str:
        if self.program and self.program.strip():
            return self.program.strip()
        return derive_program_by_age(self.age)


class StudentRecord(BaseModel):
    id: str
    name: str
    age: int
    sex: str
    dateOfBirth: str
    placeOfBirth: str
    address: str
    program: str
    rank: str = "10th Kyu · White Belt"
    registeredAt: str
    updatedAt: Optional[str] = None
    source: Optional[str] = None


class StudentListResponse(BaseModel):
    students: list[StudentRecord]
    backend: str = "fastapi"
    storage: str


class StudentMutationResponse(BaseModel):
    message: str
    student: StudentRecord
    storage: str


class SupabaseConfigRequest(BaseModel):
    url: str = Field(..., description="Supabase Project URL (e.g. https://xyz.supabase.co)")
    key: str = Field(..., description="Supabase Anon or Service Role API Key")


class SupabaseStatusResponse(BaseModel):
    backend: str = "FastAPI"
    supabaseSdkInstalled: bool = True
    configured: bool
    connected: bool
    tableReady: bool
    activeStorage: str
    projectUrlMasked: Optional[str] = None
    tableName: str
    message: str
    schemaSql: str
