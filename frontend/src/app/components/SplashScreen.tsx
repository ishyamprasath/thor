import { useState, useEffect } from 'react';
import './SplashScreen.css';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    // Allow skipping after 2 seconds
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 2000);

    // Auto-hide after video duration (assuming ~5 seconds for splash video)
    const hideTimer = setTimeout(() => {
      handleVideoEnd();
    }, 5000);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleVideoEnd = () => {
    setIsVisible(false);
  };

  const handleSkip = () => {
    if (canSkip) {
      handleVideoEnd();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="splash-screen">
      <video
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        className="splash-video"
      >
        <source src="/videos/splash.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {canSkip && (
        <button 
          className="skip-button" 
          onClick={handleSkip}
          aria-label="Skip splash screen"
        >
          Skip →
        </button>
      )}
    </div>
  );
}
