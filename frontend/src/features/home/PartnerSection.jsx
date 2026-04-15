import React from "react";
import logo3M from "../../assets/partnerSection/3m.png";
import logoAutoGlym from "../../assets/partnerSection/autoglym.png";
import logoCastrol from "../../assets/partnerSection/castrol.svg";
import logoChemicalGuys from "../../assets/partnerSection/chemical-guys.png";
import logoLukoil from "../../assets/partnerSection/lukoil.png";
import logoMeguiars from "../../assets/partnerSection/meguiars.png";
import logoMobil from "../../assets/partnerSection/mobil.jpeg";
import logoNipponPaint from "../../assets/partnerSection/nippon-paint.png";
import logoSikkens from "../../assets/partnerSection/sikkens.jpeg";
import logoValvoline from "../../assets/partnerSection/valvoline.png";
import logoWilita from "../../assets/partnerSection/wilita.jpeg";
import logoWurth from "../../assets/partnerSection/wurth.png";

const PartnerSection = ({ id }) => {
  const partners = [
    { name: "3M", logo: logo3M },
    { name: "AutoGlym", logo: logoAutoGlym },
    { name: "Castrol", logo: logoCastrol },
    { name: "Chemical Guys", logo: logoChemicalGuys },
    { name: "Lukoil", logo: logoLukoil },
    { name: "Meguiars", logo: logoMeguiars },
    { name: "Mobil", logo: logoMobil },
    { name: "Nippon Paint", logo: logoNipponPaint },
    { name: "Sikkens", logo: logoSikkens },
    { name: "Valvoline", logo: logoValvoline },
    { name: "Wilita", logo: logoWilita },
    { name: "Wurth", logo: logoWurth },
  ];

  return (
    <section id={id} className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 flex flex-col items-center">
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
            Our Trusted Partners
          </h2>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-6 bg-white rounded-lg border border-gray-200 hover:border-red-400 hover:shadow-lg transition-all duration-300 group"
            >
              <img
                loading="lazy"
                src={partner.logo}
                alt={partner.name}
                className="max-h-20 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
              />
            </div>
          ))}
        </div>

        {/* Partnership Info */}
        <div className="mt-20 pt-12 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            <div className="text-center">
              <div className="text-4xl font-black text-red-600 mb-2">12+</div>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-400">
                Premium Partners
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-red-600 mb-2">100%</div>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-400">
                Quality Assurance
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-red-600 mb-2">
                Expert
              </div>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-400">
                Professional Brands
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerSection;
