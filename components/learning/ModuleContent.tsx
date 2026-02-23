'use client';

import { useState } from 'react';
import { Sparkles, Loader2, BookOpen } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface ModuleContentProps {
    originalContent: string;
    moduleId: string;
}

export function ModuleContent({ originalContent, moduleId }: ModuleContentProps) {
    const [isEli5, setIsEli5] = useState(false);
    const [eli5Content, setEli5Content] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleEli5 = async (checked: boolean) => {
        setIsEli5(checked);

        // If turning on and we don't have the content yet
        if (checked && !eli5Content) {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/ai/explain-regulation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: originalContent, moduleId }),
                });

                if (!response.ok) throw new Error('Failed to fetch explanation');
                if (!response.body) throw new Error('No response body');

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let done = false;

                while (!done) {
                    const { value, done: doneReading } = await reader.read();
                    done = doneReading;
                    const chunkValue = decoder.decode(value);
                    setEli5Content((prev) => prev + chunkValue);
                }
            } catch (err) {
                setError('Could not simplify the text. Please try again.');
                setIsEli5(false);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <BookOpen className="h-6 w-6 mr-3 text-indigo-600" />
                    Module Concept
                </h2>

                <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-full">
                    <Sparkles className={`h-4 w-4 ${isEli5 ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span className="text-sm font-semibold text-indigo-900">Explain Like I'm 5</span>
                    <Switch
                        checked={isEli5}
                        onCheckedChange={toggleEli5}
                        // Add aria-label for accessibility
                        aria-label="Toggle Explain Like I'm 5"
                    />
                </div>
            </div>

            <div className="prose prose-lg max-w-none prose-indigo">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
                        <p className="animate-pulse">Simplifying real estate jargon with AI...</p>
                    </div>
                ) : error ? (
                    <div className="text-red-500 bg-red-50 rounded-xl p-4">{error}</div>
                ) : isEli5 ? (
                    <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100" dangerouslySetInnerHTML={{ __html: eli5Content }} />
                ) : (
                    <div dangerouslySetInnerHTML={{ __html: originalContent }} />
                )}
            </div>
        </div>
    );
}
