export function Cursor({ color }: { color: string }) {
  return (
    <svg
      width="800px"
      height="800px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "20px", height: "20px" }}
    >
      <path
        d="M22 10.2069L3 3L10.2069 22L13.4828 13.4828L22 10.2069Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
