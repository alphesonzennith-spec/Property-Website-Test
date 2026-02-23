import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Sparkles, Clock } from 'lucide-react';
import { NewsItem } from '@/lib/mock/news';
import { formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
    news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
    return (
        <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col h-full group"
        >
            <Card className="flex-1 flex flex-col transition-all duration-300 hover:shadow-lg hover:border-gray-400 rounded-sm border-gray-200">
                <CardHeader className="pb-4 border-b border-gray-100 bg-white">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="text-xs font-medium text-gray-600 border-gray-300 rounded-sm">
                                    {news.category}
                                </Badge>
                                {news.isSpaceRealtyAnalysis && (
                                    <Badge variant="outline" className="bg-gray-900 text-white border-transparent flex items-center gap-1 rounded-sm text-xs font-medium">
                                        <Sparkles className="w-3 h-3" />
                                        Space Realty Analysis
                                    </Badge>
                                )}
                            </div>
                            <h3 className="font-bold text-xl leading-snug text-gray-900 group-hover:underline decoration-gray-400 underline-offset-4 transition-all line-clamp-3">
                                {news.headline}
                            </h3>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                    </div>
                </CardHeader>
                <CardContent className="pt-4 flex-grow">
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {news.summary}
                    </p>
                </CardContent>
                <CardFooter className="pt-0 pb-4 text-xs text-gray-500 flex justify-between items-center">
                    <span className="font-medium">{news.source}</span>
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDistanceToNow(new Date(news.publishedDate), { addSuffix: true })}</span>
                    </div>
                </CardFooter>
            </Card>
        </a>
    );
}
