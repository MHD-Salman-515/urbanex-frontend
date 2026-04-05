import { useEffect, useState } from "react";
import HomeDemoFooter from "../../components/home/HomeDemoFooter.jsx";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import { getFeaturedProperty } from "@/api/heroApi";

const cityImages = {
  Damascus: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  "Rif Damascus": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
  Aleppo: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c",
};

const cities = ["Damascus", "Rif Damascus", "Aleppo"];
const demoProperties = [
  {
    id: 1,
    title: "Luxury Apartment Damascus",
    city: "Damascus",
    price_usd: 120000,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  },
  {
    id: 2,
    title: "Modern Villa",
    city: "Rif Damascus",
    price_usd: 250000,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
  },
  {
    id: 3,
    title: "City Apartment",
    city: "Aleppo",
    price_usd: 90000,
    image: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c",
  },
];

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
      <div className="flex h-screen w-full items-center justify-center bg-[#0B0F19] text-white/90">
        <div className="animate-pulse text-xl tracking-wide">Loading premium property...</div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen overflow-x-hidden bg-[#0B0F19] text-white/90 transition-opacity duration-700 ${
        loadingHero ? "opacity-50 blur-sm" : "opacity-100"
      }`}
    >
      <div className="urbanex-theme relative min-h-screen w-full bg-[#0B0F19]">
        <main className="relative z-10 w-full">
          <section className="relative w-full">
            <div className="absolute top-24 left-4 z-50 flex gap-2">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => setHeroData((prev) => ({ ...prev, city }))}
                  className={`rounded px-3 py-1 text-sm text-white/90 transition ${
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
              <div className="mx-auto max-w-4xl space-y-10 text-center">
                <div>
                  <h2 className="mb-4 text-3xl font-bold">Quick Search</h2>
                  <input
                    placeholder="Search properties..."
                    className="w-72 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white"
                  />
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                  <button className="rounded bg-white/5 px-4 py-2 text-white">Properties</button>
                  <button className="rounded bg-white/5 px-4 py-2 text-white">Services</button>
                  <button className="rounded bg-white/5 px-4 py-2 text-white">Contact</button>
                </div>

                <p className="text-white/80">
                  Urbanex is an AI-powered real estate platform that helps you explore, analyze,
                  and invest in premium properties.
                </p>

                <button
                  onClick={() =>
                    window.scrollTo({ top: window.innerHeight * 1.2, behavior: "smooth" })
                  }
                  className="rounded-lg bg-white/5 px-6 py-2 text-white"
                >
                  Explore Properties
                </button>
              </div>
            </ScrollExpandMedia>
          </section>

          <section className="bg-[#0B0F19] py-24 text-center text-white/90">
            <div className="mx-auto max-w-4xl space-y-6 px-4">
              <h2 className="text-4xl font-bold tracking-wide">
                Urbanex — رؤية جديدة للسوق العقاري
              </h2>

              <p className="text-lg leading-relaxed text-white/80">
                ليست مجرد منصة عقارية، بل نظام تحليلي متكامل يعيد تعريف طريقة فهم السوق.
                Urbanex تجمع بين البيانات، التحليل، والتجربة البصرية لتقديم نظرة دقيقة
                وواضحة عن قيمة العقار وموقعه ضمن حركة السوق.
              </p>

              <p className="text-lg text-white/60">
                كل قرار هنا مبني على منطق، كل توصية مدعومة ببيانات،
                وكل واجهة مصممة لتمنحك تجربة احترافية تليق برؤيتك.
              </p>
            </div>
          </section>

          <section className="bg-[#0B0F19] py-20 text-white">
            <div className="mx-auto max-w-6xl px-4">
              <h2 className="mb-10 text-center text-3xl font-bold">أبرز العقارات</h2>

              <div className="grid gap-6 md:grid-cols-3">
                {demoProperties.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="group overflow-hidden rounded-xl bg-white/5 backdrop-blur transition duration-500 hover:scale-105"
                  >
                    <img
                      src={p.image}
                      alt={p.title}
                      className="h-48 w-full object-cover transition duration-500 group-hover:brightness-110"
                    />

                    <div className="p-4">
                      <h3 className="font-bold">{p.title}</h3>
                      <p className="text-sm text-white/60">{p.city}</p>
                      <p className="font-bold text-[#00E5A8]">${p.price_usd}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <HomeDemoFooter />
      </div>
    </div>
  );
}
