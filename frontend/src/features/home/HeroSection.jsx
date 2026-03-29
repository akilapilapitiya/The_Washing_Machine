import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Clock,
  Shield,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Import hero section images
import image1 from "@/assets/heroSection/image1.jpg";
import image2 from "@/assets/heroSection/image2.jpg";
import image3 from "@/assets/heroSection/image3.jpg";
import image4 from "@/assets/heroSection/image4.jpg";
import image5 from "@/assets/heroSection/image5.jpg";
import image6 from "@/assets/heroSection/image6.jpg";

const HeroSection = ({ id }) => {
  const images = [image1, image2, image3, image4, image5, image6];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-advance slideshow every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section
      id={id}
      className="relative min-h-screen flex items-center bg-gradient-to-br from-neutral-50 to-gray-100 overflow-hidden pt-24 pb-16 lg:pt-0"
    >
      {/* Clean Background */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-gradient-to-br from-white to-gray-50/50"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Side: Typography & CTA */}
          <div className="space-y-8 max-w-2xl px-2 lg:px-0">
            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight">
              Unleash the <br className="hidden sm:block" />
              <span className="text-red-600">Shine</span> Your Car Deserves.
            </h1>

            {/* Subhead */}
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl">
              Experience meticulous car care delivered by experts. We combine
              cutting-edge tech with premium products to restore your vehicle's
              showroom glory.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                asChild
                size="lg"
                className="h-14 px-8 bg-red-600 hover:bg-red-700 text-white text-lg font-semibold shadow-sm transition-all group"
              >
                <Link to="/dashboard/book">
                  Book Service Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 px-8 text-lg font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all bg-white shadow-sm"
              >
                <a href="#services">Explore Services</a>
              </Button>
            </div>
          </div>

          {/* Right Side: Dynamic Visual / Slideshow */}
          <div className="relative w-full aspect-square lg:aspect-[4/5] max-w-md mx-auto lg:ml-auto mt-12 lg:mt-0">
            {/* Main Image Slideshow Container */}
            <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-gray-200 bg-gray-100">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                    index === currentImageIndex
                      ? "opacity-100 scale-105"
                      : "opacity-0 scale-100"
                  }`}
                >
                  <img
                    src={image}
                    alt={`Car wash service ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {/* Subtle vignette gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-900/10 to-transparent"></div>
                </div>
              ))}

              {/* Image Navigation Dots inside container */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${
                      index === currentImageIndex
                        ? "bg-white w-6 opacity-100"
                        : "bg-white/50 w-1.5 opacity-70 hover:opacity-100 hover:bg-white"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Floating Card */}
            <div className="absolute -right-4 sm:-right-8 bottom-24 bg-white rounded-xl p-4 shadow-lg border border-gray-100 transition-transform duration-500 hover:-translate-y-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">
                    Fast Service
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    Under 45 Mins
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
