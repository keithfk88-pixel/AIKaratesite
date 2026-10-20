import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutAndPrograms } from './components/AboutAndPrograms';
import { RegistrationSection } from './components/RegistrationSection';
import { StudentRegistrySection } from './components/StudentRegistrySection';
import { StudentSlipModal } from './components/StudentSlipModal';
import { SupabaseStatusModal } from './components/SupabaseStatusModal';
import { Footer } from './components/Footer';

export default function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newestStudentId, setNewestStudentId] = useState(null);
  const [selectedProgramPreset, setSelectedProgramPreset] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [modalStudent, setModalStudent] = useState(null);
  const [supabaseStatus, setSupabaseStatus] = useState(null);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  const nameInputRef = useRef(null);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(Array.isArray(data.students) ? data.students : []);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSupabaseStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/supabase/status');
      if (res.ok) {
        const data = await res.json();
        setSupabaseStatus(data);
      }
    } catch (err) {
      console.error('Failed to load backend status:', err);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchSupabaseStatus();
  }, [fetchStudents, fetchSupabaseStatus]);

  const scrollToRegistration = useCallback(() => {
    const el = document.getElementById('registration');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus({ preventScroll: true });
        }
      }, 450);
    }
  }, []);

  const handleSelectProgram = (programValue) => {
    setEditingStudent(null);
    setSelectedProgramPreset(programValue);
    scrollToRegistration();
  };

  const handleStudentSaved = (savedStudent, isEdit) => {
    setNewestStudentId(savedStudent.id);
    setStudents((prev) => {
      if (isEdit) {
        return prev.map((s) => (s.id === savedStudent.id ? savedStudent : s));
      }
      return [savedStudent, ...prev];
    });
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    scrollToRegistration();
  };

  const handleDeleteStudent = async (id) => {
    try {
      const res = await fetch(`/api/students/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s.id !== id));
        if (editingStudent?.id === id) {
          setEditingStudent(null);
        }
      }
    } catch (err) {
      console.error('Failed to remove student record:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-washi text-sumi">
      <Navbar
        studentCount={students.length}
        supabaseStatus={supabaseStatus}
        onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
        onJumpToRegister={scrollToRegistration}
      />

      <main className="flex-1">
        <HeroSection onJumpToRegister={scrollToRegistration} />

        <AboutAndPrograms onSelectProgram={handleSelectProgram} />

        <RegistrationSection
          nameInputRef={nameInputRef}
          selectedProgramPreset={selectedProgramPreset}
          editingStudent={editingStudent}
          onCancelEdit={() => setEditingStudent(null)}
          onStudentSaved={handleStudentSaved}
          onOpenPrintModal={(student) => setModalStudent(student)}
        />

        <StudentRegistrySection
          students={students}
          loading={loading}
          newestStudentId={newestStudentId}
          onViewSlip={(student) => setModalStudent(student)}
          onEditStudent={handleEditStudent}
          onDeleteStudent={handleDeleteStudent}
        />
      </main>

      <Footer />

      <StudentSlipModal student={modalStudent} onClose={() => setModalStudent(null)} />

      <SupabaseStatusModal
        open={supabaseModalOpen}
        statusData={supabaseStatus}
        onClose={() => setSupabaseModalOpen(false)}
        onStatusUpdated={(nextStatus) => setSupabaseStatus(nextStatus)}
        onStudentsSynced={fetchStudents}
      />
    </div>
  );
}
