import React from "react";
import { Star, Users, Award, TrendingUp } from "lucide-react";

const BrandSection = () => {
  const stats = [
    {
      icon: Users,
      number: "10,000+",
      label: "Happy Customers",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Star,
      number: "4.9/5",
      label: "Average Rating",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      icon: Award,
      number: "15+",
      label: "Years Experience",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: TrendingUp,
      number: "50,000+",
      label: "Cars Washed",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Thousands of Car Owners
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our community of satisfied customers who trust us with their
            vehicles. Excellence in every wash, every time.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-300"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 ${stat.bgColor} rounded-full mb-4`}
                >
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm lg:text-base text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-700">
                ✓ Eco-Friendly Products
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-700">
                ✓ Professional Team
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-700">
                ✓ Money-Back Guarantee
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-700">
                ✓ 24/7 Support
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandSection;
