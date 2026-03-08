import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Clock,
  Shield,
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

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrevImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length,
    );
  };

  return (
    <section
      id={id}
      className="relative h-screen flex items-center justify-center bg-neutral-50 p-4 sm:p-6 lg:p-8"
    >
      <div className="w-full h-full max-w-7xl">
        {/* Styled Image Container */}
        <div className="relative w-full h-full overflow-hidden rounded-3xl border-4 border-white shadow-2xl ring-1 ring-black/5">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? "opacity-100" : "opacity-0"
                }`}
            >
              <img
                src={image}
                alt={`Car wash service ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}

          {/* Navigation Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Buttons (Enable pointer events) */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4">
              <button
                onClick={goToPrevImage}
                className="pointer-events-auto h-12 w-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-800 hover:bg-white hover:text-primary transition-all duration-300 transform hover:scale-110 active:scale-95"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={goToNextImage}
                className="pointer-events-auto h-12 w-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-800 hover:bg-white hover:text-primary transition-all duration-300 transform hover:scale-110 active:scale-95"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-auto">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2.5 rounded-full transition-all duration-500 shadow-sm ${index === currentImageIndex
                    ? "bg-white w-8 scale-110"
                    : "bg-white/60 w-2.5 hover:bg-white/80"
                    }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
