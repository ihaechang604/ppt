import React from 'react';
import { SlideData, SlideType } from '../types';
import { 
  Quote, Globe, Target, Users, BookOpen, Lightbulb, 
  Sparkles, Zap, LayoutGrid, CheckCircle2, Grip, Component
} from 'lucide-react';

interface SlideRendererProps {
  slide: SlideData;
}

const SlideRenderer: React.FC<SlideRendererProps> = ({ slide }) => {
  
  // --- Smart Typography Logic ---
  const getUnifiedFontSize = (contents: string[], type: 'title' | 'content' | 'quote' | 'grid') => {
    const maxLength = contents.reduce((max, curr) => Math.max(max, curr.length), 0);
    const itemCount = contents.length;
    
    switch (type) {
      case 'title':
        if (maxLength < 8) return 'text-6xl md:text-8xl lg:text-[7rem]';
        if (maxLength < 15) return 'text-5xl md:text-7xl lg:text-8xl';
        return 'text-4xl md:text-6xl lg:text-7xl';
        
      case 'grid':
        if (itemCount <= 2) {
             if (maxLength < 20) return 'text-2xl md:text-3xl lg:text-4xl';
             return 'text-xl md:text-2xl lg:text-3xl';
        }
        if (maxLength < 15) return 'text-xl md:text-2xl lg:text-3xl';
        if (maxLength < 40) return 'text-lg md:text-xl lg:text-2xl';
        return 'text-base md:text-lg lg:text-xl';

      case 'quote':
        if (maxLength < 30) return 'text-4xl md:text-6xl lg:text-7xl';
        if (maxLength < 60) return 'text-3xl md:text-5xl lg:text-6xl';
        return 'text-2xl md:text-4xl lg:text-5xl';

      default: // content list
        if (itemCount <= 3) {
            if (maxLength < 30) return 'text-2xl md:text-4xl lg:text-5xl';
            return 'text-xl md:text-3xl lg:text-4xl';
        }
        if (maxLength < 40) return 'text-lg md:text-2xl lg:text-3xl';
        return 'text-base md:text-xl lg:text-2xl';
    }
  };

  const contentFontSizeClass = getUnifiedFontSize(slide.content, 
    slide.type === SlideType.GRID_FOUR || slide.type === SlideType.TWO_COLUMN ? 'grid' : 
    slide.type === SlideType.QUOTE ? 'quote' : 'content'
  );

  const getIcon = (className: string) => {
    const title = slide.title || '';
    if (title.includes('목표') || title.includes('특징')) return <Target className={className} />;
    if (title.includes('세계') || title.includes('공간')) return <Globe className={className} />;
    if (title.includes('소개') || title.includes('리퀴드') || title.includes('모둠')) return <Users className={className} />;
    if (title.includes('참고')) return <BookOpen className={className} />;
    if (title.includes('이유')) return <Lightbulb className={className} />;
    if (title.includes('과정') || title.includes('반응') || title.includes('공동')) return <Component className={className} />;
    if (title.includes('성장') || title.includes('철학')) return <Zap className={className} />;
    if (title.includes('회고') || title.includes('시스템')) return <LayoutGrid className={className} />;
    return <Sparkles className={className} />;
  };

  // --- RESTORED ORIGINAL LIQUID GLASS STYLES ---
  // High Transparency, Strong Blur, Glossy Feel
  
  // 1. Super Glass Panel: Main container (Highly Transparent)
  const SUPER_GLASS = `
    bg-white/20
    backdrop-blur-[50px] saturate-150
    border border-white/40 border-t-white/70
    shadow-[0_20px_60px_rgba(0,0,0,0.05),inset_0_0_20px_rgba(255,255,255,0.2)]
  `;

  // 2. Liquid Card: Inner items (Very transparent to show background flow)
  const LIQUID_CARD = `
    bg-white/10
    backdrop-blur-xl
    border border-white/30 border-t-white/60
    shadow-[0_8px_32px_rgba(0,0,0,0.05)]
    hover:bg-white/20 transition-colors duration-300
  `;

  // 3. Dark/Accent Glass: Semi-transparent Black Glass (For contrast)
  const ACCENT_GLASS = `
    bg-black/20
    backdrop-blur-[60px]
    border border-white/10 border-t-white/30
    shadow-[0_20px_60px_rgba(0,0,0,0.15)]
    text-white
  `;

  // Text Helper: All White with strong shadow for readability
  const TEXT_WHITE = "text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"; 
  const TEXT_WHITE_SOFT = "text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]";

  const renderContent = () => {
    switch (slide.type) {
      case SlideType.TITLE:
        return (
          <div className="h-full w-full p-6 md:p-12 flex flex-col font-sans relative z-10">
            <div className="flex-1 flex flex-col md:grid md:grid-cols-12 md:grid-rows-6 gap-6 h-full">
              
              {/* Main Title - Large Glass Slab */}
              <div className={`flex-[2] md:flex-none md:col-span-8 md:row-span-4 ${SUPER_GLASS} rounded-[3rem] p-8 md:p-16 flex flex-col justify-center relative overflow-hidden`}>
                 {/* Specular Highlight */}
                 <div className="absolute top-0 right-0 w-full h-[60%] bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>
                 
                 <div className="relative z-10">
                   <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 border border-white/50 text-white text-[11px] font-black uppercase tracking-[0.2em] w-fit mb-8 backdrop-blur-md shadow-sm">
                     <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                     Project
                   </div>
                   <h1 className={`${getUnifiedFontSize([slide.title], 'title')} font-black ${TEXT_WHITE} leading-[1.05] tracking-tight break-keep`}>
                     {slide.title}
                   </h1>
                 </div>
              </div>

              {/* Subtitle - Dark Transparent Glass */}
              <div className={`flex-1 md:flex-none md:col-span-4 md:row-span-4 ${ACCENT_GLASS} rounded-[3rem] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden`}>
                 <div className="relative z-10 flex flex-col h-full justify-between">
                   <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center text-white border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                     {getIcon("w-10 h-10 md:w-12 md:h-12 drop-shadow-lg")}
                   </div>
                   <div className="mt-4 md:mt-8 flex-1 flex flex-col justify-end">
                     <div className="h-[4px] w-12 bg-white/50 mb-6 rounded-full"></div>
                     <p className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-white break-keep drop-shadow-lg">
                       {slide.subtitle}
                     </p>
                   </div>
                 </div>
              </div>

              {/* Footer Tags - Glass Pills */}
              <div className={`flex-1 md:col-span-12 md:row-span-2 ${SUPER_GLASS} rounded-[3rem] p-6 flex items-center justify-center relative`}>
                 <div className="flex flex-wrap gap-4 justify-center items-center w-full h-full content-center z-10">
                    {slide.content.map((item, idx) => (
                      <div key={idx} className={`${LIQUID_CARD} px-8 py-4 rounded-full ${TEXT_WHITE}`}>
                         <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]"></div>
                           <span className="text-sm md:text-xl font-bold tracking-tight whitespace-nowrap">{item}</span>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        );

      case SlideType.CONTENT_LIST:
        return (
          <div className="h-full w-full p-6 md:p-12 flex flex-col gap-6 box-border relative z-10">
            {/* Header */}
            <div className={`flex-[0_0_auto] ${SUPER_GLASS} rounded-[3.5rem] p-10 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden`}>
               <div className="max-w-4xl relative z-10">
                 <h2 className={`text-3xl md:text-5xl lg:text-6xl font-black ${TEXT_WHITE} tracking-tight mb-3 break-keep`}>
                   {slide.title}
                 </h2>
                 <p className={`text-lg md:text-2xl font-bold break-keep ${TEXT_WHITE_SOFT}`}>{slide.subtitle}</p>
               </div>
               {/* Icon */}
               <div className="hidden md:flex p-6 bg-white/20 backdrop-blur-xl rounded-[2.5rem] border border-white/40 text-white shadow-sm">
                  {getIcon("w-10 h-10 drop-shadow-md")}
               </div>
            </div>

            {/* List Items */}
            <div className="flex-1 flex flex-col gap-4 min-h-0 z-10">
              {slide.content.map((item, idx) => (
                <div key={idx} className={`flex-1 ${LIQUID_CARD} rounded-[3rem] p-6 md:p-8 flex items-center gap-8 relative overflow-hidden`}>
                   {/* Number Box */}
                   <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-[2rem] bg-indigo-600/80 text-white font-black text-2xl md:text-3xl shadow-lg border border-white/30 backdrop-blur-md">
                      {idx + 1}
                   </div>
                   <p className={`${contentFontSizeClass} font-bold ${TEXT_WHITE} leading-[1.3] break-keep flex-1 flex items-center`}>
                     {item}
                   </p>
                </div>
              ))}
            </div>
          </div>
        );

      case SlideType.TWO_COLUMN:
        return (
          <div className="h-full w-full p-6 md:p-12 flex flex-col md:flex-row gap-6 box-border overflow-hidden relative z-10">
             {/* Left Column (Dark Transparent Glass) */}
             <div className={`w-full md:w-5/12 ${ACCENT_GLASS} rounded-[3.5rem] p-10 md:p-14 flex flex-col relative overflow-hidden flex-shrink-0 justify-center`}>
                <div className="relative z-10 flex flex-col h-full justify-center">
                   <div className="w-24 h-24 md:w-28 md:h-28 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-center text-white border border-white/20 mb-8 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                      {getIcon("w-12 h-12 md:w-14 md:h-14 drop-shadow-md")}
                   </div>
                   <h2 className={`${getUnifiedFontSize([slide.title], 'grid')} font-black ${TEXT_WHITE} leading-tight tracking-tight mb-6 break-keep`}>
                        {slide.title}
                   </h2>
                   <div className="w-16 h-1.5 bg-white/60 rounded-full mb-6"></div>
                   <p className={`text-lg md:text-2xl font-medium leading-relaxed break-keep ${TEXT_WHITE_SOFT}`}>
                        {slide.subtitle}
                   </p>
                </div>
             </div>

             {/* Right Column (Light Liquid List) */}
             <div className="w-full md:w-7/12 flex flex-col gap-4 h-full">
                {slide.content.map((item, idx) => (
                  <div key={idx} className={`flex-1 ${LIQUID_CARD} rounded-[3rem] p-6 md:p-8 flex items-center gap-6`}>
                     {/* Check Icon */}
                     <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/20 flex items-center justify-center border border-white/50 shadow-sm text-white">
                        <CheckCircle2 className="w-7 h-7 md:w-8 md:h-8 drop-shadow-sm" />
                     </div>
                     <p className={`${contentFontSizeClass} font-bold ${TEXT_WHITE} leading-relaxed break-keep flex-1 flex items-center`}>
                       {item}
                     </p>
                  </div>
                ))}
             </div>
          </div>
        );

      case SlideType.GRID_FOUR:
        return (
          <div className="h-full w-full p-6 md:p-12 flex flex-col gap-6 box-border relative overflow-hidden z-10">
             <div className="flex-[0_0_auto] flex justify-between items-end mb-2 px-2">
               <div className={`${SUPER_GLASS} p-8 rounded-[3rem]`}>
                  <h2 className={`text-3xl md:text-5xl font-black ${TEXT_WHITE} tracking-tight`}>{slide.title}</h2>
                  {slide.subtitle && <p className={`text-lg md:text-xl font-bold mt-2 ${TEXT_WHITE_SOFT}`}>{slide.subtitle}</p>}
               </div>
               <div className="px-6 py-3 bg-white/20 backdrop-blur-2xl border border-white/40 rounded-full text-[12px] font-black uppercase tracking-widest text-white hidden md:block shadow-sm">
                 Overview
               </div>
             </div>

             <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 min-h-0">
               {slide.content.slice(0, 4).map((item, idx) => {
                 const isDark = idx === 3;
                 return (
                   <div key={idx} className={`
                     ${isDark 
                        ? ACCENT_GLASS 
                        : LIQUID_CARD}
                     rounded-[3.5rem] p-8 md:p-10 flex flex-col justify-between 
                     relative overflow-hidden w-full h-full
                   `}>
                      <div className="flex justify-between items-start mb-4 relative z-10">
                         {/* Number Badge */}
                         <div className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-white/40 bg-white/10 text-white`}>
                           0{idx + 1}
                         </div>
                         <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center border backdrop-blur-md bg-white/20 border-white/30 text-white shadow-sm`}>
                            <Grip className="w-6 h-6 md:w-7 md:h-7 drop-shadow-sm" />
                         </div>
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-center relative z-10">
                        <p className={`${contentFontSizeClass} font-bold leading-snug w-full flex items-center break-keep`}>
                            {item.includes(':') ? (
                              <span className="w-full">
                                <span className={`block font-black mb-2 text-[1.2em] ${TEXT_WHITE}`}>{item.split(':')[0]}</span>
                                <span className={`block font-medium ${TEXT_WHITE_SOFT}`}>{item.split(':')[1]}</span>
                              </span>
                            ) : (
                                <span className={TEXT_WHITE}>{item}</span>
                            )}
                        </p>
                      </div>
                   </div>
                 );
               })}
             </div>
          </div>
        );

      case SlideType.QUOTE:
        return (
          <div className="h-full w-full p-6 md:p-12 box-border z-10">
             <div className={`h-full w-full ${ACCENT_GLASS} rounded-[4.5rem] relative flex flex-col items-center justify-center text-center p-8 md:p-20 overflow-hidden`}>
                {/* Refraction Effect - White/Blue glow */}
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-500/20 blur-[100px] pointer-events-none"></div>
                
                <div className="relative z-10 max-w-5xl flex flex-col items-center flex-1 justify-center w-full">
                   <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-3xl rounded-[3rem] flex items-center justify-center text-white mb-10 md:mb-14 border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                      <Quote className="w-10 h-10 md:w-14 md:h-14 fill-white/80" />
                   </div>
                   
                   {slide.content.map((item, idx) => (
                     <h3 key={idx} className={`${contentFontSizeClass} font-black text-white leading-[1.1] tracking-tight mb-10 break-keep w-full flex items-center justify-center drop-shadow-2xl`}>
                       "{item}"
                     </h3>
                   ))}

                   {slide.subtitle && (
                     <div className="px-10 py-4 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-full mt-4">
                        <p className={`text-xl md:text-3xl font-bold tracking-wide ${TEXT_WHITE}`}>{slide.subtitle}</p>
                     </div>
                   )}
                </div>
             </div>
          </div>
        );

      default:
        return <div className="p-20 text-center font-black text-slate-300">LAYOUT ERROR</div>;
    }
  };

  return (
    <div className="w-full h-full rounded-[48px] shadow-2xl overflow-hidden relative select-none font-sans border-[2px] border-white/30">
       {/* 
         REAL IMAGE BACKGROUND
         Using the high-quality Unsplash image that exactly matches the description:
         Green, Lime, Fluid, Wave.
       */}
       <div className="absolute inset-0 z-0">
         <img 
            src="https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2832&auto=format&fit=crop" 
            className="w-full h-full object-cover scale-105" 
            alt="Liquid Gradient"
         />
       </div>

       {/* Render the Liquid Glass Content */}
       <div className="relative w-full h-full z-10">
         {renderContent()}
       </div>
    </div>
  );
};

export default SlideRenderer;