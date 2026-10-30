import React from "react";

const LoadingScreen = () => {
  return (
    <div style={styles.overlay}>
      {/* Animated background gradient */}
      <div style={styles.bgGradient} />

      {/* Floating particles */}
      <div style={styles.particlesContainer}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.particle,
              width: `${8 + i * 4}px`,
              height: `${8 + i * 4}px`,
              left: `${15 + i * 14}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div style={styles.content}>
        {/* Logo with glow effect */}
        <div style={styles.logoContainer}>
          <div style={styles.logoGlow} />
          <img
            src="/logo.png"
            alt="Sales Manager"
            style={styles.logo}
          />
        </div>

        {/* Brand name */}
        <h1 style={styles.brandName}>SALES</h1>
        <p style={styles.tagline}>Management Platform</p>

        {/* Loading bar */}
        <div style={styles.loaderContainer}>
          <div style={styles.loaderTrack}>
            <div style={styles.loaderBar} />
          </div>
        </div>

        {/* Loading text */}
        <p style={styles.loadingText}>Preparing your workspace</p>
      </div>

      <style>{`
        @keyframes loadingScreenFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes loadingBar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes logoPulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.15); }
        }

        @keyframes particleFloat {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          20% { opacity: 0.4; }
          80% { opacity: 0.4; }
          100% { transform: translateY(-120px) rotate(180deg); opacity: 0; }
        }

        @keyframes bgShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
    overflow: "hidden",
    background: "#ffffff",
  },
  bgGradient: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(ellipse at 20% 50%, rgba(255, 111, 0, 0.05) 0%, transparent 50%), " +
      "radial-gradient(ellipse at 80% 50%, rgba(255, 140, 50, 0.04) 0%, transparent 50%), " +
      "radial-gradient(ellipse at 50% 100%, rgba(255, 111, 0, 0.03) 0%, transparent 40%)",
    animation: "bgShift 8s ease-in-out infinite",
    backgroundSize: "200% 200%",
  },
  particlesContainer: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
  },
  particle: {
    position: "absolute",
    bottom: "-20px",
    borderRadius: "50%",
    background: "rgba(255, 111, 0, 0.08)",
    animation: "particleFloat 4s ease-in-out infinite",
  },
  content: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    animation: "loadingScreenFadeIn 0.8s ease-out",
  },
  logoContainer: {
    position: "relative",
    marginBottom: "12px",
    animation: "logoFloat 3s ease-in-out infinite",
  },
  logoGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,111,0,0.15) 0%, transparent 70%)",
    animation: "logoPulse 3s ease-in-out infinite",
    pointerEvents: "none",
  },
  logo: {
    width: "72px",
    height: "72px",
    borderRadius: "16px",
    objectFit: "contain",
    position: "relative",
    zIndex: 1,
    filter: "drop-shadow(0 4px 20px rgba(255,111,0,0.15))",
  },
  brandName: {
    fontFamily: "'Zen Dots', 'Lexend', sans-serif",
    fontSize: "28px",
    fontWeight: 600,
    letterSpacing: "6px",
    color: "#1a1a1a",
    margin: 0,
    background: "linear-gradient(135deg, #1a1a1a 0%, #555555 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  tagline: {
    fontFamily: "'Lexend', sans-serif",
    fontSize: "13px",
    fontWeight: 300,
    letterSpacing: "3px",
    color: "rgba(0, 0, 0, 0.35)",
    margin: "0 0 28px 0",
    textTransform: "uppercase",
  },
  loaderContainer: {
    width: "200px",
  },
  loaderTrack: {
    width: "100%",
    height: "3px",
    borderRadius: "4px",
    background: "rgba(0, 0, 0, 0.06)",
    overflow: "hidden",
    position: "relative",
  },
  loaderBar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "60%",
    height: "100%",
    borderRadius: "4px",
    background: "linear-gradient(90deg, transparent, #FF6F00, transparent)",
    animation: "loadingBar 1.8s ease-in-out infinite",
  },
  loadingText: {
    fontFamily: "'Lexend', sans-serif",
    fontSize: "12px",
    fontWeight: 300,
    color: "rgba(0, 0, 0, 0.35)",
    marginTop: "16px",
    letterSpacing: "1px",
  },
};

export default LoadingScreen;
