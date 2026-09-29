// Copy of frontend/src/components/background-blobs.tsx; keep the two in step
const BackgroundBlobs: React.FC = () => {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-16 left-[10%] size-72 rounded-full bg-blob-rose opacity-60 blur-3xl motion-safe:animate-float md:size-96" />
      <div className="absolute top-24 right-[5%] size-72 rounded-full bg-blob-lavender opacity-60 blur-3xl [animation-delay:-3s] motion-safe:animate-float md:size-96" />
    </div>
  );
};

export default BackgroundBlobs;
