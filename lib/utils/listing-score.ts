export function calculateQualityScore(draft: any): number {
    let score = 0;

    // Photos: +20 points (4+ photos)
    if (draft.photos && draft.photos.length >= 4) {
        score += 20;
    } else if (draft.photos && draft.photos.length > 0) {
        score += 5 * draft.photos.length;
    }

    // Floor Plan: +15 points
    if (draft.floorPlanUrl) {
        score += 15;
    }

    // Complete description: +20 points (arbitrary threshold: 50+ chars)
    if (draft.description && draft.description.length > 50) {
        score += 20;
    }

    // All core fields filled: +20 points
    const coreFields = ['propertyType', 'price', 'bedrooms', 'bathrooms', 'size'];
    const hasAllCore = coreFields.every(field => !!draft[field]);
    if (hasAllCore) {
        score += 20;
    }

    // Virtual tour: +10 points
    if (draft.virtualTourUrl) {
        score += 10;
    }

    // Verification level: +15 points
    if (draft.isVerified) {
        score += 15;
    }

    return Math.min(100, score);
}
