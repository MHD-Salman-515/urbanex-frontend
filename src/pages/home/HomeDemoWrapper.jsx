import { useEffect, useState } from "react";
import HomeDemoFooter from "../../components/home/HomeDemoFooter.jsx";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import { getFeaturedProperty } from "@/api/heroApi";
import { api, resolveApiAssetUrl } from "@/api/axios";

const cityImages = {
  Damascus: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  "Rif Damascus": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
  Aleppo: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c",
};

const cities = ["Damascus", "Rif Damascus", "Aleppo"];

export default function HomeDemoWrapper() {
  const [loadingHero, setLoadingHero] = useState(true);
  const [properties, setProperties] = useState([]);
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
    let cancelled = false;

    const loadProperties = async () => {
      try {
        const res = await api.get("/properties");
        const raw = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : [];
        if (!cancelled) setProperties(raw);
      } catch (err) {
        console.error("Properties load failed", err);
        if (!cancelled) setProperties([]);
      }
    };

    loadProperties();
    return () => {
      cancelled = true;
    };
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

  const getPropertyImage = (p) =>
    resolveApiAssetUrl(
      p?.image_url ||
        p?.image ||
        p?.thumbnail ||
        p?.images?.[0] ||
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
    );
  const getPropertyPrice = (p) => p?.price_usd ?? p?.price ?? p?.price_syp ?? "—";

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
              <div className="mx-auto max-w-4xl space-y-10 text-center">
                <div>
                  <h2 className="mb-4 text-3xl font-bold">Quick Search</h2>
                  <input
                    placeholder="Search properties..."
                    className="w-72 rounded-lg px-4 py-2 text-black"
                  />
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                  <button className="rounded bg-white/20 px-4 py-2">Properties</button>
                  <button className="rounded bg-white/20 px-4 py-2">Services</button>
                  <button className="rounded bg-white/20 px-4 py-2">Contact</button>
                </div>

                <p className="text-white/80">
                  Urbanex is an AI-powered real estate platform that helps you explore, analyze,
                  and invest in premium properties.
                </p>

                <button
                  onClick={() =>
                    window.scrollTo({ top: window.innerHeight * 1.2, behavior: "smooth" })
                  }
                  className="rounded-lg bg-white px-6 py-2 text-black"
                >
                  Explore Properties
                </button>
              </div>
            </ScrollExpandMedia>
          </section>

          <section className="bg-gradient-to-b from-black to-gray-900 py-20 text-center text-white">
            <div className="mx-auto max-w-4xl space-y-6 px-4">
              <h2 className="text-4xl font-bold">منصة Urbanex العقارية</h2>

              <p className="text-lg leading-relaxed text-white/80">
                Urbanex هي منصة عقارية ذكية تعتمد على الذكاء الاصطناعي لتحليل السوق العقاري
                وتقديم أفضل الفرص الاستثمارية بناءً على البيانات الحقيقية.
              </p>

              <p className="text-lg text-white/70">
                نساعدك على اتخاذ قرارات دقيقة من خلال تحليل الأسعار، مقارنة المناطق، وتقديم
                توصيات ذكية تناسب احتياجاتك.
              </p>
            </div>
          </section>

          <section className="bg-black py-20 text-white">
            <div className="mx-auto max-w-6xl px-4">
              <h2 className="mb-10 text-center text-3xl font-bold">أبرز العقارات</h2>

              <div className="grid gap-6 md:grid-cols-3">
                {properties.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="overflow-hidden rounded-xl bg-white/5 backdrop-blur transition hover:scale-105"
                  >
                    <img
                      src={getPropertyImage(p)}
                      alt={p.title || "Property"}
                      className="h-48 w-full object-cover"
                    />

                    <div className="space-y-2 p-4">
                      <h3 className="font-bold">{p.title || "Property"}</h3>
                      <p className="text-sm text-white/70">{p.city || "Damascus"}</p>
                      <p className="font-bold text-green-400">${getPropertyPrice(p)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-gray-100 py-20">
            <div className="mx-auto max-w-6xl px-4">
              <h2 className="mb-10 text-center text-3xl font-bold text-black">جميع العقارات</h2>

              <div className="grid gap-6 md:grid-cols-3">
                {properties.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl bg-white shadow transition hover:shadow-lg"
                  >
                    <img
                      src={getPropertyImage(p)}
                      alt={p.title || "Property"}
                      className="h-48 w-full object-cover"
                    />

                    <div className="space-y-2 p-4">
                      <h3 className="font-bold text-black">{p.title || "Property"}</h3>
                      <p className="text-sm text-gray-600">{p.city || "Damascus"}</p>
                      <p className="font-bold text-green-600">${getPropertyPrice(p)}</p>
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
