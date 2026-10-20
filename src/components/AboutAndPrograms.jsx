import React from 'react';
import { Clock, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const PROGRAMS = [
  {
    title: 'Youth Foundation',
    subtitle: 'Ages 5–12 · Beginners Welcome',
    programValue: 'Youth Foundation (Ages 5–12)',
    schedule: 'Mon, Wed & Sat · 4:30 PM – 5:45 PM',
    description:
      'Builds coordination, posture, listening skills, and foundational kihon stances in an encouraging dojo environment.',
    highlights: ['Dojo etiquette & respect', 'Fundamental blocks & strikes', 'Safe non-contact drills'],
  },
  {
    title: 'Junior & Teen Cadets',
    subtitle: 'Ages 13–17 · Kyu to Dan Pathway',
    programValue: 'Junior & Teen Cadets (Ages 13–17)',
    schedule: 'Tue, Thu & Sat · 6:00 PM – 7:30 PM',
    description:
      'Develops athletic conditioning, traditional kata precision, and controlled kumite footwork for school-age practitioners.',
    highlights: ['Traditional Heian & Tekki kata', 'Agility & core conditioning', 'Tournament & grading prep'],
  },
  {
    title: 'Adult Traditional Karate',
    subtitle: 'Ages 18+ · All Experience Levels',
    programValue: 'Adult Traditional Karate (Ages 18+)',
    schedule: 'Mon, Wed & Fri · 7:45 PM – 9:15 PM',
    description:
      'Comprehensive Shotokan budō training combining practical self-defense biomechanics, breath control, and lifelong fitness.',
    highlights: ['Full-body strength & mobility', 'Bunkai practical self-defense', 'Formal kyu/dan belt progression'],
  },
];

const DOJO_KUN = [
  { jp: '一、人格完成に努むること', en: 'Seek perfection of character' },
  { jp: '一、誠の道を守ること', en: 'Be faithful and sincere' },
  { jp: '一、努力の精神を養うこと', en: 'Cultivate the spirit of effort' },
  { jp: '一、礼儀を重んずること', en: 'Respect others and etiquette' },
  { jp: '一、血気の勇を戒むること', en: 'Refrain from impetuous behavior' },
];

export function AboutAndPrograms({ onSelectProgram }) {
  return (
    <div className="bg-washi">
      {/* About & Philosophy Section */}
      <section id="about" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Photograph Column */}
          <div className="lg:col-span-6">
            <div className="relative rounded-xl overflow-hidden border border-washi-border shadow-md bg-white">
              <img
                src="/images/dojo-training.jpg"
                alt="Kinnotaka Karate Academy students practicing unison punches in dojo"
                className="w-full h-[360px] sm:h-[410px] object-cover"
              />
              <div className="px-5 py-3.5 bg-white border-t border-washi-border flex items-center justify-between text-xs text-sumi-muted">
                <span className="font-medium text-sumi">Kinnotaka Honbu Main Training Hall</span>
                <span className="font-semibold text-crimson tracking-wider uppercase">金鷹本館</span>
              </div>
            </div>
          </div>

          {/* Heritage Text Column */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-crimson uppercase mb-2">
                Our Heritage · Dojo Kun
              </p>
              <h2 className="font-dojo text-3xl sm:text-4xl font-bold text-sumi leading-tight">
                Where Traditional Etiquette Meets Modern Excellence
              </h2>
            </div>

            <p className="text-base text-sumi-muted leading-relaxed">
              Founded in 1998 under Chief Instructor Sensei Kenji Takahashi (6th Dan),{' '}
              <strong className="text-sumi font-semibold">Kinnotaka Karate Academy</strong> welcomes complete beginners
              and experienced martial artists alike. Every student begins with the white belt mindset—humble, attentive,
              and ready to grow.
            </p>

            <div className="bg-white rounded-xl border border-washi-border p-5 space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-sumi-muted mb-1">
                The Five Precepts (道場訓)
              </p>
              {DOJO_KUN.map((item) => (
                <div
                  key={item.en}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-1.5 border-b last:border-b-0 border-washi-warm text-sm"
                >
                  <span className="font-medium text-sumi">{item.en}</span>
                  <span className="text-xs text-sumi-light font-serif">{item.jp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Programs & Schedule Section */}
      <section id="programs" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-washi-border">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-crimson uppercase mb-2">
              Divisions & Weekly Timetable
            </p>
            <h2 className="font-dojo text-3xl sm:text-4xl font-bold text-sumi">
              Training Programs by Age Group
            </h2>
          </div>
          <p className="text-sm text-sumi-muted max-w-md">
            New students are automatically placed into the appropriate age division upon submitting their registration
            below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROGRAMS.map((prog) => (
            <div
              key={prog.title}
              className="bg-white rounded-xl border border-washi-border p-6 flex flex-col justify-between hover:border-crimson/40 transition-colors shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-washi-warm text-sumi">
                    {prog.subtitle}
                  </span>
                </div>

                <h3 className="font-dojo text-xl font-bold text-sumi mb-2">{prog.title}</h3>

                <div className="flex items-center gap-2 text-xs font-medium text-crimson mb-4">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>{prog.schedule}</span>
                </div>

                <p className="text-sm text-sumi-muted leading-relaxed mb-5">{prog.description}</p>

                <ul className="space-y-2 mb-6">
                  {prog.highlights.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-xs text-sumi">
                      <CheckCircle2 className="w-3.5 h-3.5 text-crimson shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onSelectProgram(prog.programValue)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg border border-washi-border hover:border-crimson hover:bg-crimson-soft text-sm font-semibold text-sumi hover:text-crimson transition-colors"
              >
                <span>Select & Register</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
