export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-40 bg-surface rounded mb-5" />
      <div className="h-10 bg-surface rounded-lg mb-3" />
      <div className="space-y-2">
        <div className="h-12 bg-surface rounded-lg" />
        <div className="h-12 bg-surface rounded-lg" />
        <div className="h-12 bg-surface rounded-lg" />
      </div>
    </div>
  );
}