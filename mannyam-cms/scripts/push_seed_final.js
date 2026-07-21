const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Polyfill WebSocket for Node < 22 to prevent Supabase realtime crash
if (typeof global.WebSocket === 'undefined') {
  global.WebSocket = class {};
}

const envPath = path.join(__dirname, '..', '.env.local');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
  const keyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
  if (urlMatch) supabaseUrl = urlMatch[1].trim();
  if (keyMatch) supabaseKey = keyMatch[1].trim();
}

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const htmlPath = path.join(__dirname, '..', '..', 'Building Blocks', 'Manyam frontend.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

function extractArray(regex) {
  const match = htmlContent.match(regex);
  if (!match) return [];
  try { return new Function(`return ${match[1]};`)(); } catch (e) { return []; }
}

const EXPERIENCES = extractArray(/EXPERIENCES\s*=\s*(\[.*?\]);/s);
const FESTIVALS = extractArray(/FESTIVALS\s*=\s*(\[.*?\]);/s);
const DESTINATIONS = extractArray(/DESTINATIONS\s*=\s*(\[.*?\]);/s);

const { FAQ_CAT, FAQ_DEST, FAQ_JOURNAL } = require('./extracted_faqs.js');

// Dynamic FAQ Generators
function getExpFaqs(h) {
  // Use generic experiences FAQs from FAQ_CAT if available, else fallback
  if (FAQ_CAT.experiences) {
    return FAQ_CAT.experiences.map(faq => ({ question: faq.q, answer: faq.a }));
  }
  return [
    { question: `What kinds of ${h.toLowerCase()} experiences can I have in India?`, answer: `From culture and heritage to food, wildlife, spiritual travel, royal evenings and honeymoons, our India experiences let you travel by the feeling you are after. Each ${h.toLowerCase()} journey is private and tailor-made.` },
    { question: `How do I plan a ${h.toLowerCase()} journey?`, answer: `Describe what you love. A curator replies within a day with a first outline, which you shape together until it feels exactly right.` },
    { question: `Are these trips suitable for first-time visitors?`, answer: `Absolutely. Private travel with dedicated guides and drivers is the calmest and most immersive way to see India for the first time.` }
  ];
}

function getFestFaqs(h, slug) {
  // Check FAQ_JOURNAL first for specific festival (e.g., holi-mathura or diwali-varanasi)
  // Or check FAQ_CAT.festivals
  let faqs = FAQ_CAT.festivals || [];
  if (slug && FAQ_JOURNAL[slug]) faqs = FAQ_JOURNAL[slug];
  if (faqs.length > 0) {
    return faqs.map(faq => ({ question: faq.q, answer: faq.a }));
  }
  return [
    { question: `Is ${h} safe for travellers?`, answer: `Yes, when planned correctly. We ensure you experience the joy of ${h} while staying comfortable, with vetted guides, private transport and carefully chosen viewing spots.` },
    { question: `When is the best time to see ${h}?`, answer: `Dates for ${h} shift slightly each year based on the calendar. We confirm the exact dates for your travel window and secure your places well in advance.` },
    { question: `How do I get a good view of ${h}?`, answer: `We arrange private terraces, quiet boats, or reserved seating depending on the festival, so you can step into the celebration and step back when you need a breather.` }
  ];
}

function getDestFaqs(h, slug) {
  let faqs = [];
  if (slug && FAQ_DEST[slug]) {
    faqs = FAQ_DEST[slug];
  }
  if (faqs.length > 0) {
    return faqs.map(faq => ({ question: faq.q, answer: faq.a }));
  }
  return [
    { question: `When is the best time to visit ${h}?`, answer: `The best time to visit ${h} is October to April, when the weather is most comfortable for travel. Your curator will fine-tune the timing around your dates and the experiences you choose.` },
    { question: `Can I combine ${h} with other regions?`, answer: `Yes, and most travellers do. We often weave ${h} together with quieter regions or festivals, ensuring the journey flows easily without feeling rushed.` },
    { question: `What is the best way to travel around ${h}?`, answer: `Your journey includes a private, vetted driver and comfortable vehicle, so you travel at your own pace and can stop whenever you like.` }
  ];
}

const JOURNEYS = extractArray(/JOURNEYS\s*=\s*(\[.*?\]);/s);

async function run() {
  // Fetch media from CMS
  console.log("Fetching media from CMS...");
  const { data: media, error: mediaError } = await supabase.from('media').select('file_url');
  if (mediaError) {
    console.error("Error fetching media:", mediaError);
    process.exit(1);
  }
  
  if (!media || media.length === 0) {
    console.log("⚠️ WARNING: 0 images found in your CMS Media Library.");
    console.log("Please go to your Admin Panel (/admin/media) and upload your images first!");
    console.log("Until you upload images, journeys and pages will have blank grey boxes.");
  } else {
    console.log(`✅ Found ${media.length} images in your CMS Media Library. Mapping them to content...`);
  }

  const mediaUrls = media && media.length > 0 ? media.map(m => m.file_url) : [""];
  let mediaIndex = 0;
  function getNextMedia() {
    const url = mediaUrls[mediaIndex % mediaUrls.length];
    mediaIndex++;
    return url;
  }

  function getBestImage(title, category) {
    const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    let match = mediaUrls.find(url => url.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normalizedTitle));
    if (match) return match;

    match = mediaUrls.find(url => url.toLowerCase().includes(category.toLowerCase()));
    if (match) return match;

    return getNextMedia();
  }

  const pagesToUpsert = [];

  EXPERIENCES.forEach((e, i) => {
    const img = getBestImage(e.h, "experience");
    const blocks = [
      { id: `e${i+1}-hero`, type: "Hero", data: { headline: e.h, subheadline: e.lede, backgroundImage: img, ctaText: "Plan This Experience", ctaLink: "/enquire" } },
      { id: `e${i+1}-tiles`, type: "Tiles", data: { heading: "What you might do", tiles: e.moments.map(m => ({ title: m[0], description: m[1] })) } },
      { id: `e${i+1}-places`, type: "Place Chips", data: { heading: "Best enjoyed in", places: e.places.map(p => ({ name: p[0], region: p[1] })) } },
      { id: `e${i+1}-faq`, type: "FAQ", data: { heading: "Questions, answered simply", subtitle: `The practical questions about ${e.h}, answered in plain English.`, items: getExpFaqs(e.h) } },
      { id: `e${i+1}-cta`, type: "CTA Banner", data: { headline: "Make it yours", body: "Every experience is shaped around your pace and your people. Tell us what you have in mind.", buttonLabel: "Design this experience", buttonLink: "/enquire" } }
    ];
    pagesToUpsert.push({
      title: e.h,
      slug: `experience-${e.slug}`,
      type: 'Category',
      status: 'Published',
      content: blocks,
      seo_meta: { title: `${e.h} | MANNYAM`, description: e.lede, canonical_url: `https://mannyam.in/experience-${e.slug}` }
    });
  });

  FESTIVALS.forEach((f, i) => {
    const img = getBestImage(f.h, "festival");
    const blocks = [
      { id: `f${i+1}-hero`, type: "Hero", data: { headline: f.h, subheadline: f.lede, backgroundImage: img, ctaText: "Plan My Journey", ctaLink: "/enquire" } },
      { id: `f${i+1}-facts`, type: "Fact Bar", data: { facts: [{ label: "When", value: f.when }, { label: "Where", value: f.where }] } },
      { id: `f${i+1}-tiles`, type: "Tiles", data: { heading: "How we celebrate it with you", tiles: f.moments.map(m => ({ title: m[0], description: m[1] })) } },
      { id: `f${i+1}-places`, type: "Place Chips", data: { heading: "Best cities", places: f.places.map(p => ({ name: p[0], region: p[1] })) } },
      { id: `f${i+1}-faq`, type: "FAQ", data: { heading: "Questions, answered simply", subtitle: `The practical questions about visiting India for ${f.h}, answered in plain English.`, items: getFestFaqs(f.h, f.slug) } },
      { id: `f${i+1}-related`, type: "Related Pages", data: { heading: "Related Journeys" } },
      { id: `f${i+1}-cta`, type: "CTA Banner", data: { headline: "Join the celebration", body: "We arrange the timing and details. Tell us your travel window.", buttonLabel: "Plan my journey", buttonLink: "/enquire" } }
    ];
    pagesToUpsert.push({
      title: f.h,
      slug: `festival-${f.slug}`,
      type: 'Category',
      status: 'Published',
      content: blocks,
      seo_meta: { title: `${f.h} | MANNYAM`, description: f.lede, canonical_url: `https://mannyam.in/festival-${f.slug}` }
    });
  });

  DESTINATIONS.forEach((d, i) => {
    const img = getBestImage(d.h, "destination");
    const blocks = [
      { id: `d${i+1}-hero`, type: "Hero", data: { headline: d.h, subheadline: d.lede, backgroundImage: img, ctaText: "Plan My Journey", ctaLink: "/enquire" } },
      { id: `d${i+1}-facts`, type: "Fact Bar", data: { facts: [{ label: "Best season", value: d.season }] } },
      { id: `d${i+1}-tiles`, type: "Tiles", data: { heading: "What you might do", tiles: d.moments.map(m => ({ title: m[0], description: m[1] })) } },
      { id: `d${i+1}-places`, type: "Place Chips", data: { heading: "Key places", places: d.places.map(p => ({ name: p[0], region: p[1] })) } },
      { id: `d${i+1}-faq`, type: "FAQ", data: { heading: "Questions, answered simply", subtitle: `The practical questions about visiting ${d.h}, answered in plain English.`, items: getDestFaqs(d.h, d.slug) } },
      { id: `d${i+1}-related`, type: "Related Pages", data: { heading: "Related Journeys" } },
      { id: `d${i+1}-cta`, type: "CTA Banner", data: { headline: `Your ${d.h}, your way`, body: "Combine regions, or go deep into one.", buttonLabel: `Plan my ${d.h} journey`, buttonLink: "/enquire" } }
    ];
    pagesToUpsert.push({
      title: d.h,
      slug: `destination-${d.slug}`,
      type: 'Category',
      status: 'Published',
      content: blocks,
      seo_meta: { title: `${d.h} Travel | MANNYAM`, description: d.lede, canonical_url: `https://mannyam.in/destination-${d.slug}` }
    });
  });

  console.log(`Upserting ${pagesToUpsert.length} pages with dynamic FAQs and CMS Media...`);
  const { error: pageError } = await supabase.from('pages').upsert(pagesToUpsert, { onConflict: 'slug' });
  if (pageError) {
    console.error("Error upserting pages:", pageError);
  } else {
    console.log("Successfully upserted all pages to Supabase!");
  }

  // Push Journeys to packages
  console.log("Upserting Journeys to packages...");
  for (const j of JOURNEYS) {
    let mappedType = 'Destination';
    if (j.type === 'festival' || j.slug.includes('holi') || j.slug.includes('diwali') || j.slug.includes('dussehra')) mappedType = 'Festival';
    
    const availability = { tag: j.tag, regions: j.regions, includes: j.incl };
    const itinerary = j.days.map((d, index) => ({ day: index + 1, title: d[0], description: d[1] }));
    const img = getBestImage(j.h, mappedType);

    const pkg = {
      title: j.h,
      slug: j.slug,
      type: mappedType,
      description: j.intro,
      itinerary: itinerary,
      availability: availability,
      featured_image_url: img,
      seo_meta: { title: `${j.h} | MANNYAM Journey`, description: j.intro }
    };

    const { error: pkgError } = await supabase.from('packages').upsert(pkg, { onConflict: 'slug' });
    if (pkgError) {
      console.error(`Error inserting journey ${j.slug}:`, pkgError);
    }
  }
  console.log("Successfully upserted Journeys with CMS Media!");
}

run();
