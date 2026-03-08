import React from 'react';
import './BrachistochroneAnimation.css'; // We'll create this next

const BrachistochroneAnimation = () => {
  return (
    <div className="animation-container" style={{ margin: '40px 0' }}>
      <div className="graph-paper">
        {/* Brachistochrone curve (cycloid) */}
        <svg viewBox="0 0 500 300">
          <path 
            className="brachistochrone-path" 
            d="M50,20 Q250,150 450,270" 
          />
        </svg>
        <div className="ball"></div>
      </div>
      <div className="caption" style={{ 
        textAlign: 'center', 
        marginTop: '20px',
        fontFamily: "'Courier New', monospace",
        color: '#333'
      }}>
        The Brachistochrone Curve: Fastest Path Under Gravity
      </div>
    </div>
  );
};

export default BrachistochroneAnimation;