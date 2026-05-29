import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../components/ToastProvider.jsx";
import { notify } from "@/components/notifications/NotificationsProvider";

const DRAFT_KEY = "bookvisit_draft_v1";
const LAST_SEARCH_KEY = "last_search_v1";

const LUXURY_CSS = `
  #golden-aura {
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    pointer-events: none; z-index: 9999;
    background: radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(212,175,55,0.08), transparent 80%);
    mix-blend-mode: screen;
  }
  #scroll-progress {
    position: fixed; top: 0; left: 0; height: 3px; width: 0%;
    background: linear-gradient(to right, #D4AF37, #f5d97a);
    z-index: 9998; transition: width 0.1s linear;
  }
  .glass-gold {
    background: rgba(212,175,55,0.05);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border: 0.5px solid rgba(212,175,55,0.2);
    position: relative; overflow: hidden;
  }
  .glass-gold::before {
    content: ''; position: absolute; top: -100%; left: -100%;
    width: 300%; height: 300%;
    background: linear-gradient(45deg, transparent, rgba(212,175,55,0.08), transparent);
    transition: transform 0.8s ease; pointer-events: none;
  }
  .glass-gold:hover::before { transform: translate(50%, 50%); }
  .parallax-wrap { overflow: hidden; position: relative; }
  .scroll-reveal {
    opacity: 0; transform: translateY(36px) scale(0.97);
    transition: opacity 1.1s cubic-bezier(0.22,1,0.36,1), transform 1.1s cubic-bezier(0.22,1,0.36,1);
    will-change: transform, opacity;
  }
  .scroll-reveal.active { opacity: 1; transform: translateY(0) scale(1); }
  .stagger-item { opacity: 0; transform: translateY(18px); }
  .scroll-reveal.active .stagger-item {
    animation: staggerUp 0.75s cubic-bezier(0.22,1,0.36,1) forwards;
  }
  @keyframes staggerUp { to { opacity: 1; transform: translateY(0); } }
  .shimmer-btn { position: relative; overflow: hidden; }
  .shimmer-btn::after {
    content: ''; position: absolute; top: -50%; left: -50%;
    width: 200%; height: 200%;
    background: linear-gradient(60deg, transparent, rgba(255,255,255,0.14), transparent);
    transform: rotate(45deg); transition: transform 0.55s ease;
  }
  .shimmer-btn:hover::after { transform: rotate(45deg) translate(50%,50%); }
  .journey-line-fill { height: 0%; transition: height 0.3s ease-out; }
  @keyframes pulse-gold {
    0%   { box-shadow: 0 0 0 0 rgba(212,175,55,0.55); }
    70%  { box-shadow: 0 0 0 14px rgba(212,175,55,0); }
    100% { box-shadow: 0 0 0 0 rgba(212,175,55,0); }
  }
  .milestone-active {
    animation: pulse-gold 2s infinite;
    background: rgba(212,175,55,0.22) !important;
    transform: scale(1.1) !important;
  }
  @keyframes breathing {
    0%,100% { transform: scale(1); opacity: 0.28; filter: blur(20px); }
    50%      { transform: scale(1.18); opacity: 0.45; filter: blur(26px); }
  }
  .heatmap-pulse { animation: breathing 4s ease-in-out infinite; }
  .font-playfair { font-family: 'Playfair Display', Georgia, serif; }
`;

export default function Home() {
  const nav = useNavigate();
  const toast = useToast();
  const canvasRef = useRef(null);

  const [quick, setQuick] = useState({ city: "", type: "", minPrice: "", maxPrice: "" });
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSearch, setLastSearch] = useState(null);
  const draftToastShownRef = useRef(false);

  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      const exists = !!draft;
      setHasDraft(exists);
      if (exists) {
        const shown = sessionStorage.getItem("draft_toast_shown") === "true";
        if (!draftToastShownRef.current && !shown) {
          toast.info("لديك مسودة حجز غير مكتملة.");
          draftToastShownRef.current = true;
          sessionStorage.setItem("draft_toast_shown", "true");
        }
      }
    } catch {}
    try {
      const saved = localStorage.getItem(LAST_SEARCH_KEY);
      if (saved) setLastSearch(JSON.parse(saved));
    } catch {}
  }, [toast]);

  const onlyNum = (v) => v.replace(/[^\d]/g, "");

  const onQuickSearch = (e) => {
    e.preventDefault();
    let min = quick.minPrice ? Number(quick.minPrice) : "";
    let max = quick.maxPrice ? Number(quick.maxPrice) : "";
    if (min !== "" && max !== "" && min > max) {
      [min, max] = [max, min];
      toast.info("تم تعديل نطاق السعر.");
    }
    const query = {
      city: quick.city.trim(),
      type: quick.type,
      ...(min !== "" ? { minPrice: String(min) } : {}),
      ...(max !== "" ? { maxPrice: String(max) } : {}),
    };
    try { localStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(query)); } catch {}
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => v && params.set(k, v));
    toast.success("تم تطبيق البحث السريع.");
    notify({ type: "search", title: "بحث مُطبَّق", message: "تم تطبيق الفلاتر بنجاح." });
    nav(`/search?${params.toString()}`);
  };

  const applyLastSearch = () => {
    if (!lastSearch) return;
    const q = new URLSearchParams();
    Object.entries(lastSearch).forEach(([k, v]) => v && q.set(k, v));
    toast.info("تمت استعادة آخر بحث.");
    nav(`/search?${q.toString()}`);
  };

  const clearLastSearch = () => {
    try { localStorage.removeItem(LAST_SEARCH_KEY); } catch {}
    setLastSearch(null);
    toast.info("تم مسح آخر بحث.");
  };

  // ── Golden aura mouse follow ──────────────────────────────────────────────
  useEffect(() => {
    const aura = document.getElementById("golden-aura");
    if (!aura) return;
    const onMove = (e) => {
      aura.style.setProperty("--x", e.clientX + "px");
      aura.style.setProperty("--y", e.clientY + "px");
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // ── Scroll: progress bar + parallax + journey fill ───────────────────────
  useEffect(() => {
    const onScroll = () => {
      const ws = document.documentElement.scrollTop;
      const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const bar = document.getElementById("scroll-progress");
      if (bar) bar.style.width = ((ws / h) * 100) + "%";

      document.querySelectorAll(".parallax-element").forEach((el) => {
        const speed = parseFloat(el.getAttribute("data-speed")) || 0.1;
        el.style.transform = `translateY(${-(ws * speed)}px) scale(1.2)`;
      });

      const section = document.getElementById("journey-section");
      const fill = document.getElementById("journey-fill");
      if (section && fill) {
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;
        let progress = 0;
        if (rect.top < vh) {
          progress = Math.min(100, (Math.max(0, vh - rect.top) / rect.height) * 110);
        }
        fill.style.height = `${progress}%`;
        document.querySelectorAll(".journey-step").forEach((step) => {
          const sr = step.getBoundingClientRect();
          const icon = step.querySelector(".milestone-icon");
          if (!icon) return;
          if (sr.top < vh * 0.6 && sr.bottom > vh * 0.4) icon.classList.add("milestone-active");
          else icon.classList.remove("milestone-active");
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Scroll reveal via IntersectionObserver ────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            entry.target.querySelectorAll(".stagger-item").forEach((item, i) => {
              item.style.animationDelay = `${i * 0.14}s`;
            });
          }
        });
      },
      { threshold: 0.13, rootMargin: "0px 0px -80px 0px" }
    );
    document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ── Ember particle canvas ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    function Particle() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.5 + 0.4;
      this.sx = (Math.random() - 0.5) * 0.38;
      this.sy = (Math.random() - 0.5) * 0.38;
      this.opacity = Math.random() * 0.38 + 0.08;
    }
    Particle.prototype.update = function () {
      this.x += this.sx; this.y += this.sy;
      if (this.x < 0 || this.x > canvas.width) this.sx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.sy *= -1;
    };
    Particle.prototype.draw = function () {
      ctx.fillStyle = `rgba(212,175,55,${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const particles = reduced ? [] : Array.from({ length: 65 }, () => new Particle());
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => { p.update(); p.draw(); });
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  //  JSX
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div dir="rtl" style={{ fontFamily: "'Inter', sans-serif" }} className="overflow-x-hidden text-[#1b1c1c]">
      {/* Injected CSS */}
      <style dangerouslySetInnerHTML={{ __html: LUXURY_CSS }} />
      {/* Golden aura overlay */}
      <div id="golden-aura" />
      {/* Scroll progress bar */}
      <div id="scroll-progress" />

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center parallax-wrap bg-[#090909]">
        {/* Ember canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 z-[2] w-full h-full pointer-events-none" />
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"
            alt="luxury architecture"
            className="w-full h-full object-cover scale-125 parallax-element"
            data-speed="0.18"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#090909]/95 via-[#090909]/55 to-transparent" />
          <div className="absolute inset-0" style={{ background: "rgba(212,175,55,0.06)", mixBlendMode: "overlay" }} />
        </div>

        {/* Hero content */}
        <div className="relative z-10 w-full px-6 md:px-20 max-w-7xl mx-auto pt-24 pb-44">
          <div className="max-w-3xl space-y-7 scroll-reveal active">
            <span
              className="stagger-item inline-flex items-center gap-2 border px-4 py-1.5 text-[11px] tracking-[0.22em] backdrop-blur-sm"
              style={{ borderColor: "rgba(212,175,55,0.35)", color: "#D4AF37", background: "rgba(212,175,55,0.08)" }}
            >
              ✦ منصة الذكاء العقاري
            </span>
            <h1
              className="font-playfair stagger-item text-4xl md:text-6xl lg:text-[4.5rem] font-bold text-white leading-[1.12]"
              style={{ animationDelay: "0.1s" }}
            >
              اكتشف مستقبلك العمراني
              <br />
              مع <span style={{ color: "#D4AF37" }}>Urbanex</span>
            </h1>
            <p className="stagger-item text-[1.05rem] leading-relaxed max-w-xl" style={{ color: "rgba(255,255,255,0.65)", animationDelay: "0.25s" }}>
              نحن نعيد تعريف رحلة البحث العقاري من خلال دمج الخبرة العقارية العريقة
              مع قوة الذكاء الاصطناعي. المسكن الفاخر ليس مجرد مساحة، بل هو استثمار
              ذكي ومدروس.
            </p>
            <div className="stagger-item flex flex-wrap gap-4 pt-1" style={{ animationDelay: "0.42s" }}>
              <button
                onClick={() => nav("/properties")}
                className="shimmer-btn px-8 py-3.5 font-bold tracking-widest text-sm transition-all duration-300 hover:brightness-110"
                style={{ background: "#D4AF37", color: "#1b1c1c" }}
              >
                ابدأ الاستكشاف
              </button>
              <button
                onClick={() => nav("/contact")}
                className="shimmer-btn border px-8 py-3.5 font-bold tracking-widest text-sm transition-all duration-300 hover:bg-[#D4AF37]/10"
                style={{ borderColor: "rgba(212,175,55,0.45)", color: "#D4AF37" }}
              >
                تواصل معنا
              </button>
            </div>
          </div>
        </div>

        {/* Floating search bar */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 md:px-0 z-20 scroll-reveal active">
          <form
            onSubmit={onQuickSearch}
            className="stagger-item glass-gold p-2 shadow-2xl flex flex-col md:flex-row gap-2"
            style={{ animationDelay: "0.65s" }}
          >
            <div className="flex-1 flex items-center px-5 gap-3">
              <span style={{ color: "#D4AF37" }}>⌕</span>
              <input
                className="bg-transparent border-none outline-none w-full py-3 text-sm placeholder-white/35"
                style={{ color: "#fff" }}
                placeholder="ما الموقع أو الحي الذي تبحث عنه؟"
                value={quick.city}
                onChange={(e) => setQuick({ ...quick, city: e.target.value })}
              />
            </div>
            <div className="hidden md:block w-px h-10 my-auto" style={{ background: "rgba(212,175,55,0.28)" }} />
            <div className="flex-1 flex items-center px-5 gap-3">
              <select
                className="bg-transparent border-none outline-none w-full py-3 text-sm appearance-none cursor-pointer"
                style={{ color: quick.type ? "#fff" : "rgba(255,255,255,0.38)" }}
                value={quick.type}
                onChange={(e) => setQuick({ ...quick, type: e.target.value })}
              >
                <option className="text-black" value="">نوع العقار</option>
                <option className="text-black" value="APARTMENT">شقة</option>
                <option className="text-black" value="VILLA">فيلا</option>
                <option className="text-black" value="HOUSE">بيت</option>
                <option className="text-black" value="STUDIO">استوديو</option>
              </select>
            </div>
            <button
              type="submit"
              className="shimmer-btn px-8 py-3 font-bold text-sm tracking-widest transition-all duration-300 flex items-center gap-2"
              style={{ background: "#1b1c1c", color: "#D4AF37" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#D4AF37"; e.currentTarget.style.color = "#1b1c1c"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#1b1c1c"; e.currentTarget.style.color = "#D4AF37"; }}
            >
              بحث ذكي ✦
            </button>
          </form>

          {hasDraft && (
            <div className="mt-2 glass-gold px-5 py-2.5 flex items-center justify-between text-sm">
              <span style={{ color: "rgba(255,255,255,0.6)" }}>لديك مسودة حجز غير مكتملة</span>
              <button onClick={() => nav("/client/book-visit")} className="text-xs hover:underline" style={{ color: "#D4AF37" }}>
                متابعة المسودة ←
              </button>
            </div>
          )}
          {lastSearch && (
            <div className="mt-2 glass-gold px-5 py-2.5 flex items-center justify-between text-xs">
              <span style={{ color: "rgba(255,255,255,0.38)" }}>
                {Object.entries(lastSearch).map(([k, v]) => `${k}: ${v}`).join(" • ")}
              </span>
              <div className="flex gap-4">
                <button onClick={applyLastSearch} className="hover:underline" style={{ color: "#D4AF37" }}>استعادة</button>
                <button onClick={clearLastSearch} className="hover:underline" style={{ color: "rgba(255,255,255,0.35)" }}>مسح</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES BENTO
      ══════════════════════════════════════════════ */}
      <section className="py-28 px-6 md:px-20 max-w-7xl mx-auto bg-white">
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="font-playfair stagger-item text-3xl md:text-[2.6rem] font-bold text-[#1b1c1c] mb-4">
            تقنيات استشارية للعقار
          </h2>
          <p className="stagger-item text-[#5e5e5e] max-w-2xl mx-auto leading-relaxed" style={{ animationDelay: "0.15s" }}>
            نستخدم خوارزميات متقدمة لتحليل السوق وتوفير بيانات دقيقة تضمن لك
            أفضل قيمة عقارية ممكنة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Large card — AI Evaluation */}
          <div className="md:col-span-8 group glass-gold p-10 md:p-12 min-h-[380px] flex flex-col justify-end relative scroll-reveal hover:shadow-2xl transition-all duration-500 cursor-pointer"
               onClick={() => nav("/owner/chat")}>
            <div className="font-playfair absolute top-8 left-8 select-none font-bold transition-all duration-700"
                 style={{ fontSize: "6rem", lineHeight: 1, color: "rgba(212,175,55,0.12)" }}
                 onMouseEnter={(e) => e.currentTarget.style.color = "rgba(212,175,55,0.32)"}
                 onMouseLeave={(e) => e.currentTarget.style.color = "rgba(212,175,55,0.12)"}>
              AI
            </div>
            <div className="relative z-10 space-y-4">
              <h3 className="font-playfair stagger-item text-2xl font-bold text-[#1b1c1c]">
                تقييم عقاري بالذكاء الاصطناعي
              </h3>
              <p className="stagger-item text-[#5e5e5e] max-w-lg leading-relaxed" style={{ animationDelay: "0.1s" }}>
                احصل على تقدير دقيق لسعر العقار بناءً على اتجاهات السوق اللحظية
                والمشاريع المستقبلية المحيطة.
              </p>
              <span className="stagger-item inline-flex items-center gap-2 font-bold text-sm tracking-wider transition-all duration-300 group-hover:gap-4"
                    style={{ color: "#D4AF37", animationDelay: "0.2s" }}>
                ← استكشف الأداة
              </span>
            </div>
          </div>

          {/* Small card — Buyer assistant */}
          <div className="md:col-span-4 group relative overflow-hidden p-10 md:p-12 min-h-[380px] flex flex-col justify-between scroll-reveal hover:scale-[1.02] transition-all duration-500 cursor-pointer"
               style={{ background: "#1b1c1c" }}
               onClick={() => nav("/client/chat")}>
            <span className="text-4xl select-none">🤖</span>
            <div className="space-y-4">
              <h3 className="font-playfair text-2xl font-bold" style={{ color: "#D4AF37" }}>المساعد الشخصي</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                بوت ذكي متاح 24/7 للإجابة على استفساراتك القانونية والمالية
                بخصوص تملك العقار.
              </p>
              <span className="inline-flex items-center gap-2 text-sm transition-colors duration-300"
                    style={{ color: "rgba(212,175,55,0.65)" }}>
                ← ابدأ المحادثة
              </span>
            </div>
            <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full transition-colors duration-1000 heatmap-pulse"
                 style={{ background: "rgba(212,175,55,0.12)" }} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          JOURNEY
      ══════════════════════════════════════════════ */}
      <section id="journey-section" className="py-28 relative overflow-hidden parallax-wrap"
               style={{ background: "#1b1c1c", color: "#fbf9f8" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-20 relative z-10">
          <div className="text-center mb-24 scroll-reveal">
            <h2 className="font-playfair stagger-item text-3xl md:text-[2.6rem] font-bold mb-4"
                style={{ color: "#D4AF37" }}>
              رحلة تملّكك الذكية
            </h2>
            <p className="stagger-item max-w-xl mx-auto leading-relaxed"
               style={{ color: "rgba(255,255,255,0.45)", animationDelay: "0.15s" }}>
              خطوات مدروسة، مدعومة بالبيانات، تحوّل حلمك إلى حقيقة استثمارية ناجحة.
            </p>
          </div>

          <div className="relative">
            {/* Vertical progress line */}
            <div className="absolute right-1/2 translate-x-1/2 top-0 bottom-0 w-[2px] hidden md:block"
                 style={{ background: "rgba(212,175,55,0.1)" }}>
              <div id="journey-fill" className="journey-line-fill w-full"
                   style={{ background: "#D4AF37", boxShadow: "0 0 14px rgba(212,175,55,0.75)" }} />
            </div>

            <div className="space-y-28">
              {[
                {
                  n: "01",
                  title: "ابدأ محادثة مع المساعد",
                  body: "قُم بمسح شامل لاحتياجاتك باستخدام خوارزمياتنا للتطابق مع أفضل الفرص العقارية الملائمة.",
                  to: "/client/chat",
                  icon: "💬",
                  reverse: false,
                },
                {
                  n: "02",
                  title: "حدد موقع عقارك على الخريطة",
                  body: "تفاعل مع الخريطة الذكية لتحديد الأحياء والمناطق المفضلة مع تحليل فوري للأسعار والطلب.",
                  to: "/owner/map-picker",
                  icon: "🗺️",
                  reverse: true,
                },
                {
                  n: "03",
                  title: "احصل على تقييم شامل",
                  body: "إتمام كافة الإجراءات عبر منصتنا المشفّرة، ضمان التحقق الفوري بسرعة وأمان تام.",
                  to: "/owner/chat",
                  icon: "📊",
                  reverse: false,
                },
              ].map((step) => (
                <div
                  key={step.n}
                  className={`journey-step flex flex-col ${step.reverse ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-12 scroll-reveal`}
                >
                  <div className={`md:w-1/2 text-center ${step.reverse ? "md:text-right" : "md:text-left"}`}>
                    <div
                      className="milestone-icon inline-flex items-center justify-center w-20 h-20 rounded-full border text-xl font-bold mb-6 stagger-item transition-all duration-500"
                      style={{
                        background: "rgba(212,175,55,0.1)",
                        borderColor: "rgba(212,175,55,0.3)",
                        color: "#D4AF37",
                        fontFamily: "'Playfair Display', serif",
                      }}
                    >
                      {step.n}
                    </div>
                    <h3 className="font-playfair text-xl font-bold text-white mb-4 stagger-item"
                        style={{ animationDelay: "0.1s" }}>
                      {step.title}
                    </h3>
                    <p className="leading-relaxed mb-5 stagger-item"
                       style={{ color: "rgba(255,255,255,0.48)", animationDelay: "0.2s" }}>
                      {step.body}
                    </p>
                    <Link
                      to={step.to}
                      className="stagger-item inline-flex items-center gap-2 font-bold text-sm tracking-wider hover:gap-4 transition-all duration-300"
                      style={{ color: "#D4AF37", animationDelay: "0.3s" }}
                    >
                      ← انتقل للخطوة
                    </Link>
                  </div>
                  <div className="md:w-1/2 stagger-item" style={{ animationDelay: "0.28s" }}>
                    <div className="aspect-video glass-gold rounded-2xl flex items-center justify-center shadow-2xl">
                      <span className="text-7xl" style={{ opacity: 0.38 }}>{step.icon}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
             style={{ background: "rgba(212,175,55,0.04)" }} />
      </section>

      {/* ══════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════ */}
      <section className="py-20 px-6 md:px-20 bg-[#fbf9f8]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 scroll-reveal">
          {[
            { value: "+18,000", label: "عقار مُدرج" },
            { value: "85", label: "منطقة سورية" },
            { value: "7", label: "أدوار مختلفة" },
            { value: "AI", label: "Groq + Gemini" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="glass-gold p-8 text-center stagger-item hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="font-playfair text-4xl font-bold mb-2" style={{ color: "#D4AF37" }}>
                {stat.value}
              </div>
              <div className="text-sm font-medium tracking-wide" style={{ color: "#5e5e5e" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════ */}
      <section className="relative py-40 text-center overflow-hidden parallax-wrap"
               style={{ background: "#1b1c1c" }}>
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80"
            alt="cityscape"
            className="w-full h-full object-cover opacity-[0.18] scale-125 parallax-element"
            data-speed="0.14"
          />
        </div>
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: "linear-gradient(to top, #1b1c1c 10%, transparent 50%, #1b1c1c 90%)", opacity: 0.92 }} />

        <div className="relative z-10 px-6 scroll-reveal">
          <h2 className="font-playfair stagger-item text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            هل أنت مستعد لمستقبل عقاري أذكى؟
            <br />
            <span className="italic" style={{ color: "#D4AF37" }}>عقارك الأذكى ينتظرك</span>
          </h2>
          <p className="stagger-item max-w-2xl mx-auto mb-12 text-lg"
             style={{ color: "rgba(255,255,255,0.48)", animationDelay: "0.18s" }}>
            انضم إلى مجتمع المستثمرين الذين يستخدمون Urbanex لتأمين صفقاتهم
            العقارية الأكثر ربحية.
          </p>
          <div className="stagger-item flex flex-col sm:flex-row gap-6 justify-center"
               style={{ animationDelay: "0.36s" }}>
            <button
              onClick={() => nav("/auth/register")}
              className="shimmer-btn px-12 py-5 font-bold text-lg shadow-xl transition-all duration-300 hover:brightness-110"
              style={{ background: "#D4AF37", color: "#1b1c1c" }}
            >
              سجل الآن
            </button>
            <button
              onClick={() => nav("/properties")}
              className="shimmer-btn border px-12 py-5 font-bold text-lg text-white transition-all duration-300"
              style={{ borderColor: "rgba(212,175,55,0.38)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(212,175,55,0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              تصفح العقارات
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer className="py-20 px-6 md:px-20 border-t"
              style={{ background: "#0d0d0d", color: "#fbf9f8", borderColor: "rgba(212,175,55,0.18)" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-5">
            <div className="font-playfair text-2xl font-bold border-b-2 inline-block pb-1"
                 style={{ color: "#D4AF37", borderColor: "#D4AF37" }}>
              Urbanex
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.38)" }}>
              الوجهة الرائدة للباحثين عن الاستثمارات العقارية الفاخرة المعتمدة على الذكاء الاصطناعي.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[11px] tracking-[0.22em] mb-8" style={{ color: "#D4AF37" }}>الروابط</h4>
            <ul className="space-y-4">
              {[
                { label: "قائمة العقارات", to: "/properties" },
                { label: "الخدمات الاستشارية", to: "/services" },
                { label: "التذاكر والدعم", to: "/client/tickets" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm transition-colors duration-300 hover:text-white"
                        style={{ color: "rgba(255,255,255,0.48)" }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[11px] tracking-[0.22em] mb-8" style={{ color: "#D4AF37" }}>قانوني</h4>
            <ul className="space-y-4">
              {[
                "سياسة الخصوصية",
                "الشروط والأحكام",
                "بيان الاستثمار",
              ].map((l) => (
                <li key={l}>
                  <Link to="/legal" className="text-sm transition-colors duration-300 hover:text-white"
                        style={{ color: "rgba(255,255,255,0.48)" }}>
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[11px] tracking-[0.22em] mb-8" style={{ color: "#D4AF37" }}>نشرة Urbanex</h4>
            <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.38)" }}>
              اشترك لتصلك الفرص الاستثمارية الحصرية.
            </p>
            <div className="flex border-b pb-1 transition-all focus-within:border-[#D4AF37]"
                 style={{ borderColor: "rgba(212,175,55,0.28)" }}>
              <input
                type="email"
                className="bg-transparent border-none outline-none w-full py-2 text-sm"
                style={{ color: "#fff" }}
                placeholder="بريدك الإلكتروني"
              />
              <button className="p-1 transition-transform duration-300 hover:-translate-x-1"
                      style={{ color: "#D4AF37" }}>
                →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs"
             style={{ borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.22)" }}>
          <p>© 2026 Urbanex — محمد السلمان. جميع الحقوق محفوظة.</p>
          <div className="flex gap-6">
            {["Instagram", "LinkedIn", "Twitter"].map((s) => (
              <a key={s} href="#" className="transition-colors duration-300 hover:text-[#D4AF37]">{s}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
