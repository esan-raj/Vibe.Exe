import React from 'react';

// ===== KOLKATA HERITAGE ICONS =====
// SVG icons representing Kolkata's cultural heritage

interface IconProps {
  className?: string;
  size?: number;
}

// Iconic Kolkata Tram
export const TramIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size}>
    <path d="M19 16.94V8.5C19 5.79 16.76 3.5 14 3.5H10C7.24 3.5 5 5.79 5 8.5V16.94C5 17.28 5.03 17.62 5.09 17.94L3 20.5V21H21V20.5L18.91 17.94C18.97 17.62 19 17.28 19 16.94ZM8.5 18C7.67 18 7 17.33 7 16.5S7.67 15 8.5 15 10 15.67 10 16.5 9.33 18 8.5 18ZM9 11V7H15V11H9ZM15.5 18C14.67 18 14 17.33 14 16.5S14.67 15 15.5 15 17 15.67 17 16.5 16.33 18 15.5 18Z"/>
  </svg>
);

// Howrah Bridge
export const HowrahBridgeIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size}>
    <path d="M4 21V19H6V11L12 3L18 11V19H20V21H4ZM8 19H11V14H13V19H16V12L12 6L8 12V19ZM11 12H13V10H11V12Z"/>
    <path d="M2 21V20C2 20 5 18 12 18C19 18 22 20 22 20V21H2Z" opacity="0.6"/>
  </svg>
);

// Victoria Memorial
export const VictoriaMemorialIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size}>
    <path d="M12 2L10 4H14L12 2ZM12 5C10.9 5 10 5.9 10 7V8H14V7C14 5.9 13.1 5 12 5ZM7 9V10H17V9H7ZM6 11V20H8V14H10V20H14V14H16V20H18V11H6ZM4 21V22H20V21H4Z"/>
    <circle cx="12" cy="6" r="1.5" opacity="0.7"/>
  </svg>
);

// Durga Idol
export const DurgaIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size}>
    <path d="M12 2L9 6H6L3 12L6 18H18L21 12L18 6H15L12 2ZM12 8C13.1 8 14 8.9 14 10S13.1 12 12 12 10 11.1 10 10 10.9 8 12 8ZM12 14C14.33 14 19 15.17 19 17.5V19H5V17.5C5 15.17 9.67 14 12 14Z"/>
    <path d="M8 3L6 5M16 3L18 5M4 8H7M17 8H20" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5"/>
  </svg>
);

// Dhunuchi (Incense Burner)
export const DhunuchiIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size}>
    <path d="M12 2C11 2 10 3 10 4C10 5 11 6 12 6C13 6 14 5 14 4C14 3 13 2 12 2Z" opacity="0.5"/>
    <path d="M10 6C9 7 9 8 10 9L8 12H16L14 9C15 8 15 7 14 6"/>
    <path d="M7 12L6 20C6 21 7 22 8 22H16C17 22 18 21 18 20L17 12H7Z"/>
    <path d="M11 3C10.5 2 10 2 9.5 2.5M13 3C13.5 2 14 2 14.5 2.5" stroke="currentColor" strokeWidth="1" fill="none" className="animate-flame"/>
  </svg>
);

// Terracotta Art
export const TerracottaIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size}>
    <path d="M12 3C9 3 7 6 7 9C7 12 8 14 8 16V20C8 21 9 22 10 22H14C15 22 16 21 16 20V16C16 14 17 12 17 9C17 6 15 3 12 3ZM12 5C14 5 15 7 15 9C15 11 14 13 14 15H10C10 13 9 11 9 9C9 7 10 5 12 5Z"/>
    <circle cx="12" cy="9" r="2" opacity="0.5"/>
  </svg>
);

// Kolkata Coffee/Tea Cup (Adda)
export const AddaTeaIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size}>
    <path d="M2 19H20V21H2V19ZM20 8H18V5H6V8H4V10C4 12.21 5.79 14 8 14H14C16.21 14 18 12.21 18 10H20C21.1 10 22 9.1 22 8C22 6.9 21.1 6 20 6V8ZM16 10C16 11.1 15.1 12 14 12H8C6.9 12 6 11.1 6 10V7H16V10Z"/>
    <path d="M9 2C9 2 8 3 9 4C10 5 9 6 9 6M12 2C12 2 11 3 12 4C13 5 12 6 12 6" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5"/>
  </svg>
);

// Rabindranath Tagore
export const TagoreIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size}>
    <circle cx="12" cy="8" r="4"/>
    <path d="M12 12C8 12 5 14 5 17V19H19V17C19 14 16 12 12 12Z"/>
    <path d="M8 7C8 7 6 6 5 7M16 7C16 7 18 6 19 7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M10 20V22H14V20" fill="currentColor" opacity="0.5"/>
  </svg>
);

// Book (College Street)
export const BookIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size}>
    <path d="M21 5C19.89 4.65 18.67 4.5 17.5 4.5C15.55 4.5 13.45 4.9 12 6C10.55 4.9 8.45 4.5 6.5 4.5C4.55 4.5 2.45 4.9 1 6V20.65C1 20.9 1.25 21.15 1.5 21.15C1.6 21.15 1.65 21.1 1.75 21.1C3.1 20.45 5.05 20 6.5 20C8.45 20 10.55 20.4 12 21.5C13.35 20.65 15.8 20 17.5 20C19.15 20 20.85 20.3 22.25 21.05C22.35 21.1 22.4 21.1 22.5 21.1C22.75 21.1 23 20.85 23 20.6V6C22.4 5.55 21.75 5.25 21 5ZM21 18.5C19.9 18.15 18.7 18 17.5 18C15.8 18 13.35 18.65 12 19.5V8C13.35 7.15 15.8 6.5 17.5 6.5C18.7 6.5 19.9 6.65 21 7V18.5Z"/>
  </svg>
);

// Patachitra Scroll
export const PatachitraIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size}>
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"/>
    <path d="M8 14H16M8 17H14" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <circle cx="12" cy="11" r="2" opacity="0.5"/>
  </svg>
);

// Ghat (Riverside Steps)
export const GhatIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size}>
    <path d="M2 22H22L20 18H4L2 22Z"/>
    <path d="M4 18H20L18 14H6L4 18Z" opacity="0.8"/>
    <path d="M6 14H18L16 10H8L6 14Z" opacity="0.6"/>
    <path d="M8 10H16L14 6H10L8 10Z" opacity="0.4"/>
    <path d="M3 22C3 22 5 21 12 21C19 21 21 22 21 22" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3"/>
  </svg>
);

// Rosogolla
export const RosogollaIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size}>
    <circle cx="12" cy="12" r="8"/>
    <circle cx="12" cy="12" r="5" opacity="0.3"/>
    <circle cx="10" cy="10" r="1.5" fill="white" opacity="0.5"/>
  </svg>
);

// Yellow Taxi
export const TaxiIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size}>
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3H9V5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 16C5.67 16 5 15.33 5 14.5S5.67 13 6.5 13 8 13.67 8 14.5 7.33 16 6.5 16ZM17.5 16C16.67 16 16 15.33 16 14.5S16.67 13 17.5 13 19 13.67 19 14.5 18.33 16 17.5 16ZM5 11L6.5 6.5H17.5L19 11H5Z"/>
  </svg>
);

// Alpona Pattern
export const AlponaIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size}>
    <path d="M12 2L14 6L18 4L16 8L20 10L16 12L18 16L14 14L12 18L10 14L6 16L8 12L4 10L8 8L6 4L10 6L12 2Z"/>
    <circle cx="12" cy="10" r="2" opacity="0.5"/>
  </svg>
);

// Shantiniketan House
export const ShantiniketanIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size}>
    <path d="M12 3L4 9V21H20V9L12 3ZM18 19H6V10L12 5.5L18 10V19Z"/>
    <path d="M10 19V14H14V19" fill="currentColor"/>
    <path d="M8 12H10V14H8V12ZM14 12H16V14H14V12Z" opacity="0.7"/>
    <path d="M11 6L12 5L13 6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

// Hand Pulled Rickshaw
export const RickshawIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size}>
    <circle cx="6" cy="17" r="3"/>
    <circle cx="6" cy="17" r="1.5" fill="white" opacity="0.3"/>
    <path d="M8 14H18V10C18 9 17 8 16 8H10L8 10V14Z"/>
    <path d="M18 14L21 10M18 10L20 8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M12 6C13 6 14 7 14 8H10C10 7 11 6 12 6Z"/>
  </svg>
);

// Export all icons as a collection
export const KolkataIcons = {
  Tram: TramIcon,
  HowrahBridge: HowrahBridgeIcon,
  VictoriaMemorial: VictoriaMemorialIcon,
  Durga: DurgaIcon,
  Dhunuchi: DhunuchiIcon,
  Terracotta: TerracottaIcon,
  AddaTea: AddaTeaIcon,
  Tagore: TagoreIcon,
  Book: BookIcon,
  Patachitra: PatachitraIcon,
  Ghat: GhatIcon,
  Rosogolla: RosogollaIcon,
  Taxi: TaxiIcon,
  Alpona: AlponaIcon,
  Shantiniketan: ShantiniketanIcon,
  Rickshaw: RickshawIcon,
};

export default KolkataIcons;


