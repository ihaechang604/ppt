import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden bg-white">
      {/* 
        High-Resolution Green/Lime Wave Image 
        Using a real image to ensure the "exact" look requested by the user.
      */}
      <img 
        src="https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2832&auto=format&fit=crop" 
        alt="Background" 
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />
      
      {/* Overlay to soften the background for better text readability on the UI */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[50px]"></div>
      
      {/* Subtle Noise Texture for realism */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 mix-blend-multiply"></div>
    </div>
  );
};

export default Background;