import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Printer,
  Pencil,
  Trash2,
  Users,
  MapPin,
  Cake,
} from 'lucide-react';

export function StudentRegistrySection({
  students,
  loading,
  newestStudentId,
  onViewSlip,
  onEditStudent,
  onDeleteStudent,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sexFilter, setSexFilter] = useState('All');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return students.filter((s) => {
      const matchesSex = sexFilter === 'All' || s.sex === sexFilter;
      if (!matchesSex) return false;
      if (!q) return true;
      return (
        String(s.name || '').toLowerCase().includes(q) ||
        String(s.id || '').toLowerCase().includes(q) ||
        String(s.placeOfBirth || '').toLowerCase().includes(q) ||
        String(s.address || '').toLowerCase().includes(q)
      );
    });
  }, [students, searchQuery, sexFilter]);

  const handleExportCsv = () => {
    const headers = [
      'Student ID',
      'Full Name',
      'Age',
      'Sex',
      'Date of Birth',
      'Place of Birth',
      'Address',
      'Program Division',
      'Registered At',
    ];
    const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const rows = filteredStudents.map((s) =>
      [
        s.id,
        s.name,
        s.age,
        s.sex,
        s.dateOfBirth,
        s.placeOfBirth,
        s.address,
        s.program,
        s.registeredAt,
      ]
        .map(escapeCsv)
        .join(',')
    );
    const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'kinnotaka-student-registrations.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section id="registry" className="bg-washi py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-crimson uppercase mb-2">
              Dojo Enrollment Records · 門下生名簿
            </p>
            <h2 className="font-dojo text-3xl sm:text-4xl font-bold text-sumi">
              Registered Students Directory
            </h2>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredStudents.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-washi-warm disabled:opacity-50 border border-washi-border text-sm font-semibold text-sumi shadow-sm transition-colors self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-crimson" />
            <span>Export CSV ({filteredStudents.length})</span>
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white rounded-xl border border-washi-border p-4 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-sm">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-sumi-light absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, ID, place of birth, or address..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-washi-border text-sm text-sumi placeholder:text-sumi-light/80 focus:outline-none focus:ring-2 focus:ring-crimson/20"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-washi p-1 rounded-lg border border-washi-border self-start sm:self-auto">
            {['All', 'Male', 'Female', 'Other'].map((filterOpt) => (
              <button
                key={filterOpt}
                type="button"
                onClick={() => setSexFilter(filterOpt)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  sexFilter === filterOpt
                    ? 'bg-sumi text-white shadow-sm'
                    : 'text-sumi-muted hover:text-sumi'
                }`}
              >
                {filterOpt}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Table / Cards */}
        {loading ? (
          <div className="bg-white rounded-xl border border-washi-border p-12 text-center text-sm text-sumi-muted">
            Loading student records...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-xl border border-washi-border p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-sumi-light mx-auto" />
            <p className="font-semibold text-sumi">No matching student records found</p>
            <p className="text-sm text-sumi-muted">
              Register a new student using the admission form above or clear your search filter.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-washi-border shadow-sm overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-washi-warm/75 border-b border-washi-border text-[11px] font-semibold uppercase tracking-wider text-sumi-muted">
                    <th className="py-3.5 px-5">Student & ID</th>
                    <th className="py-3.5 px-4">Age & Sex</th>
                    <th className="py-3.5 px-4">Date & Place of Birth</th>
                    <th className="py-3.5 px-4">Residential Address</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-washi-border text-sm">
                  {filteredStudents.map((student) => {
                    const isNew = student.id === newestStudentId;
                    return (
                      <tr
                        key={student.id}
                        className={`transition-colors ${
                          isNew ? 'bg-[#FDF8EE]' : 'hover:bg-washi/60'
                        }`}
                      >
                        <td className="py-4 px-5 align-top">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sumi">{student.name}</span>
                            {isNew && (
                              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-crimson text-white">
                                New
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono text-sumi-light block mt-0.5">
                            {student.id}
                          </span>
                          <span className="inline-block mt-1 text-xs text-crimson font-medium">
                            {student.program}
                          </span>
                        </td>

                        <td className="py-4 px-4 align-top whitespace-nowrap">
                          <p className="font-medium text-sumi">{student.age} yrs</p>
                          <p className="text-xs text-sumi-muted">{student.sex}</p>
                        </td>

                        <td className="py-4 px-4 align-top">
                          <p className="font-medium text-sumi">{student.dateOfBirth}</p>
                          <p className="text-xs text-sumi-muted mt-0.5">{student.placeOfBirth}</p>
                        </td>

                        <td className="py-4 px-4 align-top max-w-xs">
                          <p className="text-sm text-sumi leading-snug">{student.address}</p>
                        </td>

                        <td className="py-4 px-5 align-top text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onViewSlip(student)}
                              title="View & Print Slip"
                              className="p-2 rounded-lg border border-washi-border hover:border-sumi text-sumi-muted hover:text-sumi transition-colors"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onEditStudent(student)}
                              title="Edit Registration"
                              className="p-2 rounded-lg border border-washi-border hover:border-crimson text-sumi-muted hover:text-crimson transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {confirmDeleteId === student.id ? (
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteStudent(student.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-crimson text-white text-xs font-semibold"
                              >
                                Confirm
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(student.id)}
                                title="Delete Record"
                                className="p-2 rounded-lg border border-washi-border hover:border-crimson text-sumi-muted hover:text-crimson transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Stacked Cards */}
            <div className="lg:hidden divide-y divide-washi-border">
              {filteredStudents.map((student) => (
                <div key={student.id} className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base text-sumi">{student.name}</h3>
                        {student.id === newestStudentId && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-crimson text-white">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-sumi-light">{student.id}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-washi-warm text-xs font-semibold text-sumi">
                      {student.age} yrs · {student.sex}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-sumi-muted">
                    <div className="flex items-center gap-1.5">
                      <Cake className="w-3.5 h-3.5 text-crimson shrink-0" />
                      <span>
                        Born {student.dateOfBirth} ({student.placeOfBirth})
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-crimson shrink-0 mt-0.5" />
                      <span>{student.address}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-washi-warm">
                    <span className="text-xs font-medium text-crimson">{student.program}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onViewSlip(student)}
                        className="px-2.5 py-1.5 rounded border border-washi-border text-xs font-semibold text-sumi"
                      >
                        Slip
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditStudent(student)}
                        className="px-2.5 py-1.5 rounded border border-washi-border text-xs font-semibold text-sumi"
                      >
                        Edit
                      </button>
                      {confirmDeleteId === student.id ? (
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteStudent(student.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2.5 py-1.5 rounded bg-crimson text-white text-xs font-semibold"
                        >
                          Confirm
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(student.id)}
                          className="px-2.5 py-1.5 rounded border border-washi-border text-xs font-semibold text-crimson"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
