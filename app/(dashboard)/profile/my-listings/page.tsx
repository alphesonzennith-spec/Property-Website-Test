"use client";

import { useMyListings } from "@/hooks/use-my-listings";
import { Button } from "@/components/ui/button";
import { Building2, Home, MapPin, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function MyListingsPage() {
    const { listings, isLoaded, deleteListing } = useMyListings();

    if (!isLoaded) return <div className="p-8">Loading your listings...</div>;

    return (
        <ProtectedRoute>
            <div className="max-w-6xl mx-auto p-4 md:p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">My Listings</h1>
                        <p className="text-gray-500">Manage your active properties on Space Realty.</p>
                    </div>
                    <Link href="/list-property">
                        <Button className="bg-blue-600 hover:bg-blue-700">List New Property</Button>
                    </Link>
                </div>

                {listings.length === 0 ? (
                    <div className="bg-white border rounded-2xl p-16 text-center space-y-6">
                        <div className="mx-auto w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                            <Home className="w-10 h-10" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No active listings</h2>
                            <p className="text-gray-500 max-w-md mx-auto">
                                You haven't listed any properties yet. Reach thousands of verified buyers by listing your property today.
                            </p>
                        </div>
                        <Link href="/list-property" className="inline-block mt-4">
                            <Button className="bg-blue-600 hover:bg-blue-700 h-12 px-8 text-base">Get Started</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((listing) => (
                            <div key={listing.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                                {/* Image Header */}
                                <div className="relative aspect-video bg-gray-100 flex-shrink-0">
                                    {listing.photos && listing.photos.length > 0 ? (
                                        <Image src={listing.photos[0]} alt="Property Main" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                            <Building2 className="w-8 h-8 mb-2 opacity-50" />
                                            <span className="text-xs font-medium">No Image</span>
                                        </div>
                                    )}

                                    <div className="absolute top-3 left-3 flex gap-2">
                                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                                            {listing.status}
                                        </span>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide ${listing.type === 'owner' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                                            }`}>
                                            {listing.type === 'owner' ? 'Direct Owner' : 'Agent Listed'}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Body */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2 group">
                                        <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors cursor-pointer">
                                            {listing.address || 'Draft Property'}
                                        </h3>
                                    </div>

                                    <div className="flex items-center text-gray-500 text-sm mb-4">
                                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                        <span>Singapore {listing.postalCode}</span>
                                    </div>

                                    {/* Specs */}
                                    <div className="flex gap-4 text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-lg mb-4">
                                        <span>{listing.bedrooms || '-'} Beds</span>
                                        <span className="text-gray-300">|</span>
                                        <span>{listing.bathrooms || '-'} Baths</span>
                                        <span className="text-gray-300">|</span>
                                        <span>{listing.size || '-'} sqft</span>
                                    </div>

                                    <div className="mt-auto pt-4 flex flex-col border-t justify-between gap-4">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Asking Price</span>
                                            <span className="text-2xl font-bold tracking-tight text-gray-900 border-b-2 border-transparent">
                                                S${listing.price ? parseInt(listing.price).toLocaleString() : 'TBA'}
                                            </span>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            >
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                Preview
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => deleteListing(listing.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
