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
      className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-20 lg:pt-0"
    >
      {/* Full Background Slideshow */}
      <div className="absolute inset-0 w-full h-full z-0 bg-black overflow-hidden">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
              index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={image}
              alt={`Background ${index + 1}`}
              className={`h-full w-full object-cover blur-[4px] transition-transform duration-[6000ms] ease-linear ${
                index === currentImageIndex ? "scale-110" : "scale-105"
              }`}
            />
            {/* Dark overlay to highlight text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/50 z-20"></div>
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10 text-center flex flex-col items-center">
        
        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6">
          Unleash the <br className="hidden sm:block" />
          <span className="text-red-500">Shine</span> Your Car Deserves.
        </h1>

        {/* Subhead */}
        <p className="text-lg sm:text-xl text-gray-300 font-medium leading-relaxed max-w-2xl mb-10">
          Experience meticulous car care delivered by experts. We combine
          cutting-edge tech with premium products to restore your vehicle's
          showroom glory.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
          <Button
            asChild
            size="lg"
            className="h-14 px-8 bg-red-600 hover:bg-red-700 text-white text-base lg:text-lg font-bold shadow-2xl transition-all duration-300 group rounded-xl"
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
            className="h-14 px-8 text-base lg:text-lg font-bold border-2 border-white/20 text-white hover:bg-white hover:text-gray-900 transition-all duration-300 bg-white/5 backdrop-blur-md shadow-2xl rounded-xl"
          >
            <a href="#services">Explore Services</a>
          </Button>
        </div>
      </div>

      {/* Image Navigation Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${
              index === currentImageIndex
                ? "bg-red-500 w-10 opacity-100"
                : "bg-white/40 w-2 opacity-100 hover:bg-white"
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
