import React from 'react';
import Link from 'next/link';
import { ServiceProvider } from '@/types/services';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Bot, Sparkles, Zap } from 'lucide-react';

interface AIAgentCardProps {
    provider: ServiceProvider;
}

export function AIAgentCard({ provider }: AIAgentCardProps) {
    // Extract emoji and gradient from portfolioUrls (set in mock data matching homepage)
    const emoji = provider.portfolioUrls[0] || '🤖';
    const gradient = provider.portfolioUrls[1] || 'linear-gradient(135deg, #059669 0%, #10B981 100%)';

    return (
        <Card
            className="flex flex-col h-full text-white border-none shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
            style={{ background: gradient }}
        >
            {/* Decorative animated background elements */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-white/10 blur-3xl group-hover:bg-white/20 transition-all duration-500" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 rounded-full bg-white/5 blur-3xl group-hover:bg-white/10 transition-all duration-500 animate-pulse" />

            <CardHeader className="pb-2 relative z-10">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md ">
                            <span className="text-2xl" aria-hidden="true">{emoji}</span>
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                                {provider.displayName}
                            </CardTitle>
                            <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mt-1">{provider.companyName}</p>
                        </div>
                    </div>

                    {/* Absolute Positioning for the Online Status to lock it strictly to top-right corner */}
                    <div className="absolute top-1 right-3 flex items-center gap-1.5 bg-white/10 rounded-full px-2 py-0.5 z-20 shadow-sm border border-white/5 backdrop-blur-md transition-transform group-hover:scale-110">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
                        <span className="text-[10px] text-white/95 font-bold uppercase tracking-wider">Online</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 pt-4 pb-2 relative z-10">
                <p className="text-sm text-white/90 leading-relaxed mb-4">{provider.description}</p>

                <div className="space-y-2">
                    <Badge variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                        <Star className="h-3 w-3 mr-1 text-yellow-300 fill-current" />
                        {provider.ratings.average.toFixed(1)} ({provider.ratings.count})
                    </Badge>
                    <Badge variant="outline" className="border-white/20 text-white/90 bg-transparent block w-max mt-2">
                        Platform AI Service
                    </Badge>
                </div>
            </CardContent>

            <CardFooter className="pt-4 relative z-10">
                <Link href={`/chat/${provider.id}`} className="w-full">
                    <Button className="w-full bg-white/20 text-white hover:bg-white/30 font-semibold rounded-xl transition-colors border-0 flex items-center justify-center gap-2 shadow-sm relative overflow-hidden group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        Chat with {provider.displayName}
                        <span className="ml-1 opacity-80 text-lg leading-none">→</span>
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
