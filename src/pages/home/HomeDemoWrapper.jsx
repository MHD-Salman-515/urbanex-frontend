import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HomeDemoFooter from "../../components/home/HomeDemoFooter.jsx";
import HomeRadialProperties from "../../components/home/HomeRadialProperties";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import ExplainTraceCard from "@/components/ui/ExplainTraceCard";
import { getFeaturedProperty } from "@/api/heroApi";

const cityImages = {
  Damascus: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  "Rif Damascus": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
  Aleppo: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c",
};

const cities = ["Damascus", "Rif Damascus", "Aleppo"];

export default function HomeDemoWrapper() {
  const [loadingHero, setLoadingHero] = useState(true);
  const [heroData, setHeroData] = useState({
    title: "Urbanex Real Estate",
    city: "Damascus",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
    background: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    description: "",
    explain: null,
  });

  useEffect(() => {
    const loadHero = async () => {
      try {
        setLoadingHero(true);
        const property = await getFeaturedProperty();
        if (!property) return;

        const media =
          property.image_url ||
          property.image ||
          property.thumbnail ||
          cityImages.Damascus;
        const nextCity = property.city || "Damascus";
        const fallbackExplain = {
          inputs: {
            area: property.area_m2 ?? property.area ?? null,
            price: property.price_usd ?? property.price ?? null,
          },
          confidence: 0.85,
          steps: [
            "Compared with market average",
            "Matched similar properties",
            "Adjusted for location demand",
          ],
        };

        setHeroData({
          title: property.title || "Luxury Property",
          city: nextCity,
          image: media,
          background: media,
          description: property.description || "",
          explain: property.explain_trace || fallbackExplain,
        });
      } catch (err) {
        console.error("Hero load failed", err);
      } finally {
        setTimeout(() => setLoadingHero(false), 500);
      }
    };

    loadHero();
  }, []);

  useEffect(() => {
    if (!heroData.city) return;
    setHeroData((prev) => {
      const nextBg = cityImages[prev.city] || prev.background;
      if (nextBg === prev.background) return prev;
      return { ...prev, background: nextBg };
    });
  }, [heroData.city]);

  useEffect(() => {
    const handler = (e) => {
      const detail = e?.detail || {};
      setHeroData((prev) => ({
        ...prev,
        city: detail.city || prev.city,
        title: detail.title || prev.title,
      }));
    };

    window.addEventListener("updateHero", handler);
    return () => window.removeEventListener("updateHero", handler);
  }, []);

  if (loadingHero) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white">
        <div className="animate-pulse text-xl tracking-wide">Loading premium property...</div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen overflow-x-hidden bg-black text-white transition-opacity duration-700 ${
        loadingHero ? "opacity-50 blur-sm" : "opacity-100"
      }`}
    >
      <div className="urbanex-theme relative min-h-screen bg-black w-full">
        <main className="relative z-10 w-full">
          <section className="relative w-full">
            <div className="absolute top-24 left-4 z-50 flex gap-2">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => setHeroData((prev) => ({ ...prev, city }))}
                  className={`rounded px-3 py-1 text-sm text-white transition ${
                    heroData.city === city ? "bg-white/35" : "bg-white/20 hover:bg-white/30"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>

            <ScrollExpandMedia
              mediaType="image"
              mediaSrc={heroData.image}
              bgImageSrc={heroData.background}
              title={heroData.title}
              date={heroData.city}
              scrollToExpand="Scroll to Explore"
              textBlend
            >
              <div className="mx-auto max-w-xl text-center text-white">
                <p className="mb-6 text-base text-white/85">
                  {heroData.description || "Discover premium properties with smart Urbanex insights."}
                </p>
                <ExplainTraceCard explain={heroData.explain} />
                <Link
                  to="/properties"
                  className="mt-5 inline-flex rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  View Property
                </Link>
              </div>
            </ScrollExpandMedia>
          </section>

          <section className="w-full">
            <HomeRadialProperties />
          </section>
        </main>

        <HomeDemoFooter />
      </div>
    </div>
  );
}
