/**
 * Generates FAQ items for journey detail pages.
 * Exact questions and answers from Manyam frontend.html faqJourney().
 * Hardcoded per slug to match the approved design precisely.
 */

interface FaqItem {
  question: string;
  answer: string;
}

interface PackageData {
  title: string;
  slug: string;
  type: string;
}

const JOURNEY_FAQS: Record<string, FaqItem[]> = {
  "palaces-of-the-north": [
    { question: "How long is the Palaces of the North journey?", answer: "Palaces of the North is a 12 days private journey. The pace is unhurried by design, and we can shorten or extend it to suit your time in India." },
    { question: "Which places does Palaces of the North cover?", answer: "This journey travels through Delhi, Agra, Jaipur, Jodhpur, Udaipur. We plan every transfer between them, so your Palaces of the North trip flows smoothly from one place to the next." },
    { question: "What is included in Palaces of the North?", answer: "Your Palaces of the North itinerary includes eleven nights in palace and heritage stays, private car with a vetted driver throughout, a dedicated curator reachable at all times, and more. Everything is private and handled for you from arrival to departure." },
    { question: "Can I customise the Palaces of the North itinerary?", answer: "Absolutely. Take Palaces of the North as it is, or treat it as a starting point and reshape the route, pace and stays with your curator until it feels entirely your own." },
    { question: "When is the best time to take this journey?", answer: "Palaces of the North is best enjoyed in the cooler, clearer months (October to March), though the ideal window depends on the regions involved. We will confirm the right timing for your dates." },
    { question: "How do I book the Palaces of the North journey?", answer: "Send us a note through the <a href=\"/enquire\">enquiry form</a> or ask the concierge. A real curator replies within a day with a tailored outline and clear next steps. No obligation." },
  ],
  "green-kerala": [
    { question: "How long is the Green Kerala & the Ghats journey?", answer: "Green Kerala & the Ghats is a 9 days private journey. The pace is unhurried by design, and we can shorten or extend it to suit your time in India." },
    { question: "Which places does Green Kerala & the Ghats cover?", answer: "This journey travels through Kochi, Munnar, Backwaters, Kovalam. We plan every transfer between them, so your Green Kerala trip flows smoothly from one place to the next." },
    { question: "What is included in Green Kerala & the Ghats?", answer: "Your Green Kerala itinerary includes eight characterful stays and one houseboat night, private transport with a trusted driver, a dedicated curator throughout, and more. Everything is private and handled for you from arrival to departure." },
    { question: "Can I customise the Green Kerala itinerary?", answer: "Absolutely. Take Green Kerala & the Ghats as it is, or treat it as a starting point and reshape the route, pace and stays with your curator until it feels entirely your own." },
    { question: "When is the best time to take this journey?", answer: "Green Kerala & the Ghats is best enjoyed in the cooler months (September to March), though the ideal window depends on the regions involved. We will confirm the right timing for your dates." },
    { question: "How do I book the Green Kerala & the Ghats journey?", answer: "Send us a note through the <a href=\"/enquire\">enquiry form</a> or ask the concierge. A real curator replies within a day with a tailored outline and clear next steps. No obligation." },
  ],
  "ladakh-high-passes": [
    { question: "How long is the Ladakh & the High Passes journey?", answer: "Ladakh & the High Passes is a 10 days private journey. The pace is unhurried by design, and we can shorten or extend it to suit your time in India." },
    { question: "Which places does Ladakh & the High Passes cover?", answer: "This journey travels through Leh, Nubra, Pangong, Monasteries. We plan every transfer between them, so your Ladakh trip flows smoothly from one place to the next." },
    { question: "What is included in Ladakh & the High Passes?", answer: "Your Ladakh itinerary includes nine mountain lodges and one night under canvas, private vehicle suited to the terrain, a dedicated curator and careful altitude planning, and more. Everything is private and handled for you from arrival to departure." },
    { question: "Can I customise the Ladakh & the High Passes itinerary?", answer: "Absolutely. Take Ladakh & the High Passes as it is, or treat it as a starting point and reshape the route, pace and stays with your curator until it feels entirely your own." },
    { question: "When is the best time to take this journey?", answer: "Ladakh & the High Passes is best enjoyed from May to September when the passes are open and the weather is clear. We will confirm the right timing for your dates." },
    { question: "How do I book the Ladakh & the High Passes journey?", answer: "Send us a note through the <a href=\"/enquire\">enquiry form</a> or ask the concierge. A real curator replies within a day with a tailored outline and clear next steps. No obligation." },
  ],
  "ganges-and-beyond": [
    { question: "How long is the The Ganges & Beyond journey?", answer: "The Ganges & Beyond is a 7 days private journey. The pace is unhurried by design, and we can shorten or extend it to suit your time in India." },
    { question: "Which places does The Ganges & Beyond cover?", answer: "This journey travels through Varanasi, Rishikesh, Foothills. We plan every transfer between them, so your Ganges trip flows smoothly from one place to the next." },
    { question: "What is included in The Ganges & Beyond?", answer: "Your Ganges & Beyond itinerary includes six riverside and foothill stays, private transport and internal flights, a dedicated curator throughout, and more. Everything is private and handled for you from arrival to departure." },
    { question: "Can I customise The Ganges & Beyond itinerary?", answer: "Absolutely. Take The Ganges & Beyond as it is, or treat it as a starting point and reshape the route, pace and stays with your curator until it feels entirely your own." },
    { question: "When is the best time to take this journey?", answer: "The Ganges & Beyond is best enjoyed in the cooler, clearer months (October to March), though the ideal window depends on the regions involved. We will confirm the right timing for your dates." },
    { question: "How do I book The Ganges & Beyond journey?", answer: "Send us a note through the <a href=\"/enquire\">enquiry form</a> or ask the concierge. A real curator replies within a day with a tailored outline and clear next steps. No obligation." },
  ],
  "colours-of-holi": [
    { question: "How long is the Colours of Holi journey?", answer: "Colours of Holi is an 8 days private journey. The pace is unhurried by design, and we can shorten or extend it to suit your time in India." },
    { question: "Which places does Colours of Holi cover?", answer: "This journey travels through Delhi, Mathura, Vrindavan, Jaipur. We plan every transfer between them, so your Colours of Holi trip flows smoothly from one place to the next." },
    { question: "What is included in Colours of Holi?", answer: "Your Colours of Holi itinerary includes seven heritage and palace stays, a local Holi host and a calm, safe vantage point, private car with a vetted driver, and more. Everything is private and handled for you from arrival to departure." },
    { question: "Can I customise the Colours of Holi itinerary?", answer: "Absolutely. Take Colours of Holi as it is, or treat it as a starting point and reshape the route, pace and stays with your curator until it feels entirely your own." },
    { question: "When is the best time to take this journey?", answer: "As a festival journey, Colours of Holi is timed to the celebration itself (March each year), so the dates are set by the festival. We will confirm the right timing for your dates." },
    { question: "How do I book the Colours of Holi journey?", answer: "Send us a note through the <a href=\"/enquire\">enquiry form</a> or ask the concierge. A real curator replies within a day with a tailored outline and clear next steps. No obligation." },
  ],
  "lights-of-diwali": [
    { question: "How long is the Lights of Diwali journey?", answer: "Lights of Diwali is a 9 days private journey. The pace is unhurried by design, and we can shorten or extend it to suit your time in India." },
    { question: "Which places does Lights of Diwali cover?", answer: "This journey travels through Jaipur, Udaipur, Varanasi. We plan every transfer between them, so your Lights of Diwali trip flows smoothly from one place to the next." },
    { question: "What is included in Lights of Diwali?", answer: "Your Lights of Diwali itinerary includes eight stays including riverside and palace, a family Diwali welcome, private transport and an internal flight, and more. Everything is private and handled for you from arrival to departure." },
    { question: "Can I customise the Lights of Diwali itinerary?", answer: "Absolutely. Take Lights of Diwali as it is, or treat it as a starting point and reshape the route, pace and stays with your curator until it feels entirely your own." },
    { question: "When is the best time to take this journey?", answer: "As a festival journey, Lights of Diwali is timed to the celebration itself (October to November each year), so the dates are set by the festival. We will confirm the right timing for your dates." },
    { question: "How do I book the Lights of Diwali journey?", answer: "Send us a note through the <a href=\"/enquire\">enquiry form</a> or ask the concierge. A real curator replies within a day with a tailored outline and clear next steps. No obligation." },
  ],
  "royal-dussehra": [
    { question: "How long is the Royal Dussehra of Mysuru journey?", answer: "Royal Dussehra of Mysuru is a 6 days private journey. The pace is unhurried by design, and we can shorten or extend it to suit your time in India." },
    { question: "Which places does Royal Dussehra of Mysuru cover?", answer: "This journey travels through Bengaluru, Mysuru. We plan every transfer between them, so your Royal Dussehra trip flows smoothly from one place to the next." },
    { question: "What is included in Royal Dussehra of Mysuru?", answer: "Your Royal Dussehra itinerary includes five heritage and palace stays, reserved viewing for the procession, private car with a vetted driver, and more. Everything is private and handled for you from arrival to departure." },
    { question: "Can I customise the Royal Dussehra itinerary?", answer: "Absolutely. Take Royal Dussehra of Mysuru as it is, or treat it as a starting point and reshape the route, pace and stays with your curator until it feels entirely your own." },
    { question: "When is the best time to take this journey?", answer: "As a festival journey, Royal Dussehra of Mysuru is timed to the celebration itself (October each year), so the dates are set by the festival. We will confirm the right timing for your dates." },
    { question: "How do I book the Royal Dussehra of Mysuru journey?", answer: "Send us a note through the <a href=\"/enquire\">enquiry form</a> or ask the concierge. A real curator replies within a day with a tailored outline and clear next steps. No obligation." },
  ],
};

// Generic fallback for any journey not in the hardcoded map
function buildGenericFaq(pkg: PackageData): FaqItem[] {
  const title = pkg.title;
  const isFestival = pkg.type === "Festival";

  return [
    { question: `How long is the ${title} journey?`, answer: `${title} is a private journey of several days. The pace is unhurried by design, and we can shorten or extend it to suit your time in India.` },
    { question: `Which places does ${title} cover?`, answer: `This journey travels through multiple regions across India. We plan every transfer between them, so your ${title} trip flows smoothly from one place to the next.` },
    { question: `What is included in ${title}?`, answer: `Your ${title} itinerary includes private stays, a dedicated curator and expert local guides, and more. Everything is private and handled for you from arrival to departure.` },
    { question: `Can I customise the ${title} itinerary?`, answer: `Absolutely. Take ${title} as it is, or treat it as a starting point and reshape the route, pace and stays with your curator until it feels entirely your own.` },
    { question: `When is the best time to take this journey?`, answer: isFestival ? `As a festival journey, ${title} is timed to the celebration itself, so the dates are set by the festival each year. We will confirm the right timing for your dates.` : `${title} is best enjoyed in the cooler, clearer months, though the ideal window depends on the regions involved. We will confirm the right timing for your dates.` },
    { question: `How do I book the ${title} journey?`, answer: `Send us a note through the <a href="/enquire">enquiry form</a> or ask the concierge. A real curator replies within a day with a tailored outline and clear next steps. No obligation.` },
  ];
}

export function generateJourneyFaq(pkg: PackageData): FaqItem[] {
  return JOURNEY_FAQS[pkg.slug] || buildGenericFaq(pkg);
}
