import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import advertisementService from "../../services/advertisement.service";
import { X, Megaphone, ArrowRight } from "lucide-react";
import { IMAGE_BASE_URL } from "@/configs/env";

const AUTO_ADVANCE_MS = 6000;

const FloatingAdvertisement = () => {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await advertisementService.getAds();
        const data = Array.isArray(response) ? response : response?.data || [];
        setAds(data);
      } catch (error) {
        console.error("Failed to fetch ads for floating component", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length <= 1 || isDismissed || isExpanded) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(timer);
  }, [ads.length, isDismissed, isExpanded]);

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsVisible(false);
    setTimeout(() => {
      setIsDismissed(true);
    }, 500); // Wait for slide-out animation
  };

  if (loading || ads.length === 0 || isDismissed) return null;

  const activeAd = ads[currentIndex];

  return (
    <>
      {/* Fullscreen Popup Modal - High Impact Emergence */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-500"
          onClick={() => setIsExpanded(false)}
        >
          {/* Close Indicator (Top Right) */}
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-8 right-8 z-50 p-4 bg-white/10 hover:bg-white/20 text-white transition-all rounded-none border border-white/20 backdrop-blur-md"
            aria-label="Close full view"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
          
          <div 
            className="relative w-full h-full max-w-[95vw] max-h-[95vh] flex items-center justify-center animate-in zoom-in-90 slide-in-from-bottom-5 duration-500 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeAd.image_url?.startsWith("http") ? activeAd.image_url : `${IMAGE_BASE_URL}${activeAd.image_url}`}
              alt="Full advertisement"
              className="max-h-full max-w-full object-contain shadow-[0_30px_100px_rgba(0,0,0,0.9)] border border-white/5"
            />
          </div>
        </div>
      )}

      {/* Floating CTA Pill (Post Your Ad) */}
      <div 
        className={`fixed bottom-[23rem] right-8 z-[100] transition-all duration-700 ease-in-out transform ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
        } hidden lg:block`}
      >
        <Link 
          to="/marketplace"
          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-red-600 text-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] transition-colors shadow-xl"
        >
          Post your ad with us
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* Main Floating Ad Card */}
      <div
        className={`fixed bottom-8 right-8 z-[100] w-80 transition-all duration-700 ease-in-out transform ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
        } hidden lg:block cursor-pointer group`}
        onClick={() => setIsExpanded(true)}
      >
        <div className="relative bg-white rounded-none overflow-hidden shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 flex flex-col">
          
          {/* Section Close Button (Card dismissal) */}
          <button
            onClick={handleDismiss}
            className="absolute top-0 right-0 z-30 p-2 bg-black text-white hover:bg-red-600 transition-colors"
            aria-label="Dismiss advertisement"
          >
            <X size={16} />
          </button>

          {/* Sponsored Label */}
          <div className="absolute top-4 left-4 z-20">
            <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-sm border border-gray-100">
              <Megaphone size={10} className="text-red-600" />
              Sponsored
            </span>
          </div>

          {/* Slideshow Content */}
          <div className="relative h-56 w-full bg-gray-50 overflow-hidden">
            <div 
              className="flex h-full w-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {ads.map((ad) => (
                <div key={ad.id} className="relative h-full w-full shrink-0">
                  <img
                    src={ad.image_url?.startsWith("http") ? ad.image_url : `${IMAGE_BASE_URL}${ad.image_url}`}
                    alt="Advertisement"
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle hover overlay to indicate clickability */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors border-2 border-transparent group-hover:border-red-600/30" />
                </div>
              ))}
            </div>
            
            {/* Slideshow Progress Dots */}
            {ads.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                {ads.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1 transition-all duration-300 ${idx === currentIndex ? "w-4 bg-red-600" : "w-1 bg-white/50"}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FloatingAdvertisement;
