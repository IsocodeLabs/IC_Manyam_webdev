const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

// Dynamic FAQ Generators
function getExpFaqs(h) {
  return [
    { question: `What kinds of ${h.toLowerCase()} experiences can I have in India?`, answer: `From culture and heritage to food, wildlife, spiritual travel, royal evenings and honeymoons, our India experiences let you travel by the feeling you are after. Each ${h.toLowerCase()} journey is private and tailor-made.` },
    { question: `Can I combine ${h.toLowerCase()} with different experiences in one trip?`, answer: `Yes, and most travellers do. We weave heritage, food, nature and quiet time into a single journey that flows at your pace, rather than a fixed package.` },
    { question: `Can I customise a ready-made ${h.toLowerCase()} journey?`, answer: `Yes. Every journey is a starting point. Adjust the route, pace, stays and experiences with your curator until it feels entirely your own.` },
    { question: `Are flights and hotels included?`, answer: `Journeys include carefully chosen stays, private transport, guides and the ${h.toLowerCase()} experiences described. We can also arrange internal flights and advise on international ones.` }
  ];
}

function getFestFaqs(h) {
  return [
    { question: `Is ${h} safe for travellers?`, answer: `Yes, when planned correctly. We ensure you experience the joy of ${h} while staying comfortable, with vetted guides, private transport and carefully chosen viewing spots.` },
    { question: `How far in advance should I plan a ${h} trip?`, answer: `At least six to nine months. The best heritage stays and guides book out quickly around major festivals like ${h}.` },
    { question: `Will ${h} be too crowded?`, answer: `Festivals are busy, but we balance the energy of the crowds with quiet retreats. You can join the heart of the action when you want, and step back when you need to.` },
    { question: `Can I combine ${h} with a longer journey?`, answer: `Absolutely. ${h} is often the focal point of a longer journey through India, giving you a balance of celebration and slow travel.` }
  ];
}

function getDestFaqs(h) {
  return [
    { question: `When is the best time to visit ${h}?`, answer: `The best time to visit ${h} is October to April, when the weather is most comfortable for travel. Your curator will fine-tune the timing around your dates and the experiences you choose.` },
    { question: `What are the must-see places in ${h}?`, answer: `While the classic landmarks are spectacular, we also guide you to the quieter, lesser-known corners of ${h} that most travellers miss.` },
    { question: `How many days do I need in ${h}?`, answer: `We recommend spending at least three to four nights in each place to truly absorb it. A two-week journey comfortably covers the highlights of ${h} at a relaxed pace.` },
    { question: `Is ${h} a good destination for families and couples?`, answer: `Yes, ${h} offers incredible experiences for both families and couples, tailored to your preferred pace and style of travel.` },
    { question: `What experiences can I have in ${h}?`, answer: `From private heritage walks and culinary masterclasses to quiet nature retreats, ${h} offers a rich variety of experiences.` },
    { question: `How do I plan a private ${h} tour?`, answer: `Simply send a note through our enquiry form. A curator will reply within a day to begin designing your bespoke ${h} journey.` }
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
      { id: `f${i+1}-faq`, type: "FAQ", data: { heading: "Questions, answered simply", subtitle: `The practical questions about visiting India for ${f.h}, answered in plain English.`, items: getFestFaqs(f.h) } },
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
      { id: `d${i+1}-faq`, type: "FAQ", data: { heading: "Questions, answered simply", subtitle: `The practical questions about visiting ${d.h}, answered in plain English.`, items: getDestFaqs(d.h) } },
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
