import React from "react";

const PartnerSection = ({ id }) => {
  const getLogoUrl = (path) => {
    // path starts with /src/assets/...
    const fileName = path.split('/').pop();
    return new URL(`../../assets/partnerSection/${fileName}`, import.meta.url).href;
  };

  const partners = [
    { name: "3M", logo: getLogoUrl("/src/assets/partnerSection/3m.png") },
    { name: "AutoGlym", logo: getLogoUrl("/src/assets/partnerSection/autoglym.png") },
    { name: "Castrol", logo: getLogoUrl("/src/assets/partnerSection/castrol.svg") },
    {
      name: "Chemical Guys",
      logo: getLogoUrl("/src/assets/partnerSection/chemical-guys.png"),
    },
    { name: "Lukoil", logo: getLogoUrl("/src/assets/partnerSection/lukoil.png") },
    { name: "Meguiars", logo: getLogoUrl("/src/assets/partnerSection/meguiars.png") },
    { name: "Mobil", logo: getLogoUrl("/src/assets/partnerSection/mobil.jpeg") },
    {
      name: "Nippon Paint",
      logo: getLogoUrl("/src/assets/partnerSection/nippon-paint.png"),
    },
    { name: "Sikkens", logo: getLogoUrl("/src/assets/partnerSection/sikkens.jpeg") },
    { name: "Valvoline", logo: getLogoUrl("/src/assets/partnerSection/valvoline.png") },
    { name: "Wilita", logo: getLogoUrl("/src/assets/partnerSection/wilita.jpeg") },
    { name: "Wurth", logo: getLogoUrl("/src/assets/partnerSection/wurth.png") },
  ];

  return (
    <section id={id} className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Our Trusted Partners
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We partner with industry-leading brands to deliver the highest
            quality vehicle care and services. Your vehicle deserves the best.
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 group"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="max-h-20 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
              />
            </div>
          ))}
        </div>

        {/* Partnership Info */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">12+</div>
              <div className="text-gray-600">Premium Partners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600">Quality Assurance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                Expert
              </div>
              <div className="text-gray-600">Professional Brands</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerSection;
