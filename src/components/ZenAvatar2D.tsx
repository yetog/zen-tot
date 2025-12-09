import React from 'react';

interface ZenAvatar2DProps {
  isSpeaking: boolean;
  isConnected: boolean;
  className?: string;
}

const ZenAvatar2D: React.FC<ZenAvatar2DProps> = ({ 
  isSpeaking, 
  isConnected, 
  className = '' 
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer glow rings */}
      <div 
        className={`absolute w-48 h-48 rounded-full transition-all duration-500 ${
          isConnected 
            ? 'bg-primary/10 animate-ping' 
            : 'bg-primary/5'
        }`}
        style={{ animationDuration: '3s' }}
      />
      <div 
        className={`absolute w-44 h-44 rounded-full transition-all duration-500 ${
          isSpeaking 
            ? 'bg-accent/20 animate-ping' 
            : 'bg-accent/10'
        }`}
        style={{ animationDuration: '2s' }}
      />
      
      {/* Orbital rings when speaking */}
      {isSpeaking && (
        <>
          <div className="absolute w-52 h-52 rounded-full border border-primary/30 animate-rotate-slow" />
          <div 
            className="absolute w-56 h-56 rounded-full border border-accent/20 animate-rotate-slow"
            style={{ animationDirection: 'reverse', animationDuration: '15s' }}
          />
        </>
      )}
      
      {/* Main avatar orb */}
      <div 
        className={`relative w-36 h-36 rounded-full animate-float ${
          isSpeaking ? 'speaking-glow' : isConnected ? 'avatar-glow' : 'glow-primary'
        }`}
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
        }}
      >
        {/* Inner gradient overlay */}
        <div 
          className="absolute inset-2 rounded-full animate-breathe"
          style={{
            background: 'radial-gradient(circle at 30% 30%, hsl(var(--primary-foreground) / 0.2) 0%, transparent 60%)',
          }}
        />
        
        {/* Face container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Eyes */}
          <div className="flex gap-6 mb-2">
            {/* Left eye */}
            <div className="relative">
              <div 
                className={`w-4 h-4 rounded-full bg-foreground/90 transition-transform duration-100 ${
                  isSpeaking ? 'scale-110' : ''
                }`}
                style={{
                  animation: 'blink 4s ease-in-out infinite',
                }}
              />
              <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-primary-foreground/80" />
            </div>
            
            {/* Right eye */}
            <div className="relative">
              <div 
                className={`w-4 h-4 rounded-full bg-foreground/90 transition-transform duration-100 ${
                  isSpeaking ? 'scale-110' : ''
                }`}
                style={{
                  animation: 'blink 4s ease-in-out infinite',
                }}
              />
              <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-primary-foreground/80" />
            </div>
          </div>
          
          {/* Mouth */}
          <div 
            className={`mt-1 rounded-full bg-foreground/80 transition-all duration-75 ${
              isSpeaking 
                ? 'w-5 h-4' 
                : 'w-6 h-2'
            }`}
            style={{
              animation: isSpeaking ? 'lipSync 0.15s ease-in-out infinite alternate' : 'none',
            }}
          />
        </div>
        
        {/* Particle effects when speaking */}
        {isSpeaking && (
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-primary-foreground/60"
                style={{
                  top: '50%',
                  left: '50%',
                  animation: `particle ${1 + i * 0.2}s ease-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Status indicator */}
      <div 
        className={`absolute bottom-4 w-3 h-3 rounded-full transition-colors duration-300 ${
          isConnected 
            ? 'bg-green-500 animate-pulse' 
            : 'bg-muted-foreground'
        }`}
      />
      
      {/* Inline styles for unique animations */}
      <style>{`
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        
        @keyframes lipSync {
          0% { 
            height: 0.75rem;
            width: 1.25rem;
          }
          100% { 
            height: 1rem;
            width: 1rem;
          }
        }
        
        @keyframes particle {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(
              calc(-50% + ${Math.random() * 80 - 40}px), 
              calc(-50% + ${Math.random() * 80 - 40}px)
            ) scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ZenAvatar2D;
