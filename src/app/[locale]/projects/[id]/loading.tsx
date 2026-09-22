export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-56 bg-surface rounded mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="h-16 bg-surface rounded-lg" />
        <div className="h-16 bg-surface rounded-lg" />
        <div className="h-16 bg-surface rounded-lg" />
        <div className="h-16 bg-surface rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="h-40 bg-surface rounded-lg" />
        <div className="h-40 bg-surface rounded-lg" />
        <div className="h-40 bg-surface rounded-lg" />
      </div>
    </div>
  );
}