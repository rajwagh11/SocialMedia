import React from "react";

/**
 * Full-page loading spinner for page transitions and initial data fetches.
 */
export const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="relative flex items-center justify-center" role="status" aria-label="Loading page">
        {/* Soft glowing background track */}
        <div className="w-14 h-14 rounded-full border-4 border-indigo-500/10 dark:border-indigo-400/10 animate-pulse" />
        
        {/* Active spinning ring */}
        <div className="absolute w-14 h-14 rounded-full border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 border-r-indigo-600/50 dark:border-r-indigo-400/50 animate-spin" />
      </div>
    </div>
  );
};

/**
 * Compact inline loading spinner optimized for buttons and small cards.
 * Uses `border-current` so it automatically matches the text color of its parent container!
 */
export const LoadingAnimation = ({ className = "" }) => {
  return (
    <div
      className={`inline-block w-5 h-5 border-2 border-current border-r-transparent rounded-full animate-spin text-indigo-600 dark:text-indigo-400 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};