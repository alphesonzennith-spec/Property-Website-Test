"use client";

import { useState } from "react";
import { useListingDraft } from "@/hooks/use-listing-draft";
import { useMyListings } from "@/hooks/use-my-listings";
import { ListingQualityMeter } from "@/components/listings/ListingQualityMeter";
import { ListingSuccessModal } from "@/components/listings/ListingSuccessModal";
import { MediaUploadModal } from "@/components/listings/MediaUploadModal";
import { uploadDocumentMock } from "@/lib/utils/mock-storage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Home, Sparkles, UploadCloud, MapPin, DollarSign } from "lucide-react";

export default function OwnerListingPage() {
    const { draft, updateDraft, clearDraft, isLoaded } = useListingDraft("owner");
    const { publishListing } = useMyListings();
    const [step, setStep] = useState(1);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState("");
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [generatingAi, setGeneratingAi] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showMediaModal, setShowMediaModal] = useState<{ isOpen: boolean, target: 'photo' | 'floorplan' | null }>({ isOpen: false, target: null });

    const uiMaxStep = Math.max(step, draft.highestStepReached || 1);

    const handleAdvanceStep = (newStep: number) => {
        const nextHighest = Math.max(newStep, draft.highestStepReached || 1);
        updateDraft({ highestStepReached: nextHighest });
        setStep(newStep);
    };

    // Step 1: Verification
    const handleVerifyOwnership = async () => {
        setIsVerifying(true);
        setVerificationError("");
        setTimeout(() => {
            // Simulate verification logic 
            if (!draft.postalCode || !draft.unitNumber) {
                setVerificationError("Please provide both postal code and unit number.");
                setIsVerifying(false);
                return;
            }
            updateDraft({ isVerified: true });
            setIsVerifying(false);
        }, 1500);
    };

    const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadingDoc(true);
            const url = await uploadDocumentMock(file, "ownership-docs");
            updateDraft({ ownershipDocUrl: url });
            setUploadingDoc(false);
        }
    };

    // Step 3: AI Generation
    const handleGenerateAiDescription = () => {
        setGeneratingAi(true);
        const mockAiPoints = draft.aiBulletPoints || "Spacious, well-lit, near MRT";

        let currentText = "";
        const fullText = `Welcome to this stunning property featuring: ${mockAiPoints}. Situated in a highly sought-after location with excellent amenities nearby. This home offers exceptional living space and is perfect for families or professionals looking for comfort and convenience.`;

        let i = 0;
        const interval = setInterval(() => {
            currentText += fullText[i];
            updateDraft({ description: currentText });
            i++;
            if (i >= fullText.length) {
                clearInterval(interval);
                setGeneratingAi(false);
            }
        }, 20); // ms per char
    };

    if (!isLoaded) return <div className="p-8">Loading draft...</div>;

    const handlePublish = async () => {
        setIsPublishing(true);
        // Simulate network latency for publishing
        setTimeout(() => {
            publishListing(draft, "owner");
            clearDraft();
            setIsPublishing(false);
            setShowSuccessModal(true);
        }, 1200);
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ListingSuccessModal
                isOpen={showSuccessModal}
                onOpenChange={setShowSuccessModal}
                listingType="owner"
            />
            <MediaUploadModal
                isOpen={showMediaModal.isOpen}
                onOpenChange={(open) => setShowMediaModal({ ...showMediaModal, isOpen: open })}
                title={showMediaModal.target === 'photo' ? 'Add Property Photo' : 'Add Floor Plan'}
                onSelect={(url) => {
                    if (showMediaModal.target === 'photo') {
                        const existing = draft.photos || [];
                        updateDraft({ photos: [...existing, url] });
                    } else if (showMediaModal.target === 'floorplan') {
                        updateDraft({ floorPlanUrl: url });
                    }
                }}
            />
            {/* LEFT CONTENT: The Multi-Step Form */}
            <div className="lg:col-span-2 space-y-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">List Your Property</h1>
                    <p className="text-gray-500">Flow 1: Owner Direct Listing (0% Commission)</p>
                </div>

                {/* STEP NAV */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {[1, 2, 3, 4, 5].map(s => (
                        <button
                            key={s}
                            onClick={() => { if (s <= step || draft.isVerified) setStep(s) }}
                            className={`flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${step === s
                                ? 'bg-blue-600 text-white' :
                                (s <= uiMaxStep) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'
                                }`}
                        >
                            Step {s}
                        </button>
                    ))}
                </div>

                {/* STEP 1: OWNERSHIP */}
                {step === 1 && (
                    <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6 animate-in slide-in-from-right-4">
                        <div className="flex items-center gap-3 border-b pb-4">
                            <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Listing Purpose & Verification</h2>
                                <p className="text-sm text-gray-500">Required via Singpass MyInfo</p>
                            </div>
                        </div>

                        <div className="space-y-3 pb-4 border-b">
                            <Label>I want to:</Label>
                            <div className="flex gap-4">
                                <Button
                                    variant={draft.listingPurpose === 'sell' ? 'default' : 'outline'}
                                    className={draft.listingPurpose === 'sell' ? 'bg-blue-600' : ''}
                                    onClick={() => updateDraft({ listingPurpose: 'sell' })}
                                >
                                    Sell my property
                                </Button>
                                <Button
                                    variant={draft.listingPurpose === 'rent' ? 'default' : 'outline'}
                                    className={draft.listingPurpose === 'rent' ? 'bg-blue-600' : ''}
                                    onClick={() => updateDraft({ listingPurpose: 'rent' })}
                                >
                                    Rent it out
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Postal Code</Label>
                                <Input
                                    value={draft.postalCode || ""}
                                    onChange={e => updateDraft({ postalCode: e.target.value })}
                                    placeholder="e.g. 520123"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Unit Number</Label>
                                <Input
                                    value={draft.unitNumber || ""}
                                    onChange={e => updateDraft({ unitNumber: e.target.value })}
                                    placeholder="e.g. #04-123"
                                />
                            </div>
                        </div>

                        {verificationError && <p className="text-sm text-red-500">{verificationError}</p>}

                        {!draft.isVerified ? (
                            <Button onClick={handleVerifyOwnership} disabled={isVerifying} className="w-full">
                                {isVerifying ? "Checking MyInfo..." : "Verify via Singpass"}
                            </Button>
                        ) : (
                            <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5" />
                                <span>Ownership Confirmed ✓</span>
                            </div>
                        )}

                        <div className="pt-4 border-t space-y-4">
                            <Label>Supporting Document (SLA Title Deed / Tax Bill)</Label>
                            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center text-center">
                                <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
                                <Input
                                    type="file"
                                    onChange={handleDocUpload}
                                    className="hidden"
                                    id="doc-upload"
                                />
                                <Label htmlFor="doc-upload" className="cursor-pointer text-blue-600 hover:underline">
                                    {uploadingDoc ? "Uploading..." : draft.ownershipDocUrl ? "Document Uploaded ✓ Click to change" : "Click to upload a document"}
                                </Label>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button disabled={!draft.isVerified} onClick={() => handleAdvanceStep(2)}>Next Step</Button>
                        </div>
                    </div>
                )}

                {/* STEP 2: PROPERTY DETAILS */}
                {step === 2 && (
                    <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6 animate-in slide-in-from-right-4">
                        <div className="flex items-center justify-between border-b pb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                    <Home className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">Basic Details</h2>
                                    <p className="text-sm text-gray-500">Property specifications</p>
                                </div>
                            </div>
                            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                0% Commission
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Property Type</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={draft.propertyType || ""}
                                    onChange={e => updateDraft({ propertyType: e.target.value })}
                                >
                                    <option value="">Select type...</option>
                                    <optgroup label="Residential">
                                        <option value="HDB">HDB</option>
                                        <option value="Condo">Condominium</option>
                                        <option value="Landed">Landed Property</option>
                                    </optgroup>
                                    <optgroup label="Commercial">
                                        <option value="Commercial - Retail">Retail Space</option>
                                        <option value="Commercial - Office">Office Space</option>
                                        <option value="Commercial - Industrial">Industrial / B1 / B2</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Size (sqft)</Label>
                                <Input
                                    type="number"
                                    value={draft.size || ""}
                                    onChange={e => updateDraft({ size: e.target.value })}
                                    placeholder="e.g. 1100"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Bedrooms</Label>
                                <Input
                                    type="number"
                                    value={draft.bedrooms || ""}
                                    onChange={e => updateDraft({ bedrooms: e.target.value })}
                                    placeholder="e.g. 3"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Bathrooms</Label>
                                <Input
                                    type="number"
                                    value={draft.bathrooms || ""}
                                    onChange={e => updateDraft({ bathrooms: e.target.value })}
                                    placeholder="e.g. 2"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                            <Button onClick={() => handleAdvanceStep(3)}>Next Step</Button>
                        </div>
                    </div>
                )}

                {/* STEP 3: AI DESCRIPTION */}
                {step === 3 && (
                    <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6 animate-in slide-in-from-right-4">
                        <div className="flex items-center gap-3 border-b pb-4">
                            <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">AI Description generation</h2>
                                <p className="text-sm text-gray-500">Auto-write a compelling listing</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Key features (Bullet points)</Label>
                                <Textarea
                                    placeholder="- High floor\n- Unblocked view\n- Newly renovated kitchen"
                                    value={draft.aiBulletPoints || ""}
                                    onChange={e => updateDraft({ aiBulletPoints: e.target.value })}
                                    className="h-24"
                                />
                            </div>
                            <Button
                                onClick={handleGenerateAiDescription}
                                disabled={generatingAi}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2"
                            >
                                <Sparkles className="h-4 w-4" />
                                {generatingAi ? "Generating..." : "Generate Listing with AI"}
                            </Button>

                            <div className="space-y-2 pt-4">
                                <Label>Final Description (Editable)</Label>
                                <Textarea
                                    value={draft.description || ""}
                                    onChange={e => updateDraft({ description: e.target.value })}
                                    className="h-48"
                                    placeholder="Your generated description will appear here..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                            <Button onClick={() => handleAdvanceStep(4)}>Next Step</Button>
                        </div>
                    </div>
                )}

                {/* STEP 4: PHOTOS */}
                {step === 4 && (
                    <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6 animate-in slide-in-from-right-4">
                        <div className="flex items-center gap-3 border-b pb-4">
                            <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                                <UploadCloud className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Photos & Media</h2>
                                <p className="text-sm text-gray-500">Upload high-quality images and layouts</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>Property Photos</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {/* Mock photo placeholders */}
                                {draft.photos?.map((p: any, i: number) => (
                                    <div key={i} className="aspect-video bg-gray-200 rounded-lg overflow-hidden border">
                                        <img src={p} alt={`Photo ${i}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <button
                                    className="aspect-video border-2 border-dashed hover:bg-gray-50 rounded-lg flex flex-col items-center justify-center text-gray-500"
                                    onClick={() => setShowMediaModal({ isOpen: true, target: 'photo' })}
                                >
                                    <UploadCloud className="h-6 w-6 mb-1" />
                                    <span className="text-xs">Add Photo</span>
                                </button>
                            </div>

                            <div className="pt-4 space-y-4">
                                <div className="space-y-2">
                                    <Label>Floor Plan</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Floor plan URL or select file..."
                                            value={draft.floorPlanUrl || ""}
                                            onChange={e => updateDraft({ floorPlanUrl: e.target.value })}
                                        />
                                        <Button variant="outline" onClick={() => setShowMediaModal({ isOpen: true, target: 'floorplan' })}>Browse</Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Virtual Tour URL (Optional)</Label>
                                    <Input
                                        placeholder="e.g. https://myero.space/tour/123"
                                        value={draft.virtualTourUrl || ""}
                                        onChange={e => updateDraft({ virtualTourUrl: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                            <Button onClick={() => handleAdvanceStep(5)}>Next Step</Button>
                        </div>
                    </div>
                )}

                {/* STEP 5: PRICING */}
                {step === 5 && (
                    <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6 animate-in slide-in-from-right-4">
                        <div className="flex items-center gap-3 border-b pb-4">
                            <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                <DollarSign className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Pricing & Availability</h2>
                                <p className="text-sm text-gray-500">Set your price and moving dates</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-4">
                                <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-blue-900">AI Valuation Estimate</h4>
                                    <p className="text-sm text-blue-700 mt-1">Based on recent transactions in your area, similar properties sold between <strong>$1.1M - $1.25M</strong>.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Asking Price (S$)</Label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 1150000"
                                        value={draft.price || ""}
                                        onChange={e => updateDraft({ price: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Availability Date</Label>
                                    <Input
                                        type="date"
                                        value={draft.availability || ""}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={e => updateDraft({ availability: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="negotiable"
                                    checked={draft.isNegotiable || false}
                                    onChange={(e) => updateDraft({ isNegotiable: e.target.checked })}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                />
                                <label htmlFor="negotiable" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Price is negotiable
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-between pt-8 border-t">
                            <Button variant="outline" onClick={() => setStep(4)} disabled={isPublishing}>Back</Button>
                            <Button
                                onClick={handlePublish}
                                disabled={isPublishing}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                {isPublishing ? "Publishing..." : "Publish Listing"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT SIDEBAR: Quality Meter */}
            <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">
                    <ListingQualityMeter draft={draft} />

                    <div className="bg-slate-50 border rounded-xl p-5 shadow-sm">
                        <h4 className="font-semibold mb-2">Need Help?</h4>
                        <p className="text-sm text-slate-600 mb-4">Our AI assistant is here to guide you through the process.</p>
                        <Button variant="outline" className="w-full gap-2">Ask AI Assistant</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
