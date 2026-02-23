'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';

interface AiAgent {
  id: string;
  emoji: string;
  name: string;
  role: string;
  description: string;
  cta: string;
  gradient: string;
  textColor: string;
  ctaColor: string;
}

const AI_AGENTS: AiAgent[] = [
  {
    id: 'aria',
    emoji: '🤖',
    name: 'Aria',
    role: 'Your AI Property Advisor',
    description:
      'Finds properties matching your exact requirements, lifestyle, and budget with AI-powered precision.',
    cta: 'Chat with Aria →',
    gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    textColor: 'text-white',
    ctaColor: 'bg-white/20 hover:bg-white/30 text-white',
  },
  {
    id: 'rex',
    emoji: '🔍',
    name: 'Rex',
    role: 'Research & Analytics AI',
    description:
      'Deep dives into market trends, price history, district analysis and investment potential.',
    cta: 'Explore Data →',
    gradient: 'linear-gradient(135deg, #d97706 0%, #F59E0B 100%)',
    textColor: 'text-white',
    ctaColor: 'bg-white/20 hover:bg-white/30 text-white',
  },
  {
    id: 'vera',
    emoji: '⚖️',
    name: 'Vera',
    role: 'Legal & Compliance AI',
    description:
      'Reviews OTP documents, calculates stamp duty, and checks legal compliance so you transact safely.',
    cta: 'Ask Vera →',
    gradient: 'linear-gradient(135deg, #be123c 0%, #f43f5e 100%)',
    textColor: 'text-white',
    ctaColor: 'bg-white/20 hover:bg-white/30 text-white',
  },
  {
    id: 'feng',
    emoji: '🧭',
    name: 'Feng',
    role: 'Feng Shui & Astrology AI',
    description:
      'Ba Zi compatibility readings, property orientation analysis, and lucky unit number guidance.',
    cta: 'Get Reading →',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
    textColor: 'text-white',
    ctaColor: 'bg-white/20 hover:bg-white/30 text-white',
  },
];

export function AiTeamCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
  });

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1E293B] mb-2">
              Meet Your AI Team
            </h2>
            <p className="text-gray-500 text-base max-w-md">
              Specialized AI agents working 24/7 for your property journey
            </p>
          </div>

          {/* Navigation arrows */}
          <div className="flex gap-2 shrink-0 ml-4">
            <button
              onClick={scrollPrev}
              className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-[#10B981] hover:text-[#10B981] transition-colors shadow-sm"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollNext}
              className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-[#10B981] hover:text-[#10B981] transition-colors shadow-sm"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {AI_AGENTS.map((agent) => (
              <div key={agent.id} className="flex-shrink-0 pl-[20px] min-w-[300px]">
                <div className="rounded-2xl p-5 relative overflow-hidden flex flex-col" style={{ background: agent.gradient }}>
                  {/* Decorative circles */}
                  <div aria-hidden="true" className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
                  <div aria-hidden="true" className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />

                  <div className="relative z-10 flex flex-col h-full">
                    {/* Header: avatar + online status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                        <span aria-hidden="true">{agent.emoji}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-2.5 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" aria-hidden="true" />
                        <span className="text-[10px] text-white/80 font-medium">Online</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-0.5">{agent.name}</h3>
                    <p className="text-xs text-white/70 font-medium mb-3 uppercase tracking-wide">{agent.role}</p>
                    <p className="text-sm text-white/70 leading-relaxed mb-5 flex-1">{agent.description}</p>

                    <button
                      type="button"
                      className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${agent.ctaColor}`}
                    >
                      <MessageCircle className="w-4 h-4" aria-hidden="true" />
                      {agent.cta}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
