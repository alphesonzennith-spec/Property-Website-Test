/**
 * Mocks the Supabase Storage upload process.
 * In a real app, this would use the Supabase client to push files and return the public URL.
 */
export async function uploadDocumentMock(file: File, path: string): Promise<string> {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate successful upload and generation of a public URL
            resolve(`https://mock-storage.space-realty.sg/${path}/${file.name}`);
        }, 1500); // 1.5s delay for realism
    });
}
