import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
          <section className="relative min-h-screen w-full">
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
                    className="w-full rounded-xl bg-white/10 p-4 text-white placeholder-white/50 outline-none"
                  />
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                  <button
                    onClick={() => navigate("/properties")}
                    className="rounded-xl bg-[#00E5A8] px-6 py-3 font-bold text-black transition hover:scale-105"
                  >
                    Properties
                  </button>
                  <button
                    onClick={() => navigate("/services")}
                    className="rounded-xl border border-white/30 px-6 py-3 text-white transition hover:bg-white/10"
                  >
                    Services
                  </button>
                  <button
                    onClick={() => navigate("/contact")}
                    className="rounded-xl border border-white/30 px-6 py-3 text-white transition hover:bg-white/10"
                  >
                    Contact
                  </button>
                </div>

                <p className="text-white drop-shadow-lg">
                  Urbanex is an AI-powered real estate platform that helps you explore, analyze,
                  and invest in premium properties.
                </p>

                <button
                  onClick={() =>
                    window.scrollTo({ top: window.innerHeight * 1.2, behavior: "smooth" })
                  }
                  className="rounded-xl border border-white/30 px-6 py-3 text-white transition hover:bg-white/10"
                >
                  Explore Properties
                </button>
              </div>
            </ScrollExpandMedia>
          </section>

          <section className="py-24 bg-[#0B0F19] text-white text-center">
            <div className="max-w-5xl mx-auto space-y-6 px-4">
              <h2 className="text-4xl font-bold">لماذا Urbanex؟</h2>

              <p className="text-lg text-white/80 leading-relaxed">
                Urbanex تقدم تجربة عقارية متكاملة تجمع بين البساطة، التحليل، والوضوح.
                من البحث إلى اتخاذ القرار، كل خطوة مصممة لتكون دقيقة وسهلة.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mt-10">
                <div className="bg-white/5 p-6 rounded-xl backdrop-blur">
                  <h3 className="text-xl font-bold text-[#00E5A8]">تحليل ذكي</h3>
                  <p className="text-white/70 mt-2">فهم حقيقي للسوق</p>
                </div>

                <div className="bg-white/5 p-6 rounded-xl backdrop-blur">
                  <h3 className="text-xl font-bold text-[#00E5A8]">واجهة سهلة</h3>
                  <p className="text-white/70 mt-2">تجربة استخدام سلسة</p>
                </div>

                <div className="bg-white/5 p-6 rounded-xl backdrop-blur">
                  <h3 className="text-xl font-bold text-[#00E5A8]">نتائج دقيقة</h3>
                  <p className="text-white/70 mt-2">قرارات مبنية على بيانات</p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-20 bg-[#0B0F19] text-white">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-3xl font-bold mb-10 text-center">أبرز العقارات</h2>

              <div className="grid md:grid-cols-3 gap-6">
                {demoProperties.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="group bg-white/5 backdrop-blur rounded-xl overflow-hidden hover:scale-105 transition duration-500"
                  >
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-48 object-cover group-hover:brightness-110"
                    />

                    <div className="p-4">
                      <h3 className="font-bold">{p.title}</h3>
                      <p className="text-sm text-white/60">{p.city}</p>
                      <p className="text-[#00E5A8] font-bold">${p.price_usd}</p>
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
