import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import advertisementService from "../../services/advertisement.service";
import { X, Megaphone, ArrowRight, ExternalLink } from "lucide-react";
import { IMAGE_BASE_URL } from "@/configs/env";

const AUTO_ADVANCE_MS = 6000;

const FloatingAdvertisement = () => {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAutoHidden, setIsAutoHidden] = useState(true); // Hidden on Hero by default
  const [isDismissed, setIsDismissed] = useState(false);

  // Visibility Tracking (Hide on Hero and Footer)
  useEffect(() => {
    const handleScroll = () => {
      const homeSection = document.querySelector("#home");
      const contactSection = document.querySelector("#contact");
      
      if (!homeSection || !contactSection) return;

      const homeRect = homeSection.getBoundingClientRect();
      const contactRect = contactSection.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Logic: Hide if Hero part is in view OR Footer part is in view
      const isHeroVisible = homeRect.bottom > 100; // Still seeing some hero
      const isFooterVisible = contactRect.top < viewportHeight - 100; // Footer started appearing

      setIsAutoHidden(isHeroVisible || isFooterVisible);
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch Ads
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

  // Slideshow logic
  useEffect(() => {
    if (ads.length <= 1 || isDismissed || isExpanded) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(timer);
  }, [ads.length, isDismissed, isExpanded]);

  if (loading || ads.length === 0 || isDismissed) return null;

  const activeAd = ads[currentIndex];
  
  // Logic to determine if we show the ad
  const showAd = !isAutoHidden && !isDismissed;

  return (
    <>
      {/* Fullscreen Popup Modal */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300"
          onClick={() => setIsExpanded(false)}
        >
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-10 right-10 text-white hover:text-red-500 transition-colors"
          >
            <X size={32} />
          </button>
          
          <div 
            className="relative max-w-5xl max-h-[90vh] flex items-center justify-center animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeAd.image_url?.startsWith("http") ? activeAd.image_url : `${IMAGE_BASE_URL}${activeAd.image_url}`}
              alt="Full advertisement"
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Unified Floating Ad Toast */}
      <div 
        className={`fixed bottom-10 right-8 z-[150] w-72 transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) transform ${
          showAd ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        } hidden md:block`}
      >
        <div className="relative group bg-white/90 backdrop-blur-lg border border-white/20 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-black/5">
          
          {/* Dismiss Button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-3 right-3 z-30 p-1.5 bg-gray-100/50 hover:bg-red-500 hover:text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
          >
            <X size={14} />
          </button>

          {/* Sponsored Badge */}
          <div className="absolute top-3 left-4 z-20">
            <span className="flex items-center gap-1.5 py-1 px-3 bg-white/90 rounded-full text-[9px] font-bold uppercase tracking-widest text-gray-900 border border-gray-100 shadow-sm">
              <Megaphone size={10} className="text-red-600" />
              Sponsored
            </span>
          </div>

          {/* Ad Content */}
          <div 
            className="cursor-pointer relative overflow-hidden h-44 bg-gray-50"
            onClick={() => setIsExpanded(true)}
          >
            <div 
              className="flex h-full w-full transition-transform duration-1000 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {ads.map((ad) => (
                <div key={ad.id} className="relative h-full w-full shrink-0">
                  <img
                    src={ad.image_url?.startsWith("http") ? ad.image_url : `${IMAGE_BASE_URL}${ad.image_url}`}
                    alt="Advertisement"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
            
            {/* Progress Indicators */}
            {ads.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {ads.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-0.5 transition-all duration-300 ${idx === currentIndex ? "w-4 bg-red-600" : "w-1 bg-white/50"}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Attached CTA: Post your ad with us */}
          <div className="p-4 bg-white/50 border-t border-gray-100">
            <Link 
              to="/marketplace" 
              className="flex items-center justify-between group/btn bg-gray-900 hover:bg-red-600 text-white px-4 py-2.5 rounded-2xl transition-all duration-300"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider leading-none mb-0.5">Advertise Here</span>
                <span className="text-[9px] text-gray-400 font-medium leading-none group-hover/btn:text-white/80">Post your ad with us</span>
              </div>
              <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
      </div>
    </>
  );
};

export default FloatingAdvertisement;
