import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Printer,
  RotateCcw,
  UserCheck,
  AlertCircle,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { FalconCrest } from './FalconCrest';

const TODAY_REFERENCE = new Date('2026-10-20T00:00:00');

export function calculateAgeFromDob(dobString) {
  if (!dobString) return '';
  const parts = dobString.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return '';
  const [year, month, day] = parts;
  if (year < 1900) return '';

  const now = new Date();
  const ref = now.getFullYear() >= 2026 ? now : TODAY_REFERENCE;
  let age = ref.getFullYear() - year;
  const mDiff = ref.getMonth() + 1 - month;
  if (mDiff < 0 || (mDiff === 0 && ref.getDate() < day)) {
    age -= 1;
  }
  return age >= 0 && age <= 110 ? String(age) : '';
}

export function getProgramForAge(ageVal) {
  const n = Number(ageVal);
  if (!Number.isNaN(n) && n > 0) {
    if (n <= 12) return 'Youth Foundation (Ages 5–12)';
    if (n <= 17) return 'Junior & Teen Cadets (Ages 13–17)';
  }
  return 'Adult Traditional Karate (Ages 18+)';
}

const INITIAL_FORM = {
  name: '',
  age: '',
  sex: 'Male',
  dateOfBirth: '',
  placeOfBirth: '',
  address: '',
  program: 'Adult Traditional Karate (Ages 18+)',
};

export function RegistrationSection({
  nameInputRef,
  selectedProgramPreset,
  editingStudent,
  onCancelEdit,
  onStudentSaved,
  onOpenPrintModal,
}) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [confirmedStudent, setConfirmedStudent] = useState(null);

  useEffect(() => {
    if (selectedProgramPreset && !editingStudent) {
      setFormData((prev) => ({ ...prev, program: selectedProgramPreset }));
      setConfirmedStudent(null);
    }
  }, [selectedProgramPreset, editingStudent]);

  useEffect(() => {
    if (editingStudent) {
      setConfirmedStudent(null);
      setErrors({});
      setServerError('');
      setFormData({
        name: editingStudent.name || '',
        age: String(editingStudent.age ?? ''),
        sex: editingStudent.sex || 'Male',
        dateOfBirth: editingStudent.dateOfBirth || '',
        placeOfBirth: editingStudent.placeOfBirth || '',
        address: editingStudent.address || '',
        program: editingStudent.program || getProgramForAge(editingStudent.age),
      });
    }
  }, [editingStudent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setServerError('');
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    if (name === 'dateOfBirth') {
      const computedAge = calculateAgeFromDob(value);
      setFormData((prev) => {
        const nextAge = computedAge !== '' ? computedAge : prev.age;
        return {
          ...prev,
          dateOfBirth: value,
          age: nextAge,
          program: nextAge ? getProgramForAge(nextAge) : prev.program,
        };
      });
      if (computedAge !== '' && errors.age) {
        setErrors((prev) => ({ ...prev, age: '' }));
      }
      return;
    }

    if (name === 'age') {
      setFormData((prev) => ({
        ...prev,
        age: value,
        program: value ? getProgramForAge(value) : prev.program,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateClient = () => {
    const nextErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      nextErrors.name = 'Please enter the student’s full name.';
    }
    const ageNum = Number(formData.age);
    if (
      !String(formData.age).trim() ||
      Number.isNaN(ageNum) ||
      !Number.isInteger(ageNum) ||
      ageNum < 3 ||
      ageNum > 110
    ) {
      nextErrors.age = 'Please enter a valid age between 3 and 110.';
    }
    if (!formData.sex) {
      nextErrors.sex = 'Please select sex.';
    }
    if (!formData.dateOfBirth) {
      nextErrors.dateOfBirth = 'Please select date of birth.';
    }
    if (!formData.placeOfBirth.trim() || formData.placeOfBirth.trim().length < 2) {
      nextErrors.placeOfBirth = 'Please enter place of birth.';
    }
    if (!formData.address.trim() || formData.address.trim().length < 5) {
      nextErrors.address = 'Please enter complete residential address.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validateClient()) return;

    setSubmitting(true);
    try {
      const isEdit = Boolean(editingStudent?.id);
      const endpoint = isEdit ? `/api/students/${encodeURIComponent(editingStudent.id)}` : '/api/students';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          age: Number(formData.age),
          sex: formData.sex,
          dateOfBirth: formData.dateOfBirth,
          placeOfBirth: formData.placeOfBirth.trim(),
          address: formData.address.trim(),
          program: formData.program,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.errors) setErrors(data.errors);
        setServerError(data.error || 'Unable to save registration.');
        return;
      }

      setConfirmedStudent(data.student);
      onStudentSaved(data.student, isEdit);

      if (!isEdit) {
        setFormData(INITIAL_FORM);
      } else {
        onCancelEdit();
      }
    } catch {
      setServerError('Network error while connecting to the dojo registration server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetNew = () => {
    setConfirmedStudent(null);
    setErrors({});
    setServerError('');
    setFormData(INITIAL_FORM);
    if (nameInputRef?.current) {
      nameInputRef.current.focus();
    }
  };

  const previewRecord = confirmedStudent || {
    id: editingStudent?.id || 'KKA-2026-NEW',
    name: formData.name.trim() || 'Student Full Name',
    age: formData.age || '—',
    sex: formData.sex || '—',
    dateOfBirth: formData.dateOfBirth || 'YYYY-MM-DD',
    placeOfBirth: formData.placeOfBirth.trim() || 'City, State / Country',
    address: formData.address.trim() || 'Residential street address, postcode & city',
    program: formData.program,
    rank: editingStudent?.rank || '10th Kyu · White Belt',
  };

  return (
    <section id="registration" className="bg-washi-warm border-t border-b border-washi-border py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] text-crimson uppercase mb-2">
            Official Dojo Admission · 入門申込書
          </p>
          <h2 className="font-dojo text-3xl sm:text-4xl font-bold text-sumi mb-3">
            {editingStudent ? `Update Student Record (${editingStudent.id})` : 'New Student Registration'}
          </h2>
          <p className="text-base text-sumi-muted">
            Complete the student details below to register directly into{' '}
            <strong className="text-sumi font-medium">Kinnotaka Karate Academy</strong>. All fields marked with{' '}
            <span className="text-crimson font-semibold">*</span> are required for official dojo enrollment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Columns: Registration Form */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-washi-border shadow-sm p-6 sm:p-8">
            {editingStudent && (
              <div className="mb-6 p-3.5 rounded-lg bg-kiniro-light border border-kiniro/30 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-sumi">
                  Editing registration for <strong>{editingStudent.name}</strong> ({editingStudent.id})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onCancelEdit();
                    setFormData(INITIAL_FORM);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-crimson hover:underline"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancel Edit</span>
                </button>
              </div>
            )}

            {serverError && (
              <div className="mb-6 p-4 rounded-lg bg-crimson-soft border border-crimson/30 flex items-start gap-3 text-sm text-crimson">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* 1. Full Name */}
              <div>
                <label htmlFor="student-name" className="block text-sm font-semibold text-sumi mb-1.5">
                  Full Name <span className="text-crimson">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  id="student-name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Aiman Hakim bin Razak"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm text-sumi placeholder:text-sumi-light/70 focus:outline-none focus:ring-2 focus:ring-crimson/25 ${
                    errors.name ? 'border-crimson bg-crimson-soft/40' : 'border-washi-border bg-white'
                  }`}
                />
                {errors.name && <p className="mt-1.5 text-xs font-medium text-crimson">{errors.name}</p>}
              </div>

              {/* 2 & 3: Date of Birth + Age side-by-side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="student-dob" className="block text-sm font-semibold text-sumi mb-1.5">
                    Date of Birth <span className="text-crimson">*</span>
                  </label>
                  <input
                    id="student-dob"
                    name="dateOfBirth"
                    type="date"
                    required
                    max="2023-12-31"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm text-sumi focus:outline-none focus:ring-2 focus:ring-crimson/25 ${
                      errors.dateOfBirth ? 'border-crimson bg-crimson-soft/40' : 'border-washi-border bg-white'
                    }`}
                  />
                  {errors.dateOfBirth && (
                    <p className="mt-1.5 text-xs font-medium text-crimson">{errors.dateOfBirth}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="student-age" className="block text-sm font-semibold text-sumi">
                      Age <span className="text-crimson">*</span>
                    </label>
                    <span className="text-[11px] text-sumi-light">Years old</span>
                  </div>
                  <input
                    id="student-age"
                    name="age"
                    type="number"
                    min="3"
                    max="110"
                    required
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="e.g., 14"
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm text-sumi placeholder:text-sumi-light/70 focus:outline-none focus:ring-2 focus:ring-crimson/25 ${
                      errors.age ? 'border-crimson bg-crimson-soft/40' : 'border-washi-border bg-white'
                    }`}
                  />
                  {errors.age && <p className="mt-1.5 text-xs font-medium text-crimson">{errors.age}</p>}
                </div>
              </div>

              {/* 4. Sex */}
              <div>
                <span className="block text-sm font-semibold text-sumi mb-1.5">
                  Sex <span className="text-crimson">*</span>
                </span>
                <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Student Sex">
                  {['Male', 'Female', 'Other'].map((option) => {
                    const active = formData.sex === option;
                    return (
                      <label
                        key={option}
                        className={`cursor-pointer flex items-center justify-center py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors ${
                          active
                            ? 'bg-crimson text-white border-crimson shadow-sm'
                            : 'bg-white text-sumi border-washi-border hover:bg-washi'
                        }`}
                      >
                        <input
                          type="radio"
                          name="sex"
                          value={option}
                          checked={active}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.sex && <p className="mt-1.5 text-xs font-medium text-crimson">{errors.sex}</p>}
              </div>

              {/* 5. Place of Birth */}
              <div>
                <label htmlFor="student-pob" className="block text-sm font-semibold text-sumi mb-1.5">
                  Place of Birth <span className="text-crimson">*</span>
                </label>
                <input
                  id="student-pob"
                  name="placeOfBirth"
                  type="text"
                  required
                  value={formData.placeOfBirth}
                  onChange={handleChange}
                  placeholder="e.g., Subang Jaya, Selangor"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm text-sumi placeholder:text-sumi-light/70 focus:outline-none focus:ring-2 focus:ring-crimson/25 ${
                    errors.placeOfBirth ? 'border-crimson bg-crimson-soft/40' : 'border-washi-border bg-white'
                  }`}
                />
                {errors.placeOfBirth && (
                  <p className="mt-1.5 text-xs font-medium text-crimson">{errors.placeOfBirth}</p>
                )}
              </div>

              {/* 6. Residential Address */}
              <div>
                <label htmlFor="student-address" className="block text-sm font-semibold text-sumi mb-1.5">
                  Address <span className="text-crimson">*</span>
                </label>
                <textarea
                  id="student-address"
                  name="address"
                  rows={3}
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete street address, city, postcode, and state"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm text-sumi placeholder:text-sumi-light/70 focus:outline-none focus:ring-2 focus:ring-crimson/25 resize-y ${
                    errors.address ? 'border-crimson bg-crimson-soft/40' : 'border-washi-border bg-white'
                  }`}
                />
                {errors.address && <p className="mt-1.5 text-xs font-medium text-crimson">{errors.address}</p>}
              </div>

              {/* Assigned Dojo Division (auto-matched by age, customizable) */}
              <div>
                <label htmlFor="student-program" className="block text-sm font-semibold text-sumi mb-1.5">
                  Assigned Training Division
                </label>
                <select
                  id="student-program"
                  name="program"
                  value={formData.program}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-washi-border bg-washi px-4 py-2.5 text-sm text-sumi focus:outline-none focus:ring-2 focus:ring-crimson/25"
                >
                  <option value="Youth Foundation (Ages 5–12)">Youth Foundation (Ages 5–12)</option>
                  <option value="Junior & Teen Cadets (Ages 13–17)">Junior & Teen Cadets (Ages 13–17)</option>
                  <option value="Adult Traditional Karate (Ages 18+)">Adult Traditional Karate (Ages 18+)</option>
                </select>
              </div>

              {/* Submit Action */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 min-w-[210px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-crimson hover:bg-crimson-dark disabled:opacity-60 text-white text-sm font-semibold shadow-sm transition-colors"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>
                    {submitting
                      ? 'Saving Registration...'
                      : editingStudent
                      ? 'Save Updated Registration'
                      : 'Complete Student Registration'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleResetNew}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-lg border border-washi-border hover:bg-washi text-sm font-medium text-sumi-muted transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right 5 Columns: Live Admission Card Preview / Official Confirmation */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-xl border border-washi-border shadow-sm overflow-hidden">
              {/* Top Header Band */}
              <div
                className={`px-6 py-4 flex items-center justify-between ${
                  confirmedStudent ? 'bg-[#163826] text-white' : 'bg-[#181615] text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FalconCrest className="w-9 h-9 shrink-0" dark />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E5C17B]">
                      Kinnotaka Karate Academy
                    </p>
                    <p className="font-dojo text-sm font-bold">
                      {confirmedStudent ? 'Admission Confirmed' : 'Student Registration Card'}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded text-[11px] font-mono font-semibold bg-white/15">
                  {previewRecord.id}
                </span>
              </div>

              {/* Confirmed Banner */}
              {confirmedStudent && (
                <div className="px-6 py-3 bg-[#ECFDF5] border-b border-[#A7F3D0] flex items-center gap-2.5 text-xs font-medium text-[#065F46]">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#059669]" />
                  <span>
                    Official registration saved! Added to the enrolled students registry below.
                  </span>
                </div>
              )}

              {/* Card Details Body */}
              <div className="p-6 space-y-4 text-sm">
                <div className="pb-3.5 border-b border-washi-warm flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-sumi-light block">
                      Student Name
                    </span>
                    <p className="font-dojo text-lg font-bold text-sumi mt-0.5 break-words">
                      {previewRecord.name}
                    </p>
                  </div>
                  <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-washi-warm text-sumi border border-washi-border">
                    {previewRecord.rank}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-3.5 border-b border-washi-warm">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-sumi-light block">
                      Age
                    </span>
                    <p className="font-medium text-sumi mt-0.5">
                      {previewRecord.age !== '—' ? `${previewRecord.age} Years Old` : '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-sumi-light block">
                      Sex
                    </span>
                    <p className="font-medium text-sumi mt-0.5">{previewRecord.sex}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3.5 border-b border-washi-warm">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-sumi-light block">
                      Date of Birth
                    </span>
                    <p className="font-medium text-sumi mt-0.5">{previewRecord.dateOfBirth}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-sumi-light block">
                      Place of Birth
                    </span>
                    <p className="font-medium text-sumi mt-0.5 break-words">{previewRecord.placeOfBirth}</p>
                  </div>
                </div>

                <div className="pb-3.5 border-b border-washi-warm">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-sumi-light block">
                    Residential Address
                  </span>
                  <p className="font-medium text-sumi mt-0.5 leading-relaxed break-words">
                    {previewRecord.address}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-sumi-light block">
                    Assigned Division
                  </span>
                  <p className="font-semibold text-crimson mt-0.5">{previewRecord.program}</p>
                </div>

                {confirmedStudent ? (
                  <div className="pt-3 flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => onOpenPrintModal(confirmedStudent)}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-sumi hover:bg-black text-white text-xs font-semibold transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                      <span>View & Print Official Slip</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetNew}
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg border border-washi-border hover:bg-washi text-xs font-semibold text-sumi transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-crimson" />
                      <span>New Student</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-sumi-light pt-1">
                    Live preview updates automatically as you enter student information.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
