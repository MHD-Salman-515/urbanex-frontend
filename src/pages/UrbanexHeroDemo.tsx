import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";

export default function UrbanexHeroDemo() {
  return (
    <div className="min-h-screen bg-black">
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"
        bgImageSrc="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
        title="Luxury Real Estate"
        date="Urbanex Premium"
        scrollToExpand="Scroll to Explore Properties"
        textBlend
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold text-white">Discover Premium Properties</h2>

          <p className="mb-6 text-lg text-white/80">
            Explore high-end real estate listings with AI-powered insights and smart pricing.
          </p>

          <p className="text-lg text-white/80">
            Urbanex helps you find the perfect property with advanced analytics and modern UI
            experience.
          </p>
        </div>
      </ScrollExpandMedia>
    </div>
  );
}
