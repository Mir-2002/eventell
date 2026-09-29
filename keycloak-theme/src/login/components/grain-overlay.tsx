// Copy of frontend/src/components/grain-overlay.tsx; keep the two in step
const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const GrainOverlay: React.FC = () => {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 opacity-35 mix-blend-overlay"
      style={{ backgroundImage: noise }}
    />
  );
};

export default GrainOverlay;
