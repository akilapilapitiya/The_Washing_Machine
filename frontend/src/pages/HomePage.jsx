import React from "react";
import HeroSection from "../features/home/HeroSection";
import PartnerSection from "../features/home/PartnerSection";
import ServicesSection from "../features/home/ServicesSection";
import AdvertisementCarousel from "../features/home/AdvertisementCarousel";
import Footer from "../features/home/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection id="home" />
      <AdvertisementCarousel />
      <PartnerSection id="partners" />
      <ServicesSection id="services" />
      <Footer id="contact" />
    </div>
  );
};

export default HomePage;
