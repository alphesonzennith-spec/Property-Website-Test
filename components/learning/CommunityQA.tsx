'use client';

import { useState } from 'react';
import { MessageSquare, CheckCircle2, User, Send } from 'lucide-react';

interface Question {
    id: string;
    user: string;
    text: string;
    answer: string | null;
    isVerified: boolean;
    isAgent: boolean;
    date: string;
}

const MOCK_QUESTIONS: Question[] = [
    {
        id: 'q1',
        user: 'Alex T.',
        text: 'If I pay ABSD on my second property, can I claim it back if I sell my first property?',
        answer: 'Yes, married couples (where at least one is a SC) can apply for ABSD remission if they sell their first residential property within 6 months of purchasing the second completed property, or within 6 months of TOP for uncompleted properties. Terms and conditions apply.',
        isVerified: true,
        isAgent: false,
        date: '2 days ago'
    },
    {
        id: 'q2',
        user: 'Sarah M.',
        text: 'Does the 15-month wait-out period apply if I am downgrading from a 5-room to a 4-room HDB?',
        answer: 'The 15-month wait-out period generally applies to private property owners buying a non-subsidized HDB resale flat. If you are moving from one HDB to another, this specific wait-out period does not apply, though you must still meet other eligibility criteria like fulfilling your MOP.',
        isVerified: false,
        isAgent: true,
        date: '1 week ago'
    },
    {
        id: 'q3',
        user: 'Jason K.',
        text: 'What is the current TDSR limit?',
        answer: null,
        isVerified: false,
        isAgent: false,
        date: 'Just now'
    }
];

export function CommunityQA() {
    const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS);
    const [newQuestion, setNewQuestion] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQuestion.trim()) return;

        const newQ: Question = {
            id: `q${questions.length + 1}`,
            user: 'You',
            text: newQuestion,
            answer: null,
            isVerified: false,
            isAgent: false,
            date: 'Just now'
        };

        setQuestions([newQ, ...questions]);
        setNewQuestion('');
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center mb-6 pb-4 border-b border-gray-100">
                <MessageSquare className="h-6 w-6 mr-3 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Community Q&A</h2>
            </div>

            <div className="mb-8">
                <form onSubmit={handleSubmit} className="flex gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            placeholder="Ask a question about this topic..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center"
                        disabled={!newQuestion.trim()}
                    >
                        Ask <Send className="h-4 w-4 ml-2" />
                    </button>
                </form>
                <p className="text-xs text-gray-500 mt-2 ml-1">Questions are pre-screened by our AI before publishing.</p>
            </div>

            <div className="space-y-6">
                {questions.map((q) => (
                    <div key={q.id} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <div className="flex items-start mb-3">
                            <div className="bg-white p-2 rounded-full shadow-sm mr-3 border border-gray-200">
                                <User className="h-4 w-4 text-gray-500" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">{q.user}</span>
                                    <span className="text-xs text-gray-400">• {q.date}</span>
                                </div>
                                <p className="text-gray-800 mt-1">{q.text}</p>
                            </div>
                        </div>

                        {q.answer ? (
                            <div className="ml-11 mt-4 bg-white rounded-xl p-4 border border-indigo-100 shadow-sm relative">
                                <div className="absolute -left-3 top-4 w-6 h-px bg-indigo-100"></div>

                                <div className="flex items-center mb-2">
                                    {q.isVerified && (
                                        <div className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mb-2">
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            Verified by Space Realty AI
                                        </div>
                                    )}
                                    {q.isAgent && !q.isVerified && (
                                        <div className="flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md mb-2">
                                            <User className="h-3 w-3 mr-1" />
                                            Agent Answered
                                        </div>
                                    )}
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">{q.answer}</p>
                            </div>
                        ) : (
                            <div className="ml-11 mt-3">
                                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                                    Reviewing answer...
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
