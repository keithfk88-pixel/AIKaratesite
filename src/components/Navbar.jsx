import React, { useState } from 'react';
import { Menu, X, UserPlus, Users, Database } from 'lucide-react';
import { FalconCrest } from './FalconCrest';

export function Navbar({ studentCount, supabaseStatus, onOpenSupabaseModal, onJumpToRegister }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const isSupabaseLive = Boolean(supabaseStatus?.connected && supabaseStatus?.tableReady);

  const handleRegisterClick = (e) => {
    e.preventDefault();
    setMobileOpen(false);
    onJumpToRegister();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-washi-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Academy Brand */}
        <a href="#top" className="flex items-center gap-3.5 group focus:outline-none">
          <FalconCrest className="w-11 h-11 shrink-0 transition-transform duration-300 group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-crimson uppercase">
              金鷹空手道場 · Est. 1998
            </span>
            <span className="font-dojo text-lg sm:text-xl font-bold tracking-tight text-sumi leading-tight">
              Kinnotaka Karate Academy
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-sumi-muted">
          <a href="#about" className="hover:text-crimson transition-colors">
            About Dojo
          </a>
          <a href="#programs" className="hover:text-crimson transition-colors">
            Programs
          </a>
          <a href="#registration" onClick={handleRegisterClick} className="hover:text-crimson transition-colors">
            Registration
          </a>
          <a
            href="#registry"
            className="inline-flex items-center gap-2 hover:text-crimson transition-colors"
          >
            <span>Registry</span>
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-washi-warm text-sumi border border-washi-border">
              {studentCount}
            </span>
          </a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenSupabaseModal}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-washi hover:bg-washi-warm border border-washi-border text-xs font-semibold text-sumi transition-colors"
            title="Inspect FastAPI & Supabase Database Connection"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseLive ? 'bg-[#059669]' : 'bg-[#D99B38]'
              }`}
            />
            <span>{isSupabaseLive ? 'Supabase Live' : 'FastAPI · Supabase'}</span>
          </button>

          <a
            href="#registration"
            onClick={handleRegisterClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-crimson hover:bg-crimson-dark text-white text-sm font-semibold shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Student</span>
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden inline-flex items-center justify-center p-2.5 rounded-lg text-sumi hover:bg-washi-warm border border-washi-border"
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-washi-border px-4 pt-3 pb-5 space-y-3">
          <a
            href="#about"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-sm font-medium text-sumi hover:text-crimson"
          >
            About Dojo
          </a>
          <a
            href="#programs"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-sm font-medium text-sumi hover:text-crimson"
          >
            Programs & Schedule
          </a>
          <a
            href="#registry"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-between py-2 text-sm font-medium text-sumi hover:text-crimson"
          >
            <span className="inline-flex items-center gap-2">
              <Users className="w-4 h-4 text-crimson" />
              Enrolled Student Registry
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-washi-warm border border-washi-border">
              {studentCount}
            </span>
          </a>
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onOpenSupabaseModal();
            }}
            className="w-full flex items-center justify-between py-2 text-sm font-medium text-sumi hover:text-crimson"
          >
            <span className="inline-flex items-center gap-2">
              <Database className="w-4 h-4 text-crimson" />
              FastAPI & Supabase Setup
            </span>
            <span className="text-xs font-semibold text-sumi-muted">
              {isSupabaseLive ? 'Connected' : 'Configure'}
            </span>
          </button>
          <a
            href="#registration"
            onClick={handleRegisterClick}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-crimson text-white text-sm font-semibold"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Student Registration</span>
          </a>
        </div>
      )}
    </header>
  );
}
