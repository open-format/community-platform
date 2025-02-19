export function LoadingSpinner() {
  return (
    <div className="flex items-center gap-2">
      <img src="/images/loading.gif" alt="Loading Spinner" className="w-10 h-10" />
      <p className="text-sm text-gray-500">Thinking...</p>
    </div>
  );
}
