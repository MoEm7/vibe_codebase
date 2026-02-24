interface LogoProps {
  className?: string;
}

export default function Logo({ className = "w-[150px] h-[150px]" }: LogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 240"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 230 C100 230 30 140 30 90 A70 70 0 1 1 170 90 C170 140 100 230 100 230Z"
        fill="#B8860B"
      />
      <circle cx="100" cy="88" r="50" fill="white" />
      <ellipse cx="100" cy="88" rx="35" ry="45" fill="#3E1A00" />
      <path
        d="M100,48 C88,65 112,110 100,128"
        stroke="white"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
