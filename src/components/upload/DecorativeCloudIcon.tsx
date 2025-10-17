export function DecorativeCloudIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 -20 100 300" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      aria-hidden="true"
    >
      {/* This path data is now corrected and syntactically valid */}
      <path 
        d="M84.18 29.33 A 18.33 18.33 0 0 0 61.18 12.13 A 25 25 0 0 0 15.82 29.2 A 15 15 0 0 0 15.82 59 H 84.18 A 15 15 0 0 0 84.18 29.33 Z" 
        stroke="hsl(var(--mint))" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}