import React from "react";
import HeroSection from "../features/home/HeroSection";
import BrandSection from "../features/home/BrandSection";
import ServicesSection from "../features/home/ServicesSection";
import Footer from "../features/home/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection />
      <BrandSection />
      <ServicesSection />
      <Footer />
    </div>
  );
};

export default HomePage;
