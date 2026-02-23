import { useState, useEffect } from 'react';

export interface Listing {
    id: string;
    type: 'owner' | 'agent';
    status: 'active' | 'draft' | 'sold';
    publishedAt: string;
    price?: string;
    propertyType?: string;
    bedrooms?: string;
    bathrooms?: string;
    size?: string;
    address?: string; // Derived from postal code/unit
    postalCode?: string;
    unitNumber?: string;
    description?: string;
    photos?: string[];
    [key: string]: any;
}

const STORAGE_KEY = 'space_realty_my_listings';

export function useMyListings() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load existing listings from localStorage on mount
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setListings(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse listings from localStorage", e);
            }
        }
        setIsLoaded(true);
    }, []);

    const publishListing = (draftData: any, flowType: 'owner' | 'agent') => {
        // Create a new listing object from draft data
        const newListing: Listing = {
            ...draftData,
            id: `LST-${Date.now().toString().slice(-6)}`,
            type: flowType,
            status: 'active',
            publishedAt: new Date().toISOString(),
            // Attempt to build a basic address or title from input
            address: `Block ${draftData.postalCode || 'XYZ'}, Unit ${draftData.unitNumber || '00-00'}`,
        };

        const updatedListings = [newListing, ...listings];
        setListings(updatedListings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedListings));

        return newListing;
    };

    const deleteListing = (id: string) => {
        const updatedListings = listings.filter((l) => l.id !== id);
        setListings(updatedListings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedListings));
    };

    return { listings, isLoaded, publishListing, deleteListing };
}
