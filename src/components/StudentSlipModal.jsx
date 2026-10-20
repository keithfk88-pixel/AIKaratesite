import React from 'react';
import { X, Printer } from 'lucide-react';
import { FalconCrest } from './FalconCrest';

export function StudentSlipModal({ student, onClose }) {
  if (!student) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="slip-modal-title"
    >
      <div
        id="printable-slip"
        className="w-full max-w-lg bg-white rounded-xl border border-washi-border shadow-2xl overflow-hidden"
      >
        {/* Slip Header */}
        <div className="bg-[#181615] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <FalconCrest className="w-11 h-11 shrink-0" dark />
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#E5C17B]">
                金鷹空手道場 · Official Enrollment Record
              </p>
              <h3 id="slip-modal-title" className="font-dojo text-lg font-bold">
                Kinnotaka Karate Academy
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="no-print p-1.5 rounded-lg text-white/75 hover:text-white hover:bg-white/10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slip Content */}
        <div className="p-6 space-y-4 text-sm">
          <div className="flex items-center justify-between pb-3 border-b border-washi-border">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sumi-light block">
                Student Registration ID
              </span>
              <span className="font-mono text-base font-bold text-crimson">{student.id}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sumi-light block">
                Initial Rank
              </span>
              <span className="font-semibold text-sumi">{student.rank || '10th Kyu · White Belt'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-1">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sumi-light block">
                Full Name
              </span>
              <p className="font-semibold text-base text-sumi mt-0.5">{student.name}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sumi-light block">
                Age & Sex
              </span>
              <p className="font-medium text-sumi mt-0.5">
                {student.age} Years Old · {student.sex}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sumi-light block">
                Date of Birth
              </span>
              <p className="font-medium text-sumi mt-0.5">{student.dateOfBirth}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sumi-light block">
                Place of Birth
              </span>
              <p className="font-medium text-sumi mt-0.5">{student.placeOfBirth}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-washi-warm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sumi-light block">
              Residential Address
            </span>
            <p className="font-medium text-sumi mt-0.5 leading-relaxed">{student.address}</p>
          </div>

          <div className="pt-2 border-t border-washi-warm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sumi-light block">
                Assigned Division
              </span>
              <p className="font-semibold text-crimson mt-0.5">{student.program}</p>
            </div>
            <div className="border-2 border-crimson text-crimson px-2.5 py-1 rounded text-[11px] font-serif font-bold tracking-widest uppercase">
              金鷹承認 · Verified
            </div>
          </div>

          {/* Modal Buttons */}
          <div className="no-print pt-4 border-t border-washi-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-washi-border text-sm font-medium text-sumi hover:bg-washi"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-crimson hover:bg-crimson-dark text-white text-sm font-semibold"
            >
              <Printer className="w-4 h-4" />
              <span>Print Admission Slip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
