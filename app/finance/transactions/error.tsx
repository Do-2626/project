'use client';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="text-center p-8 bg-red-100 border border-red-400 rounded-lg">
      <h2 className="text-2xl font-bold text-red-600 mb-4">حدث خطأ!</h2>
      <p className="text-red-700 mb-4">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        حاول مرة أخرى
      </button>
    </div>
  );
}