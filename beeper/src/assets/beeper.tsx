interface Props {
  className?: string;
}

const BeeperLogo: React.FC<Props> = ({ className }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="100" height="100" rx="20" fill="#0A74DC" />
    <path
      d="M30 70V30L50 40L70 30V70L50 60L30 70Z"
      stroke="white"
      stroke-width="5"
      stroke-linejoin="round"
    />
    <rect x="46" y="15" width="8" height="15" fill="white" />
    <circle cx="50" cy="15" r="4" fill="#FF8C00" />
  </svg>
);

export default BeeperLogo;
