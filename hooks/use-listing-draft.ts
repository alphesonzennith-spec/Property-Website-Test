import { useState, useEffect } from 'react';

export function useListingDraft(flow: 'owner' | 'agent') {
    const DRAFT_KEY = `space_realty_${flow}_draft`;
    const [draft, setDraft] = useState<any>({});
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
            try {
                setDraft(JSON.parse(savedDraft));
            } catch (e) {
                console.error("Failed to parse draft", e);
            }
        }
        setIsLoaded(true);
    }, [DRAFT_KEY]);

    const updateDraft = (updates: any) => {
        const newDraft = { ...draft, ...updates };
        setDraft(newDraft);
        localStorage.setItem(DRAFT_KEY, JSON.stringify(newDraft));
    };

    const clearDraft = () => {
        setDraft({});
        localStorage.removeItem(DRAFT_KEY);
    };

    return { draft, updateDraft, clearDraft, isLoaded };
}
