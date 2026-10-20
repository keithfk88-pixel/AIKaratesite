import React from 'react';

export function FalconCrest({ className = 'w-10 h-10', dark = false }) {
  const strokeMain = dark ? '#F5EFE6' : '#181615';
  const accentGold = '#C28832';
  const sealRed = '#A61C1C';

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Traditional Japanese Kamon Double Outer Ring */}
      <circle cx="32" cy="32" r="29" stroke={accentGold} strokeWidth="2.2" />
      <circle cx="32" cy="32" r="25" stroke={strokeMain} strokeWidth="1.2" strokeOpacity="0.45" />

      {/* Crimson Sun Disc behind the Golden Falcon */}
      <circle cx="32" cy="27" r="9.5" fill={sealRed} />

      {/* Stylized Soaring Golden Falcon (Kinnotaka - 金鷹) */}
      <path
        d="M12 29C17.5 24 23.8 23.2 29.5 26.8L32 23L34.5 26.8C40.2 23.2 46.5 24 52 29C46.8 29.6 42.2 31.4 37.8 34.5L43 44.5L34.5 39.2L32 47L29.5 39.2L21 44.5L26.2 34.5C21.8 31.4 17.2 29.6 12 29Z"
        fill={accentGold}
        stroke={strokeMain}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}
