import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import advertisementService from "../../services/advertisement.service";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Megaphone,
  Pause,
  PhoneCall,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IMAGE_BASE_URL } from "@/configs/env";

const AUTO_ADVANCE_MS = 6500;

const normalizeAds = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const sortAdsForSpotlight = (ads) => {
  return [...ads].sort((a, b) => {
    const aExpiry = a.expiry_date
      ? new Date(a.expiry_date).getTime()
      : Number.POSITIVE_INFINITY;
    const bExpiry = b.expiry_date
      ? new Date(b.expiry_date).getTime()
      : Number.POSITIVE_INFINITY;

    if (aExpiry !== bExpiry) return aExpiry - bExpiry;

    const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bCreated - aCreated;
  });
};

const buildImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (String(imagePath).startsWith("http")) return imagePath;
  return `${IMAGE_BASE_URL}${imagePath}`;
};

const getExpiryMeta = (expiryDate) => {
  if (!expiryDate) return null;

  const end = new Date(expiryDate);
  if (Number.isNaN(end.getTime())) return null;

  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Expired";
  if (diffDays === 0) return "Ends today";
  if (diffDays === 1) return "Ends tomorrow";
  return `${diffDays} days left`;
};

const formatContactHref = (contact) => {
  const normalized = String(contact || "").replace(/[^\d+]/g, "");
  return normalized;
};

const AdvertisementCarousel = () => {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await advertisementService.getAds();
        setAds(normalizeAds(response));
      } catch (error) {
        console.error("Failed to fetch ads", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  const spotlightAds = useMemo(() => sortAdsForSpotlight(ads), [ads]);

  useEffect(() => {
    if (currentIndex >= spotlightAds.length) {
      setCurrentIndex(0);
      setProgress(0);
    }
  }, [currentIndex, spotlightAds.length]);

  useEffect(() => {
    if (spotlightAds.length <= 1 || isPaused) {
      return undefined;
    }

    const startedAt = Date.now();
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextProgress = Math.min((elapsed / AUTO_ADVANCE_MS) * 100, 100);
      setProgress(nextProgress);

      if (elapsed >= AUTO_ADVANCE_MS) {
        setCurrentIndex((prev) => (prev + 1) % spotlightAds.length);
        setProgress(0);
      }
    }, 90);

    return () => clearInterval(progressTimer);
  }, [currentIndex, isPaused, spotlightAds.length]);

  const nextSlide = () => {
    if (!spotlightAds.length) return;
    setCurrentIndex((prev) => (prev + 1) % spotlightAds.length);
    setProgress(0);
  };

  const prevSlide = () => {
    if (!spotlightAds.length) return;
    setCurrentIndex(
      (prev) => (prev - 1 + spotlightAds.length) % spotlightAds.length,
    );
    setProgress(0);
  };

  const selectSlide = (index) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  if (loading || spotlightAds.length === 0) return null;

  const activeAd = spotlightAds[currentIndex];
  const expiryMeta = getExpiryMeta(activeAd?.expiry_date);
  const contactHref = formatContactHref(activeAd?.client_contact);
  const canCallAdvertiser = Boolean(contactHref);

  return (
    <section className="relative w-full py-20 lg:py-32 overflow-hidden flex items-center justify-center">
      {/* Ambient Blurred Background */}
      <div className="absolute inset-0 w-full h-full z-0 bg-black overflow-hidden">
        {spotlightAds.map((ad, index) => (
          <div
            key={`bg-${ad.id}`}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
              index === currentIndex ? "opacity-50 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={buildImageUrl(ad.image_url)}
              alt=""
              className="h-full w-full object-cover blur-[40px] scale-110"
            />
          </div>
        ))}
        {/* Extra dimming for contrast */}
        <div className="absolute inset-0 bg-black/20 z-20"></div>
      </div>

      <div className="relative z-30 w-full max-w-5xl mx-auto px-4">
        <div
          className="relative rounded-3xl overflow-hidden border-4 border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] bg-black/40 flex flex-col"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Main Ad Poster wrapper */}
          <div className="relative h-[450px] md:h-[600px] w-full shrink-0">
            {spotlightAds.map((ad, index) => {
              const itemExpiryMeta = getExpiryMeta(ad.expiry_date);
              return (
                <div
                  key={`fg-${ad.id}`}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <img
                    loading="lazy"
                    src={buildImageUrl(ad.image_url)}
                    alt="Advertisement"
                    className="h-full w-full object-cover"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                  <div className="absolute top-6 left-6 right-6 flex items-start justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-gray-900 shadow-sm">
                      <Megaphone size={14} />
                      Sponsored
                    </span>

                    {itemExpiryMeta ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm">
                        <Clock3 size={14} />
                        {itemExpiryMeta}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {/* Controls */}
            {spotlightAds.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-white hover:text-black shadow-lg transition-all border border-white/20"
                  aria-label="Previous advertisement"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-white hover:text-black shadow-lg transition-all border border-white/20"
                  aria-label="Next advertisement"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            ) : null}

            {/* Progress bar inside poster */}
            {spotlightAds.length > 1 ? (
              <div className="absolute left-0 right-0 bottom-0 h-1.5 bg-black/30 z-20">
                <div
                  className="h-full bg-red-500 transition-[width] duration-100 ease-linear shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            ) : null}
          </div>

          <div className="p-4 bg-white/10 backdrop-blur-2xl flex justify-center items-center border-t border-white/10 z-30">
            <Button
              asChild
              className="bg-red-600 hover:bg-red-700 rounded-xl font-bold shadow-lg px-10 h-12 text-white"
            >
              <Link to="/marketplace">
                Post Your Ad With Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdvertisementCarousel;
