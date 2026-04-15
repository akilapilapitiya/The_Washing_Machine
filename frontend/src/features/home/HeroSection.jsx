import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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

  // Auto-advance slideshow every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section
      id={id}
      className="relative h-screen min-h-[700px] w-full flex items-center overflow-hidden bg-black"
    >
      {/* Cinematic Background Canvas */}
      <div className="absolute inset-0 z-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out transform ${
              index === currentImageIndex
                ? "opacity-100 scale-100 z-10"
                : "opacity-0 scale-105 z-0"
            }`}
          >
            <img
              src={image}
              alt={`Exhibition ${index + 1}`}
              className="h-full w-full object-cover"
            />
            {/* Architectural Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-20"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-20"></div>
          </div>
        ))}
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-30 flex flex-col items-start pt-20">
        {/* Top Accent Bar */}
        <div className="h-1 w-12 bg-red-600 mb-8 animate-in slide-in-from-left duration-700"></div>

        {/* Monolithic Typography */}
        <div className="max-w-5xl">
          <h1 className="text-6xl sm:text-7xl lg:text-9xl font-black text-white leading-[0.85] tracking-tighter mb-8 uppercase animate-in fade-in slide-in-from-bottom-10 duration-700 ease-out">
            Precision <br />
            Performance <br />
            Perfection.
          </h1>

          {/* Boutique Call to Action */}
          <div className="flex animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <Button
              asChild
              className="h-16 px-12 bg-red-600 hover:bg-red-700 text-white text-lg font-black rounded-none shadow-[0_20px_50px_rgba(220,38,38,0.3)] transition-all group border-none uppercase tracking-[0.2em]"
            >
              <Link to="/dashboard/book">
                Book Service
                <ArrowRight className="ml-4 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Side Decorative line */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-40 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>

      {/* Section Transition Gradient (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-white to-transparent z-[25] pointer-events-none"></div>
    </section>
  );
};

export default HeroSection;
