import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { FalconCrest } from './FalconCrest';

export function Footer() {
  return (
    <footer className="bg-[#181615] text-[#E6E0D8] border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-3">
            <FalconCrest className="w-10 h-10 shrink-0" dark />
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#D99B38]">
                金鷹空手道場
              </p>
              <p className="font-dojo text-lg font-bold text-white">Kinnotaka Karate Academy</p>
            </div>
          </div>
          <p className="text-sm text-[#B8B0A6] leading-relaxed max-w-sm">
            Dedicated to traditional Japanese Shotokan Karate-dō, cultivating physical resilience, respect, and lifelong
            discipline for students of all ages.
          </p>
        </div>

        <div className="md:col-span-3 space-y-3 text-sm">
          <h4 className="font-semibold text-white uppercase tracking-wider text-xs">Quick Links</h4>
          <ul className="space-y-2 text-[#B8B0A6]">
            <li>
              <a href="#about" className="hover:text-white transition-colors">
                About the Dojo
              </a>
            </li>
            <li>
              <a href="#programs" className="hover:text-white transition-colors">
                Class Divisions
              </a>
            </li>
            <li>
              <a href="#registration" className="hover:text-white transition-colors">
                New Student Registration
              </a>
            </li>
            <li>
              <a href="#registry" className="hover:text-white transition-colors">
                Student Registry
              </a>
            </li>
          </ul>
        </div>

        <div className="md:col-span-4 space-y-3 text-sm text-[#B8B0A6]">
          <h4 className="font-semibold text-white uppercase tracking-wider text-xs">Honbu Dojo Location</h4>
          <p className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-[#D99B38] shrink-0 mt-0.5" />
            <span>No. 12A, Jalan Putra Mahkota 7/6B, Putra Heights, 47650 Subang Jaya, Selangor</span>
          </p>
          <p className="flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-[#D99B38] shrink-0" />
            <span>+60 3-5192 8410</span>
          </p>
          <p className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-[#D99B38] shrink-0" />
            <span>admissions@kinnotaka-karate.my</span>
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-[#9C948A]">
        © {new Date().getFullYear()} Kinnotaka Karate Academy (金鷹空手道場). All rights reserved.
      </div>
    </footer>
  );
}
