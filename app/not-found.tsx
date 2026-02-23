import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, Compass } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="text-center max-w-md w-full space-y-8">
                {/* Animated Compass Icon */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-emerald-100/50 rounded-full animate-pulse"></div>
                        <div className="bg-white p-4 rounded-full shadow-sm relative border border-emerald-100">
                            <Compass className="w-12 h-12 text-emerald-600 animate-spin" style={{ animationDuration: '4s' }} />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-8xl font-black text-gray-200 tracking-tighter">404</h1>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Looks like you're lost in space.</h2>
                    <p className="text-gray-500 pb-4 leading-relaxed">
                        The property or page you're searching for has either been moved, sold, or doesn't exist on Space Realty.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <Link href="/" className="block">
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-md shadow border border-emerald-700">
                            <Home className="w-4 h-4 mr-2" />
                            Return to Homepage
                        </Button>
                    </Link>
                    <Link href="/research" className="block">
                        <Button variant="outline" className="w-full h-12 text-md border-gray-200 hover:bg-gray-100 text-gray-700">
                            <Search className="w-4 h-4 mr-2" />
                            Search Properties
                        </Button>
                    </Link>
                </div>

                <div className="pt-8 border-t border-gray-200/60 mt-8">
                    <p className="text-xs text-gray-400 font-medium">© {new Date().getFullYear()} Space Realty. Need help? <a href="mailto:support@space-realty.sg" className="text-emerald-600 hover:underline">Contact Support</a></p>
                </div>
            </div>
        </div>
    );
}
