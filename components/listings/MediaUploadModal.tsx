import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, Link as LinkIcon, Globe } from "lucide-react";

interface MediaUploadModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (url: string) => void;
    title?: string;
}

export function MediaUploadModal({ isOpen, onOpenChange, onSelect, title = "Upload Media" }: MediaUploadModalProps) {
    const [linkModeUrl, setLinkModeUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            // Mock upload taking 1s for realism
            setTimeout(() => {
                // We simulate a successful storage output:
                onSelect(`https://placehold.co/800x600/png?text=Mock+Upload`);
                setIsUploading(false);
                onOpenChange(false);
            }, 1000);
        }
    };

    const handleLinkSubmit = () => {
        if (linkModeUrl) {
            onSelect(linkModeUrl);
            onOpenChange(false);
            setLinkModeUrl("");
        }
    };

    const handleWebSurf = () => {
        // Mock web surf selection
        setIsUploading(true);
        setTimeout(() => {
            // Return a mock stock image of a beautiful living room
            onSelect(`https://placehold.co/800x600?text=Web+Image`);
            setIsUploading(false);
            onOpenChange(false);
        }, 1000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Select a method to add your media.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="upload" className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="upload" className="flex items-center gap-2"><UploadCloud className="w-4 h-4" /> Upload</TabsTrigger>
                        <TabsTrigger value="link" className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Link</TabsTrigger>
                        <TabsTrigger value="web" className="flex items-center gap-2"><Globe className="w-4 h-4" /> Surf Web</TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="space-y-4 pt-4">
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center text-center">
                            <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                            <p className="text-sm text-gray-600 mb-4">Drag and drop your file here, or click to browse</p>
                            <div className="relative">
                                <Input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                />
                                <Button variant="outline" disabled={isUploading}>
                                    {isUploading ? "Uploading..." : "Browse Files"}
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="link" className="space-y-4 pt-4">
                        <div className="space-y-3">
                            <Label>Paste Media URL</Label>
                            <Input
                                placeholder="https://example.com/image.jpg"
                                value={linkModeUrl}
                                onChange={(e) => setLinkModeUrl(e.target.value)}
                            />
                            <Button className="w-full" onClick={handleLinkSubmit} disabled={!linkModeUrl}>Add via Link</Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="web" className="space-y-4 pt-4">
                        <div className="bg-slate-50 border rounded-lg p-6 text-center space-y-4">
                            <Globe className="w-8 h-8 text-blue-500 mx-auto" />
                            <p className="text-sm text-gray-600">Search the web for stock images or floor plans if you don't have your own.</p>
                            <Button className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleWebSurf} disabled={isUploading}>
                                {isUploading ? "Searching..." : "Surf the Web for Media"}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
