import React from "react";
import { Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";

const VideoCard = React.memo(({ src, id }) => (
  <div className="relative w-full rounded-2xl overflow-hidden border border-gray-100 shadow-xl bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-red-200">
    <div className="aspect-[9/16] w-full">
      <iframe
        name={`fb-video-${id}`}
        src={src}
        className="w-full h-full border-none overflow-hidden"
        scrolling="no"
        frameBorder="0"
        allowFullScreen={true}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        title={`Service Video Showcase ${id}`}
      ></iframe>
    </div>
  </div>
));

const videoSources = [
  "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fweb.facebook.com%2Freel%2F1260799399579681%2F&show_text=false&width=267&t=0&mute=1",
  "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fweb.facebook.com%2Freel%2F919270604201389%2F&show_text=false&width=267&t=0&mute=1",
  "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fweb.facebook.com%2Freel%2F961691629714952%2F&show_text=false&width=267&t=0&mute=1",
];

const VideoPlayer = ({ id }) => {
  return (
    <section id={id} className="py-24 bg-gray-50/50">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        {/* Section Header */}
        <div className="mb-16">
          <div className="h-[1px] w-12 bg-red-600 mb-6"></div>
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight uppercase tracking-tighter mb-4">
            Watch Us in Action
          </h2>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {videoSources.map((src, index) => (
            <VideoCard key={index} id={index} src={src} />
          ))}
        </div>

        {/* Follow CTA */}
        <div className="mt-16 flex flex-col items-center gap-6">
          <a
            href="https://www.facebook.com/share/18G7HJWpik/"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Button
              size="lg"
              className="bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold rounded-xl shadow-lg h-14 px-8 transition-all duration-300 group-hover:scale-105 flex items-center gap-3"
            >
              <Facebook className="h-6 w-6 fill-current" />
              Follow Us on Facebook
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default VideoPlayer;
