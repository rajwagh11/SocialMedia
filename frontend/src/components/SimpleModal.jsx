import React, { useEffect } from "react";
import { HiXMark } from "react-icons/hi2";

const SimpleModal = ({ isOpen, onClose, children }) => {
  // Handle Escape key press and prevent background page scrolling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      {/* Modal Card - stopPropagation prevents clicks inside from closing the modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xs sm:max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xl transition-all transform animate-in zoom-in-95 duration-200"
      >
        {/* Header / Close Button */}
        <div className="flex justify-end mb-1">
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer active:scale-95"
            aria-label="Close modal"
            type="button"
          >
            <HiXMark className="text-lg" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex flex-col space-y-2.5 mt-1">{children}</div>
      </div>
    </div>
  );
};

export default SimpleModal;