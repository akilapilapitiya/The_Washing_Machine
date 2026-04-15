import React from "react";
import HeroSection from "../features/home/HeroSection";
import PartnerSection from "../features/home/PartnerSection";
import ServicesSection from "../features/home/ServicesSection";
import VideoPlayer from "../features/home/VideoPlayer";
import FloatingAdvertisement from "../features/home/FloatingAdvertisement";
import Footer from "../features/home/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <HeroSection id="home" />
      <ServicesSection id="services" />
      <VideoPlayer id="videos" />
      <PartnerSection id="partners" />
      <Footer id="contact" />
      
      {/* Floating UI Elements */}
      <FloatingAdvertisement />
    </div>
  );
};

export default HomePage;
