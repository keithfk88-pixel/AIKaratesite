import React from 'react';
import { ArrowRight, ShieldCheck, Calendar, Award } from 'lucide-react';

export function HeroSection({ onJumpToRegister }) {
  return (
    <section id="top" className="relative overflow-hidden bg-[#141210] text-white">
      {/* Background Photograph with Calibrated Editorial Gradient Scrim */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-dojo.jpg"
          alt="Kinnotaka Karate Academy Sensei performing kata inside sunlit cedar dojo"
          className="w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(16,14,12,0.93) 0%, rgba(16,14,12,0.80) 50%, rgba(16,14,12,0.35) 100%)',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#D99B38]" />
            <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#F5EFE6]">
              2026 New Student Intake Open
            </span>
          </div>

          <h1 className="font-dojo text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-white leading-[1.13] mb-6">
            Discipline in Motion. Character Forged for Life.
          </h1>

          <p className="text-base sm:text-lg text-[#E6E0D8] leading-relaxed mb-9 max-w-xl">
            Welcome to <strong className="text-white font-semibold">Kinnotaka Karate Academy</strong> (金鷹空手道場).
            Rooted in authentic Japanese Shotokan lineage, we cultivate focus, respect, and physical mastery across
            youth, junior, and adult divisions.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onJumpToRegister}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-lg bg-crimson hover:bg-crimson-dark text-white text-base font-semibold shadow-lg transition-all"
            >
              <span>Register New Student</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#programs"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/25 text-base font-medium backdrop-blur-sm transition-colors"
            >
              <span>View Training Schedule</span>
            </a>
          </div>
        </div>
      </div>

      {/* Clean Bottom Credentials Strip */}
      <div className="relative border-t border-white/15 bg-black/45 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm text-[#EDE7DF]">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-[#D99B38] shrink-0" />
            <div>
              <p className="font-semibold text-white">Authentic JKA Lineage</p>
              <p className="text-xs text-[#C7BFB5]">Certified Black Belt Senseis</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-[#D99B38] shrink-0" />
            <div>
              <p className="font-semibold text-white">Structured Weekly Classes</p>
              <p className="text-xs text-[#C7BFB5]">Youth, Junior & Adult Tracks</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#D99B38] shrink-0" />
            <div>
              <p className="font-semibold text-white">Direct Online Admission</p>
              <p className="text-xs text-[#C7BFB5]">Instant Student ID & White Belt Placement</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
