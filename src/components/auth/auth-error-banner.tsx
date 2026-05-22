"use client";

export function AuthErrorBanner({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss?: () => void;
}) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
    >
      <p>{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-1 text-xs font-medium underline"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
