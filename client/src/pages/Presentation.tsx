import React, { useState, useEffect, useCallback, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Minimize2,
    Cpu,
    Terminal,
    Activity,
    Shield,
    Search,
    Users
} from 'lucide-react';
import { presentationSlides, Slide } from './presentationData';

/**
 * SlideContent - specialized renderers for different slide types
 */
const SlideContent = memo(({ slide }: { slide: Slide }) => {
    switch (slide.type) {
        case 'title':
            return (
                <div className="h-full flex flex-col justify-center items-center text-center">
                    <div className="relative mb-8">
                        <h1 className="text-9xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">
                            <span className="text-cyan-400">[</span>
                            {slide.title}
                            <span className="text-magenta-500">]</span>
                        </h1>
                        <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-magenta-500 animate-pulse" />
                        <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-500 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-mono text-cyan-400 tracking-[0.5em] mb-12 uppercase opacity-80 decoration-magenta-500/50 underline-offset-8 underline">
                        {slide.subtitle}
                    </h2>
                    <div className="grid grid-cols-2 gap-8 text-left max-w-2xl border-t border-white/10 pt-8">
                        {slide.content.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Terminal className="w-4 h-4 text-magenta-500" />
                                <span className="text-sm font-mono text-gray-400 uppercase tracking-widest">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'grid':
            return (
                <div className="h-full flex flex-col pt-12">
                    <h2 className="text-4xl font-mono font-bold text-cyan-400 mb-12 border-b border-cyan-500/30 pb-4 uppercase tracking-tighter">
                        {slide.title}
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                        {slide.content.map((item, i) => {
                            const [name, desc] = item.split(': ');
                            const icons = [Search, Activity, Users, Shield];
                            const Icon = icons[i % icons.length];
                            return (
                                <Card key={i} className="bg-gray-900/40 border border-cyan-500/10 p-6 transition-all hover:bg-cyan-500/5 hover:border-cyan-500/40 group">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-cyan-500/10 rounded-sm group-hover:bg-cyan-500/20 transition-colors">
                                            <Icon className="w-6 h-6 text-cyan-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-mono font-bold text-white mb-2 tracking-tight group-hover:text-cyan-300">{name}</h3>
                                            <p className="text-sm text-gray-500 leading-relaxed font-mono italic">{desc}</p>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            );

        case 'stats':
        case 'trace':
            return (
                <div className="h-full flex flex-col pt-12">
                    <h2 className="text-4xl font-mono font-bold text-cyan-400 mb-12 border-b border-cyan-500/30 pb-4 uppercase tracking-tighter">
                        {slide.title}
                    </h2>
                    <div className="space-y-4 max-w-4xl">
                        {slide.content.map((item, i) => (
                            <div key={i} className="flex items-center gap-6 bg-gray-900/30 border-l-4 border-magenta-500 p-4 font-mono">
                                <span className="text-magenta-800 text-xs shrink-0">STEP_{i + 1}</span>
                                <span className="text-lg text-gray-300 tracking-tight">{item}</span>
                                <div className="flex-1 border-b border-white/5 border-dotted mx-4" />
                                <Activity className="w-4 h-4 text-cyan-500/40 shrink-0" />
                            </div>
                        ))}
                    </div>
                </div>
            );

        default:
            return (
                <div className="h-full flex flex-col pt-12">
                    <h1 className="text-4xl font-mono font-bold text-cyan-400 mb-12 border-b border-cyan-500/30 pb-4 uppercase tracking-tighter flex items-center gap-4">
                        <Cpu className="w-8 h-8 text-magenta-500 animate-pulse" />
                        {slide.title}
                    </h1>
                    <div className="space-y-8 pl-8 border-l border-white/5">
                        {slide.content.map((item, i) => (
                            <div key={i} className="relative">
                                <div className="absolute -left-10 top-2 w-4 h-px bg-cyan-500 opacity-40" />
                                <p className="text-2xl font-mono text-gray-300 leading-relaxed tracking-tight highlight-glow capitalize">
                                    {item}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            );
    }
});

export default function Presentation() {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const currentSlide = presentationSlides[currentSlideIndex];

    const goToNextSlide = useCallback(() => {
        setCurrentSlideIndex(prev => Math.min(prev + 1, presentationSlides.length - 1));
    }, []);

    const goToPrevSlide = useCallback(() => {
        setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'Space') goToNextSlide();
            if (e.key === 'ArrowLeft') goToPrevSlide();
            if (e.key === 'f') toggleFullscreen();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToNextSlide, goToPrevSlide]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    return (
        <div className={`h-screen bg-black text-white relative flex flex-col overflow-hidden select-none ${isFullscreen ? 'p-12' : 'p-6'}`}>
            {/* HUD Overlays */}
            <div className="absolute inset-0 pointer-events-none z-50">
                <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,255,0.02)_2px,rgba(0,255,255,0.02)_4px)]" />
                <div className="absolute top-4 left-4 text-[10px] font-mono text-cyan-600 tracking-widest uppercase animate-pulse">
          // SYSTEM_PRESENTATION_MODE :: ACTIVE
                </div>
                <div className="absolute bottom-4 right-4 text-[10px] font-mono text-magenta-900 tracking-widest uppercase">
                    LOGIC_REACTIVE_V3.82
                </div>
                <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-cyan-500/20" />
                <div className="absolute bottom-0 right-0 w-32 h-32 border-b border-r border-magenta-500/20" />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 relative z-10 flex flex-col">
                <div className="flex-1 bg-gray-900/20 border border-white/5 rounded-lg p-16 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-magenta-500/5 rounded-full blur-3xl" />

                    <SlideContent key={currentSlide.id} slide={currentSlide} />
                </div>
            </main>

            {/* Footer Navigation */}
            <footer className="mt-6 flex justify-between items-center z-20">
                <div className="flex items-center gap-4">
                    <div className="bg-gray-900 border border-white/10 px-4 py-2 rounded flex items-center gap-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={goToPrevSlide}
                            disabled={currentSlideIndex === 0}
                            className="text-cyan-400 hover:bg-cyan-500/10 h-8 w-8"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div className="font-mono text-sm tracking-tighter min-w-[100px] text-center">
                            <span className="text-white font-bold">{String(currentSlideIndex + 1).padStart(2, '0')}</span>
                            <span className="text-gray-700 mx-2">/</span>
                            <span className="text-gray-500">{String(presentationSlides.length).padStart(2, '0')}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={goToNextSlide}
                            disabled={currentSlideIndex === presentationSlides.length - 1}
                            className="text-cyan-400 hover:bg-cyan-500/10 h-8 w-8"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-800 uppercase tracking-widest ml-4">
                        {currentSlide.footer}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-8 flex items-center gap-1 bg-gray-950 px-3 rounded border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 opacity-50" />
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 opacity-20" />
                    </div>
                    <Button variant="outline" size="icon" onClick={toggleFullscreen} className="bg-gray-900 border-white/10 text-gray-500 hover:text-white">
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                </div>
            </footer>

            <style>{`
        .highlight-glow {
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.1);
        }
        @keyframes scanline {
          0% { transform: translateY(0); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
        </div>
    );
}
