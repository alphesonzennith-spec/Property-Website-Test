/**
 * Mocks the generation of a PDF for the owner consent form.
 * In a real app, this would use a library like react-pdf or a backend service.
 */
export async function generateOwnerConsentPdfMock(agentName: string, ceaNumber: string, propertyAddress: string): Promise<string> {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate successful generation of a PDF URL
            resolve(`https://mock-storage.space-realty.sg/consent-forms/consent_${Date.now()}.pdf`);
        }, 2000); // 2s delay for realism
    });
}
