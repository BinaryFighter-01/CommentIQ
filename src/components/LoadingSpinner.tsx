// src/components/LoadingSpinner.tsx
'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'purple' | 'green' | 'red' | 'gray';
  text?: string;
}

export default function LoadingSpinner({
  size = 'md',
  color = 'blue',
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4',
  };

  const colorClasses = {
    blue: 'border-blue-600 border-t-transparent',
    purple: 'border-purple-600 border-t-transparent',
    green: 'border-green-600 border-t-transparent',
    red: 'border-red-600 border-t-transparent',
    gray: 'border-gray-600 border-t-transparent',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
      />
      {text && <p className="text-gray-600 text-sm font-medium">{text}</p>}
    </div>
  );
}

/**
 * Full-page loading overlay
 */
export function LoadingOverlay({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-xl">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
}

/**
 * Inline loading state
 */
export function InlineLoader({ text }: { text?: string }) {
  return (
    <div className="flex items-center space-x-2 text-gray-600">
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
      {text && <span className="text-sm">{text}</span>}
    </div>
  );
}
