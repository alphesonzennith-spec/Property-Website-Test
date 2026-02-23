'use client';

import { useEffect, useRef } from 'react';

const CHARS = ['.', ':', '-', '=', '+', '*', '#', '%', '@'];
const HEAT_MAX = CHARS.length - 1;
// Grid density to cover the container area - increased to prevent cropping
const GRID_WIDTH = 300;
const GRID_HEIGHT = 80;

export function SingaporePixelFire() {
    const containerRef = useRef<HTMLPreElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let frameId: number;

        const update = () => {
            const time = Date.now() / 1500;
            let output = '';

            for (let y = 0; y < GRID_HEIGHT; y++) {
                for (let x = 0; x < GRID_WIDTH; x++) {
                    const waveBase = Math.sin(x * 0.08 - time) * 0.5 + 0.5;
                    const waveVar = Math.sin((x - y * 2) * 0.1 - time * 1.5) * 0.5 + 0.5;
                    const heatNoise = Math.random() * 0.5;
                    const flameIntensity = (waveBase * 0.8 + waveVar * 0.2) * (0.7 + heatNoise * 0.3);

                    let heat = Math.floor(flameIntensity * HEAT_MAX);
                    heat = Math.max(0, Math.min(HEAT_MAX, heat));
                    output += CHARS[heat];
                }
                output += '\n';
            }

            container.textContent = output;

            // Retro frame rate
            setTimeout(() => {
                frameId = requestAnimationFrame(update);
            }, 80);
        };

        frameId = requestAnimationFrame(update);

        return () => {
            cancelAnimationFrame(frameId);
        };
    }, []);

    return (
        <div className="absolute inset-x-0 inset-y-[-100px] flex justify-center items-center pointer-events-none z-0 overflow-hidden aria-hidden select-none">
            <div
                className="relative w-[412px] h-[275px] md:w-[688px] md:h-[482px] lg:w-[825px] lg:h-[550px] scale-x-125 -translate-y-24"
                style={{
                    maskImage: 'url(/singapore.svg)',
                    WebkitMaskImage: 'url(/singapore.svg)',
                    maskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                }}
            >
                <pre
                    ref={containerRef}
                    className="w-full h-full font-mono text-[3px] sm:text-[4px] md:text-[5px] lg:text-[6px] font-extrabold leading-none bg-clip-text text-transparent opacity-40 mix-blend-multiply flex items-center justify-center overflow-hidden whitespace-pre"
                    style={{
                        backgroundImage: 'linear-gradient(to top, #047857 0%, #10B981 50%, #6EE7B7 100%)',
                        WebkitBackgroundClip: 'text',
                        textShadow: '0 0 10px rgba(16, 185, 129, 0.4)',
                        textAlign: 'center'
                    }}
                >
                    {/* Character grid will be injected here */}
                    {Array(GRID_HEIGHT).fill(' '.repeat(GRID_WIDTH)).join('\n')}
                </pre>
            </div>
        </div>
    );
}
