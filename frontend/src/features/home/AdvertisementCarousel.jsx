import React, { useState, useEffect } from "react";
import advertisementService from "../../services/advertisement.service";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AdvertisementCarousel = () => {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await advertisementService.getAds();
        setAds(response.data);
      } catch (error) {
        console.error("Failed to fetch ads", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [ads]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  if (loading || ads.length === 0) return null;

  return (
    <div className="relative w-full bg-zinc-950 py-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative h-[300px] md:h-[450px] w-full rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
          {ads.map((ad, index) => (
            <div
              key={ad.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <img
                src={`${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}${ad.image_url}`}
                alt={ad.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 md:p-10">
                <h2 className="text-white text-2xl md:text-4xl font-bold mb-2">{ad.title}</h2>
                {ad.client_name && (
                  <p className="text-zinc-300 text-sm md:text-lg">
                    Sponsored by <span className="text-red-500 font-semibold">{ad.client_name}</span>
                  </p>
                )}
              </div>
            </div>
          ))}

          {ads.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-red-600 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-red-600 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                {ads.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? "bg-red-600 w-4" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvertisementCarousel;
