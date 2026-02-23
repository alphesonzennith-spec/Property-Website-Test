import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Rocket, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ListingSuccessModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    listingType: "owner" | "agent";
}

export function ListingSuccessModal({ isOpen, onOpenChange, listingType }: ListingSuccessModalProps) {
    const router = useRouter();

    const handleViewListings = () => {
        onOpenChange(false);
        // Force a hard navigation to ensure the Next.js dev server picks up the new route
        window.location.href = "/profile/my-listings";
    };

    const handleListAnother = () => {
        onOpenChange(false);
        // Reloads current page to restart the flow
        window.location.reload();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md text-center p-8">
                <DialogHeader className="flex flex-col items-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4 animate-bounce">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                        Listing Published!
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 mt-2">
                        {listingType === "owner"
                            ? "Your direct owner property listing is now live on our platform. Buyers can reach out to you directly!"
                            : "Your verified agent listing is now active. We'll start matching it with premium leads immediately."}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 mt-8">
                    <Button
                        onClick={handleViewListings}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                    >
                        <Rocket className="w-4 h-4" />
                        View My Listings
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleListAnother}
                        className="w-full text-gray-600 flex items-center justify-center gap-2"
                    >
                        List Another Property <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
