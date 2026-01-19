import React from "react";
import HeroSection from "../features/home/HeroSection";
import PartnerSection from "../features/home/PartnerSection";
import ServicesSection from "../features/home/ServicesSection";
import Footer from "../features/home/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection />
      <PartnerSection />
      <ServicesSection />
      <Footer />
    </div>
  );
};

export default HomePage;
