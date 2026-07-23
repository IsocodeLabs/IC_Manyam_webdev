import Link from "next/link";
import { getPublishedPackages, getPublishedPosts, Post } from "@/lib/data/public";
import { PostCard } from "@/components/public/ui/PostCard";
import { PackageCard } from "@/components/public/ui/PackageCard";
import { Button } from "@/components/public/ui/Button";
import { SectionHeading } from "@/components/public/ui/SectionHeading";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { Metadata } from "next";
import { HomeConcierge } from "@/components/public/HomeConcierge";
import { HomeTestimonials } from "@/components/public/HomeTestimonials";
import { HeroSlideshow } from "@/components/public/HeroSlideshow";
import { ClosingCta } from "@/components/public/ClosingCta";
import { ListingFaq } from "@/components/public/ListingFaq";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    seoMeta: null,
    fallbackTitle: "MANNYAM | Bespoke Journeys Across India",
    fallbackDescription: "Private, unhurried journeys across India, shaped around you and planned end to end. Made for travellers who want to feel a place, not tick it off.",
    path: "/",
  });
}

// Image URLs from frontend.html
const HERO_IMG = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=75";
const HERO_IMG2 = "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=600&q=75";

const FESTIVALS_RAIL = [
  { slug: "festival-holi", title: "Holi", when: "March", desc: "Festival of colour", img: "https://unsplash.com/photos/rFP3OzmYH6M/download?w=860&fm=jpg&fit=crop" },
  { slug: "festival-diwali", title: "Diwali", when: "Oct-Nov", desc: "Festival of lights", img: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=75" },
  { slug: "festival-dussehra", title: "Dussehra", when: "October", desc: "Triumph of good", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=75" },
  { slug: "festival-durga-puja", title: "Durga Puja", when: "October", desc: "Art and devotion", img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=75" },
  { slug: "festival-navratri", title: "Navratri", when: "October", desc: "Nine nights of dance", img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=75" },
  { slug: "festival-ganesh-chaturthi", title: "Ganesh Chaturthi", when: "Aug-Sep", desc: "The people's festival", img: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=600&q=75" },
];

const EXPERIENCES_CARDS = [
  { slug: "experience-heritage", k: "Culture", h: "Culture and Heritage", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=75" },
  { slug: "experience-food", k: "Flavours", h: "Food and Culinary Stories", img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=75" },
  { slug: "experience-wildlife", k: "Wild", h: "Nature and Wildlife", img: "https://images.unsplash.com/photo-1615824996195-f780bba7cfab?auto=format&fit=crop&w=600&q=75" },
  { slug: "experience-spiritual", k: "Soul", h: "Spiritual and Soulful", img: "https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=600&q=75" },
  { slug: "experience-royal", k: "Royal", h: "Royal and Exclusive", img: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=75" },
  { slug: "experience-honeymoon", k: "Romance", h: "Honeymoon and Romance", img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=75" },
];

const DESTINATIONS_CARDS = [
  { slug: "destination-rajasthan", k: "Oct-Mar", h: "Rajasthan", img: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=75" },
  { slug: "destination-kerala", k: "Sep-Mar", h: "Kerala", img: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=600&q=75" },
  { slug: "destination-himalayas", k: "May-Sep", h: "The Himalayas", img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=75" },
  { slug: "destination-varanasi", k: "Oct-Mar", h: "Varanasi", img: "https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=600&q=75" },
  { slug: "destination-tamil-nadu", k: "Nov-Feb", h: "Tamil Nadu", img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=75" },
  { slug: "destination-gujarat", k: "Nov-Feb", h: "Gujarat", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=75" },
];

const DIFF = [
  { h: "A curator, not a call centre", p: "One person designs your journey and stays reachable through every day of it.", icon: "M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" },
  { h: "Real access, not a script", p: "Private temple openings, festival vantage points and dinners in family homes.", icon: "M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L12 3Z" },
  { h: "Seamless and safe", p: "Vetted drivers, support around the clock and every transfer handled.", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" },
  { h: "Unhurried by design", p: "Fewer places and more depth, with slow mornings and room to wander built in.", icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v5l3 2" },
  { h: "Honest advice", p: "We tell you what a place is really like, the right season and where the crowds will be.", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { h: "Yours to shape", p: "Every journey is designed around you and can be reimagined to suit your pace and purpose.", icon: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" },
];

const STEPS = [
  { title: "Tell us your story", desc: "Share who is travelling, what moves you and roughly when. The concierge makes a fine first sketch." },
  { title: "We write the first draft", desc: "Within a day your curator sends a tailored outline. Reshape it freely until it feels like yours." },
  { title: "You live it", desc: "Land in India and let go. Your host and ground team carry every detail." },
];

const HOME_FAQ = [
  {
    question: "What does MANNYAM do?",
    answer: "MANNYAM plans private, tailor-made journeys across India for travellers who want comfort and authenticity together. Every India trip is designed around you, from festivals and palaces to backwaters, wildlife and quiet time, and is planned end to end.",
  },
  {
    question: "How does planning a trip with MANNYAM work?",
    answer: "Tell our concierge or a curator what you are dreaming of. Within a day you receive a tailored outline of your India journey, which you reshape with us until it feels right. Then you travel, and we handle every detail.",
  },
  {
    question: "How much does a private India journey cost?",
    answer: "Because every journey is bespoke, there is no fixed price list. We shape each India trip around your wishes, your dates and your budget, then send a clear, itemised quotation with your outline. Share a rough budget and we will advise honestly on what is possible.",
  },
  {
    question: "Is India safe to travel, and is MANNYAM safe to book with?",
    answer: "Yes. We use vetted drivers, carefully chosen stays and trusted local hosts, with support around the clock. Your details are encrypted, used only to plan your trip, and never sold, so both your journey and your privacy are looked after.",
  },
  {
    question: "When is the best time to visit India?",
    answer: "Broadly, October to March suits most of the country, while the Himalayas are best from May to September. The ideal time depends on the regions and festivals in your trip, and your curator will confirm the best dates for you.",
  },
  {
    question: "Who does MANNYAM plan journeys for?",
    answer: "We plan private India tours for couples, honeymooners, families and small groups, and for companies planning a retreat, mainly travelling from Europe, the United Kingdom, the United States and beyond. Whoever you are, the pace is set around you.",
  },
];

export default async function PublicHomePage() {
  const [packages, posts] = await Promise.all([
    getPublishedPackages(undefined, 10),
    getPublishedPosts(3),
  ]);

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MANNYAM",
    url: "https://mannyam.in",
    description: "Private, unhurried journeys across India, shaped around you and planned end to end.",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const slides = [];
  for (let i = 0; i < packages.length; i += 2) {
    const p1 = packages[i];
    const p2 = packages[i + 1] || packages[0];
    
    // Attempt to extract background image from the featured_image_url of the packages
    const img1 = p1.featured_image_url || "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=75";
    const img2 = p2.featured_image_url || "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=600&q=75";

    slides.push({
      large: img1,
      small: img2,
      largeLink: `/${p1.slug}`,
      smallLink: `/${p2.slug}`,
      largeLabel: p1.title,
      smallLabel: p2.title,
    });
  }

  return (
    <div className="font-sans bg-ivory text-ink selection:bg-gold/20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[100svh] flex items-end pb-10 md:items-center md:pb-0 overflow-hidden bg-[radial-gradient(130%_92%_at_80%_20%,#5d6747,#3a4128_46%,#23270f)]">
        <HeroSlideshow slides={slides} />

        <div className="relative z-10 text-ivory px-5 md:px-10 max-w-7xl mx-auto w-full">
          <div className="max-w-[600px] pt-[340px] md:pt-0">
            <span className="font-sans text-[10.5px] font-medium tracking-[0.4em] uppercase text-sand">The Story of India</span>
            <h1 className="font-display text-[46px] md:text-[86px] font-medium mt-2 leading-[1.02] tracking-tight">
              Step through<br />the <em className="italic text-gold">threshold</em>.
            </h1>
            <p className="mt-3.5 text-[14.5px] md:text-[18.5px] max-w-[27em] text-ivory/80 font-light leading-relaxed">
              Private, unhurried journeys across India, shaped around you and planned end to end. Made for travellers who want to feel a place, not tick it off.
            </p>
            <div className="flex items-center gap-6 flex-wrap mt-[22px] md:mt-[26px]">
              <Button href="#concierge" variant="amber">Plan with our concierge</Button>
              <Link href="/journeys" className="text-[11px] tracking-[0.13em] uppercase text-sand hover:text-white transition-colors flex items-center gap-1.5">
                or browse ready-made journeys <span>&rarr;</span>
              </Link>
            </div>
            <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-6 mt-[18px] md:mt-[26px] md:pt-[22px] md:border-t md:border-white/16">
              <span className="flex items-center gap-2 text-[11.5px] text-ivory/80"><svg className="w-3.5 h-3.5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12l4 4 10-11"/></svg> Private, tailor-made trips</span>
              <span className="flex items-center gap-2 text-[11.5px] text-ivory/80"><svg className="w-3.5 h-3.5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12l4 4 10-11"/></svg> Local curators on the ground</span>
              <span className="flex items-center gap-2 text-[11.5px] text-ivory/80"><svg className="w-3.5 h-3.5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12l4 4 10-11"/></svg> Support around the clock</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CONCIERGE BOX ═══ */}
      <div className="-mt-[26px] md:-mt-[58px] relative z-30 px-4 md:px-0 max-w-[760px] mx-auto" id="concierge">
        <HomeConcierge />
      </div>

      {/* ═══ FESTIVAL SCROLL RAIL ═══ */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading eyebrow="Festival Journeys" heading="Time your trip to a celebration." intro="India is at its most alive during its festivals. Plan around Holi, Diwali, Dussehra and more." />
        </div>
        <div className="flex gap-[13px] overflow-x-auto snap-x snap-mandatory mt-6 px-5 md:px-10 pb-2 scrollbar-thin scrollbar-thumb-gold/30">
          {FESTIVALS_RAIL.map((f) => (
            <Link key={f.slug} href={`/${f.slug}`} className="snap-start flex-shrink-0 w-[74%] md:w-[30%] relative rounded-[16px] overflow-hidden aspect-[3/4] group">
              <img src={f.img} alt={f.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/40 to-transparent" />
              <div className="absolute left-4 right-4 bottom-4 text-ivory z-10">
                <div className="text-[9px] uppercase tracking-[0.2em] text-sand/80">{f.when}</div>
                <h3 className="font-display text-[24px] mt-0.5">{f.title}</h3>
                <div className="text-[11.5px] text-ivory/70 mt-0.5">{f.desc}</div>
              </div>
            </Link>
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-7 text-center">
          <Button href="/festivals" variant="ghost">Explore all festival journeys</Button>
        </div>
      </section>

      {/* ═══ EXPERIENCES GRID ═══ */}
      <section className="py-12 md:py-20 max-w-7xl mx-auto px-6">
        <SectionHeading eyebrow="Experiences" heading="Travel by the feeling you are after." intro="From food walks to royal evenings, choose the kind of moments you want, and we will weave them into a journey." />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 md:gap-6 mt-6">
          {EXPERIENCES_CARDS.map((e) => (
            <Link key={e.slug} href={`/${e.slug}`} className="group cursor-pointer">
              <div className="relative rounded-[18px] overflow-hidden aspect-[100/124]">
                <img src={e.img} alt={e.h} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-1000" />
              </div>
              <div className="pt-2.5 px-0.5">
                <div className="text-[8.5px] uppercase tracking-[0.24em] text-gold font-medium">{e.k}</div>
                <h3 className="font-display text-[18px] mt-1">{e.h}</h3>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-7 text-center">
          <Button href="/experiences" variant="ghost">Explore all experiences</Button>
        </div>
      </section>

      {/* ═══ DESTINATIONS GRID ═══ */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-cream to-ivory">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading eyebrow="Destinations" heading="Choose where to begin." intro="A different India in every direction. Pick a region, and we will pair it with the right experiences." />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 md:gap-6 mt-6">
            {DESTINATIONS_CARDS.map((d) => (
              <Link key={d.slug} href={`/${d.slug}`} className="group cursor-pointer relative">
                <div className="relative rounded-[18px] overflow-hidden aspect-[100/124]">
                  <img src={d.img} alt={d.h} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-1000" />
                  <span className="absolute top-2.5 left-2.5 text-[8.5px] uppercase tracking-[0.14em] bg-ivory/90 rounded-full px-2.5 py-1 font-medium text-ink">{d.k}</span>
                </div>
                <div className="pt-2.5 px-0.5">
                  <h3 className="font-display text-[18px]">{d.h}</h3>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-7 text-center">
            <Button href="/destinations" variant="ghost">Browse all destinations</Button>
          </div>
        </div>
      </section>

      {/* ═══ SIGNATURE JOURNEYS ═══ */}
      <section className="py-12 md:py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading eyebrow="Signature journeys" heading="Stories we have already written." intro="Take them as they are, or treat them as a first chapter and reshape them with us." />
          {packages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          )}
          <div className="mt-7 text-center">
            <Button href="/journeys" variant="ghost">See all journeys</Button>
          </div>
        </div>
      </section>

      {/* ═══ THE MANNYAM DIFFERENCE ═══ */}
      <section className="py-12 md:py-20 max-w-7xl mx-auto px-6">
        <SectionHeading eyebrow="The MANNYAM difference" heading="Effortless for you. Rooted for real." intro="The two things our guests ask for most are complete ease and the genuine thing. We refuse to trade one for the other." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
          {DIFF.map((d, i) => (
            <div key={i} className="bg-paper border border-olive/8 rounded-[14px] p-5 transition-all duration-300 hover:border-gold/30 hover:translate-y-[-3px] hover:shadow-lg">
              <svg className="w-[34px] h-[34px] text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d={d.icon} /></svg>
              <h3 className="font-display text-[19px] mt-3">{d.h}</h3>
              <p className="font-sans text-[13px] text-olive/65 mt-1.5 leading-relaxed font-light">{d.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-cream to-ivory">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading eyebrow="How it works" heading="Three steps to your India." />
          <div className="max-w-[760px] mt-6">
            {STEPS.map((s, i) => (
              <div key={i} className="grid grid-cols-[44px_1fr] gap-3.5 py-5 border-t border-olive/10 last:border-b">
                <span className="font-display italic text-[30px] text-gold leading-none">0{i + 1}</span>
                <div>
                  <h3 className="font-display text-[20px]">{s.title}</h3>
                  <p className="font-sans text-[13px] text-olive/65 mt-1 leading-relaxed font-light">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-7 text-center">
            <Button href="/enquire" variant="gold">Start planning</Button>
          </div>
        </div>
      </section>

      {/* ═══ PRIVACY STRIP ═══ */}
      <section className="py-12 md:py-20 max-w-7xl mx-auto px-6">
        <div className="md:grid md:grid-cols-2 md:gap-11 md:items-center">
          <div>
            <span className="font-sans text-[10.5px] font-medium tracking-[0.4em] uppercase text-gold">Your privacy and security</span>
            <h2 className="font-display text-[26px] md:text-[36px] mt-2.5 leading-tight">Your details are yours.<br/>We treat them that way.</h2>
            <p className="font-sans text-[13.5px] text-olive/70 mt-2.5 leading-relaxed font-light">Planning a journey means sharing a little about yourself. We ask only for what we need, protect it carefully, and never sell it.</p>
          </div>
          <div className="grid gap-3 mt-5 md:mt-0">
            <div className="flex gap-3 items-start">
              <svg className="w-[19px] h-[19px] text-gold flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
              <span className="text-[13px] text-olive/80 leading-relaxed"><b className="font-medium text-ink">Encrypted and protected.</b> Everything you share is encrypted in transit and held securely.</span>
            </div>
            <div className="flex gap-3 items-start">
              <svg className="w-[19px] h-[19px] text-gold flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
              <span className="text-[13px] text-olive/80 leading-relaxed"><b className="font-medium text-ink">Only what we need.</b> We collect the minimum to plan and run your trip.</span>
            </div>
            <div className="flex gap-3 items-start">
              <svg className="w-[19px] h-[19px] text-gold flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 12a9 9 0 0 1 18 0M3 12a9 9 0 0 0 18 0"/><path d="M12 3v18"/></svg>
              <span className="text-[13px] text-olive/80 leading-relaxed"><b className="font-medium text-ink">Never sold, ever.</b> Your information is never sold or rented.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <HomeTestimonials />

      {/* ═══ JOURNAL SECTION ═══ */}
      <section className="py-12 md:py-20 max-w-7xl mx-auto px-6">
        <SectionHeading eyebrow="The journal" heading="Field notes from the road." intro="Slow reading for the curious traveller, on the festivals, rituals and quieter corners of India." />
        {posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post as Post & { categories: { name: string; slug: string } | null }} />
            ))}
          </div>
        )}
        <div className="mt-7 text-center">
          <Button href="/journal" variant="ghost">Read the journal</Button>
        </div>
      </section>

      {/* ═══ FAQ SECTION ═══ */}
      <ListingFaq
        heading="Questions, answered simply"
        subtitle="New to MANNYAM, or to India? Here are honest answers to the questions we hear most."
        items={[
          { question: "What does MANNYAM do?", answer: "MANNYAM plans private, tailor-made journeys across India for travellers who want comfort and authenticity together. Every India trip is designed around you, from festivals and palaces to backwaters, wildlife and quiet time, and is planned end to end." },
          { question: "How does planning a trip with MANNYAM work?", answer: "Tell our concierge or a curator what you are dreaming of. Within a day you receive a tailored outline of your India journey, which you reshape with us until it feels right. Then you travel, and we handle every detail." },
          { question: "How much does a private India journey cost?", answer: "Because every journey is bespoke, there is no fixed price list. We shape each India trip around your wishes, your dates and your budget, then send a clear, itemised quotation with your outline. Share a rough budget and we will advise honestly on what is possible." },
          { question: "Is India safe to travel, and is MANNYAM safe to book with?", answer: "Yes. We use vetted drivers, carefully chosen stays and trusted local hosts, with support around the clock. Your details are encrypted, used only to plan your trip, and never sold, so both your journey and your privacy are looked after." },
          { question: "When is the best time to visit India?", answer: "Broadly, October to March suits most of the country, while the Himalayas are best from May to September. The ideal time depends on the regions and festivals in your trip, and your curator will confirm the best dates for you." },
          { question: "Who does MANNYAM plan journeys for?", answer: "We plan private India tours for couples, honeymooners, families and small groups, and for companies planning a retreat, mainly travelling from Europe, the United Kingdom, the United States and beyond. Whoever you are, the pace is set around you." },
        ]}
      />

      <ClosingCta />
    </div>
  );
}
