import React from "react";
import { X } from "lucide-react";

interface DollsBannerProps {
  onClose?: () => void;
}

export const DollsBanner: React.FC<DollsBannerProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
    // Store in localStorage to hide for 7 days
    localStorage.setItem("dolls-banner-closed", new Date().toISOString());
  };

  React.useEffect(() => {
    const lastClosed = localStorage.getItem("dolls-banner-closed");
    if (lastClosed) {
      const daysSince = (Date.now() - new Date(lastClosed).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        setIsVisible(false);
      }
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="relative w-full bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center justify-between gap-4">
          {/* Left Doll */}
          <div className="hidden sm:flex items-end justify-center w-20 h-24 flex-shrink-0">
            <svg
              viewBox="0 0 100 120"
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Head */}
              <circle cx="50" cy="30" r="20" fill="#fdbcb4" />
              {/* Eyes */}
              <circle cx="42" cy="26" r="3" fill="#333" />
              <circle cx="58" cy="26" r="3" fill="#333" />
              {/* Smile */}
              <path d="M 42 32 Q 50 36 58 32" stroke="#333" strokeWidth="2" fill="none" />
              {/* Body */}
              <rect x="38" y="52" width="24" height="30" rx="4" fill="#ff69b4" />
              {/* Arms */}
              <rect x="20" y="58" width="18" height="8" rx="4" fill="#fdbcb4" />
              <rect x="62" y="58" width="18" height="8" rx="4" fill="#fdbcb4" />
              {/* Legs */}
              <rect x="40" y="82" width="6" height="20" fill="#333" />
              <rect x="54" y="82" width="6" height="20" fill="#333" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-purple-900 mb-1">
              Добро пожаловать на TaskHive! 👋
            </h3>
            <p className="text-sm sm:text-base text-purple-700">
              Находите работу здесь и сейчас, развивайтесь от Employee до Business Owner и зарабатывайте на своих условиях.
            </p>
          </div>

          {/* Right Doll */}
          <div className="hidden sm:flex items-end justify-center w-20 h-24 flex-shrink-0">
            <svg
              viewBox="0 0 100 120"
              className="w-full h-full transform scale-x-[-1]"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Head */}
              <circle cx="50" cy="30" r="20" fill="#fdbcb4" />
              {/* Eyes */}
              <circle cx="42" cy="26" r="3" fill="#333" />
              <circle cx="58" cy="26" r="3" fill="#333" />
              {/* Smile */}
              <path d="M 42 32 Q 50 36 58 32" stroke="#333" strokeWidth="2" fill="none" />
              {/* Body */}
              <rect x="38" y="52" width="24" height="30" rx="4" fill="#4f46e5" />
              {/* Arms */}
              <rect x="20" y="58" width="18" height="8" rx="4" fill="#fdbcb4" />
              <rect x="62" y="58" width="18" height="8" rx="4" fill="#fdbcb4" />
              {/* Legs */}
              <rect x="40" y="82" width="6" height="20" fill="#333" />
              <rect x="54" y="82" width="6" height="20" fill="#333" />
            </svg>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-100 rounded-lg transition-colors"
            aria-label="Закрыть баннер"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
