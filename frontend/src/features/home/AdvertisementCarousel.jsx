import React, { useEffect, useMemo, useState } from "react";
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
    setCurrentIndex((prev) => (prev - 1 + spotlightAds.length) % spotlightAds.length);
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
    <section className="relative w-full py-16 overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-wider font-bold text-red-600">
              Featured Marketplace Ads
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              Discover Trusted Auto Partners
            </h2>
            <p className="text-gray-600 max-w-2xl">
              Mechanics, garages, oil brands, accessories, and vehicle care
              products. Pick any listing to view advertiser details instantly.
            </p>
          </div>
          {spotlightAds.length > 1 ? (
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-sm hover:border-red-200 hover:text-red-700 transition-colors"
            >
              {isPaused ? <Play size={14} /> : <Pause size={14} />}
              {isPaused ? "Resume Autoplay" : "Pause Autoplay"}
            </button>
          ) : null}
        </div>

        <div
          className="relative grid grid-cols-1 lg:grid-cols-12 gap-6"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="lg:col-span-8 rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm flex flex-col">
            <div className="relative h-[250px] md:h-[350px] shrink-0">
              <img loading="lazy"
                src={buildImageUrl(activeAd.image_url)}
                alt={activeAd.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-800 shadow-sm">
                  <Megaphone size={12} />
                  Sponsored Listing
                </span>

                {expiryMeta ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm">
                    <Clock3 size={12} />
                    {expiryMeta}
                  </span>
                ) : null}
              </div>

              {spotlightAds.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/80 text-gray-800 hover:bg-white shadow-sm transition-colors border border-gray-100"
                    aria-label="Previous advertisement"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/80 text-gray-800 hover:bg-white shadow-sm transition-colors border border-gray-100"
                    aria-label="Next advertisement"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              ) : null}

              {spotlightAds.length > 1 ? (
                <div className="absolute left-0 right-0 bottom-0 h-1 bg-black/10">
                  <div
                    className="h-full bg-red-500 transition-[width] duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              ) : null}
            </div>

            <div className="p-6 md:p-8 space-y-4 bg-white flex-1 flex flex-col justify-center">
              <div className="space-y-2">
                <h3 className="text-gray-900 text-2xl md:text-3xl font-bold leading-tight max-w-3xl">
                  {activeAd.title}
                </h3>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-gray-600">
                  {activeAd.client_name ? (
                    <p>
                      Advertiser: <span className="font-semibold text-gray-900">{activeAd.client_name}</span>
                    </p>
                  ) : null}
                  {activeAd.client_contact ? (
                    <p>
                      Contact: <span className="font-semibold text-gray-900">{activeAd.client_contact}</span>
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {canCallAdvertiser ? (
                  <Button asChild className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-sm">
                    <a href={`tel:${contactHref}`}>
                      Contact Advertiser
                      <PhoneCall className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <Button disabled className="bg-red-600/50 text-white font-semibold cursor-not-allowed">
                    Contact Not Shared
                  </Button>
                )}
                <Button asChild variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold shadow-sm">
                  <a href="#contact">
                    Post Your Ad With Us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4">
            {spotlightAds.map((ad, index) => {
              const itemExpiryMeta = getExpiryMeta(ad.expiry_date);

              return (
                <button
                  key={ad.id}
                  type="button"
                  onClick={() => selectSlide(index)}
                  className={`group flex items-center gap-3 rounded-xl border bg-white p-3 text-left transition-all ${
                    index === currentIndex
                      ? "border-red-300 ring-1 ring-red-100 shadow-sm"
                      : "border-gray-200 hover:border-red-200 hover:shadow-sm"
                  }`}
                >
                  <div className="h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-100">
                    <img loading="lazy"
                      src={buildImageUrl(ad.image_url)}
                      alt={ad.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {ad.title}
                    </p>
                    <p className="text-[11px] font-medium text-gray-500 truncate mt-0.5">
                      {ad.client_name || "Auto Partner"}
                    </p>
                    {itemExpiryMeta ? (
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-red-600 mt-1">
                        {itemExpiryMeta}
                      </p>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdvertisementCarousel;
