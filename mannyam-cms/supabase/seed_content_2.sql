-- ============================================================================
-- MANNYAM CMS - Content Seed Part 2 (with rich block types matching frontend.html)
-- Uses: Hero, Tiles, Fact Bar, Place Chips, CTA Banner, FAQ
-- Run AFTER seed_content.sql. Uses $$ dollar-quoting.
-- ============================================================================

-- First clean any previous partial inserts
DELETE FROM public.pages WHERE slug LIKE 'experience-%';
DELETE FROM public.pages WHERE slug LIKE 'festival-%';
DELETE FROM public.pages WHERE slug LIKE 'destination-%';

-- ─── EXPERIENCES ─────────────────────────────────────────────────────────────

INSERT INTO public.pages (title, slug, type, status, content, seo_meta) VALUES
('Culture and Heritage', 'experience-heritage', 'Category', 'Published',
$$[
{"id":"e1-hero","type":"Hero","data":{"headline":"Culture and Heritage","subheadline":"Walk the old quarters where centuries still shape daily life, on foot, by cycle or by tuk-tuk.","backgroundImage":"https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=75","ctaText":"Plan This Experience","ctaLink":"/enquire"}},
{"id":"e1-tiles","type":"Tiles","data":{"heading":"What you might do","tiles":[{"title":"Heritage walks","description":"Hidden lanes, carved facades and the stories behind them."},{"title":"Royal pasts","description":"Forts and palaces, with the families who keep them."},{"title":"Living traditions","description":"Crafts and rituals still practised by hand."}]}},
{"id":"e1-places","type":"Place Chips","data":{"heading":"Best enjoyed in","places":[{"name":"Jaipur","region":"Rajasthan"},{"name":"Udaipur","region":"Rajasthan"},{"name":"Madurai","region":"Tamil Nadu"}]}},
{"id":"e1-cta","type":"CTA Banner","data":{"headline":"Make it yours","body":"Every experience is shaped around your pace and your people. Tell us what you have in mind.","buttonLabel":"Design this experience","buttonLink":"/enquire"}},
{"id":"e1-faq","type":"FAQ","data":{"heading":"Questions, answered simply","items":[{"question":"What is a culture and heritage trip in India?","answer":"A private, tailor-made journey designed around the things you love most. Every day is planned for you and paced exactly as you like."},{"question":"Where in India is best for heritage travel?","answer":"Some of the best places are Jaipur, Udaipur and Madurai. We pair the right regions for your dates."},{"question":"How do I plan a private heritage journey?","answer":"Start with our <a href='/enquire'>enquiry form</a>. A curator replies within a day with a first outline."}]}}
]$$::jsonb,
$${"title":"Culture and Heritage Journeys | MANNYAM","description":"Walk the old quarters where centuries still shape daily life. Private heritage travel across India.","canonical_url":"https://mannyam.in/experience-heritage"}$$::jsonb),

('Local Life and Community', 'experience-local-life', 'Category', 'Published',
$$[
{"id":"e2-hero","type":"Hero","data":{"headline":"Local Life and Community","subheadline":"Meet India through its people, in villages, homes and on short local train journeys.","backgroundImage":"https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=75","ctaText":"Plan This Experience","ctaLink":"/enquire"}},
{"id":"e2-tiles","type":"Tiles","data":{"heading":"What you might do","tiles":[{"title":"Home meals","description":"Shared food and easy conversation in a family home."},{"title":"Village days","description":"Rural walks and women-led initiatives, warm and human."},{"title":"Slow trains","description":"A short ride alongside locals, the real countryside passing by."}]}},
{"id":"e2-places","type":"Place Chips","data":{"heading":"Best enjoyed in","places":[{"name":"Kutch","region":"Gujarat"},{"name":"Wayanad","region":"Kerala"},{"name":"Khasi Hills","region":"Meghalaya"}]}},
{"id":"e2-cta","type":"CTA Banner","data":{"headline":"Make it yours","body":"Tell us what moves you and we will shape the rest.","buttonLabel":"Design this experience","buttonLink":"/enquire"}}
]$$::jsonb,
$${"title":"Local Life and Community | MANNYAM","description":"Meet India through its people.","canonical_url":"https://mannyam.in/experience-local-life"}$$::jsonb),

('Food and Culinary Stories', 'experience-food', 'Category', 'Published',
$$[
{"id":"e3-hero","type":"Hero","data":{"headline":"Food and Culinary Stories","subheadline":"Every meal tells a story of geography, history and tradition. Taste your way through it.","backgroundImage":"https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=75","ctaText":"Plan This Experience","ctaLink":"/enquire"}},
{"id":"e3-tiles","type":"Tiles","data":{"heading":"What you might do","tiles":[{"title":"Food walks","description":"Street kitchens and market stalls with someone who knows them."},{"title":"Cook and dine","description":"A hands-on lesson, then a long table with the family."},{"title":"Regional tables","description":"From coastal spice to royal kitchens, region by region."}]}},
{"id":"e3-places","type":"Place Chips","data":{"heading":"Best enjoyed in","places":[{"name":"Old Delhi","region":"Delhi"},{"name":"Chettinad","region":"Tamil Nadu"},{"name":"Lucknow","region":"Uttar Pradesh"}]}},
{"id":"e3-cta","type":"CTA Banner","data":{"headline":"Taste India your way","body":"Tell us your appetite and we will design the rest.","buttonLabel":"Plan my culinary journey","buttonLink":"/enquire"}}
]$$::jsonb,
$${"title":"Food and Culinary Stories | MANNYAM","description":"Taste your way through India with private culinary journeys.","canonical_url":"https://mannyam.in/experience-food"}$$::jsonb),

('Spiritual and Soulful', 'experience-spiritual', 'Category', 'Published',
$$[
{"id":"e4-hero","type":"Hero","data":{"headline":"Spiritual and Soulful","subheadline":"Witness rituals that have flowed unchanged for centuries, and find a little quiet of your own.","backgroundImage":"https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=1200&q=75","ctaText":"Plan This Experience","ctaLink":"/enquire"}},
{"id":"e4-tiles","type":"Tiles","data":{"heading":"What you might do","tiles":[{"title":"River dawns","description":"Yoga and prayer by sacred water as the day begins."},{"title":"Ceremonial boats","description":"A slow row at dusk, with live music on the water."},{"title":"Temples and ghats","description":"Time with priests and practitioners, gently guided."}]}},
{"id":"e4-places","type":"Place Chips","data":{"heading":"Best enjoyed in","places":[{"name":"Rishikesh","region":"Uttarakhand"},{"name":"Varanasi","region":"Uttar Pradesh"},{"name":"Madurai","region":"Tamil Nadu"}]}},
{"id":"e4-cta","type":"CTA Banner","data":{"headline":"Find your quiet","body":"Every spiritual journey is shaped around you.","buttonLabel":"Plan my journey","buttonLink":"/enquire"}}
]$$::jsonb,
$${"title":"Spiritual and Soulful Journeys | MANNYAM","description":"Private spiritual travel across India.","canonical_url":"https://mannyam.in/experience-spiritual"}$$::jsonb),

('Nature and Wildlife', 'experience-wildlife', 'Category', 'Published',
$$[
{"id":"e5-hero","type":"Hero","data":{"headline":"Nature and Wildlife","subheadline":"Reconnect with the wild through careful, responsible encounters led by expert naturalists.","backgroundImage":"https://images.unsplash.com/photo-1615824996195-f780bba7cfab?auto=format&fit=crop&w=1200&q=75","ctaText":"Plan This Experience","ctaLink":"/enquire"}},
{"id":"e5-tiles","type":"Tiles","data":{"heading":"What you might do","tiles":[{"title":"Tiger country","description":"Dawn drives in the great national parks."},{"title":"Plantation walks","description":"Tea and spice trails through deep green hills."},{"title":"Jungle table","description":"Lunch in the forest after a morning safari."}]}},
{"id":"e5-places","type":"Place Chips","data":{"heading":"Best enjoyed in","places":[{"name":"Ranthambore","region":"Rajasthan"},{"name":"Kaziranga","region":"Assam"},{"name":"Periyar","region":"Kerala"}]}},
{"id":"e5-cta","type":"CTA Banner","data":{"headline":"Into the wild","body":"Responsible encounters, planned with care.","buttonLabel":"Plan my wildlife journey","buttonLink":"/enquire"}}
]$$::jsonb,
$${"title":"Nature and Wildlife | MANNYAM","description":"Responsible wildlife encounters in India.","canonical_url":"https://mannyam.in/experience-wildlife"}$$::jsonb),

('Royal and Exclusive', 'experience-royal', 'Category', 'Published',
$$[
{"id":"e6-hero","type":"Hero","data":{"headline":"Royal and Exclusive","subheadline":"Step into India's regal past with moments once reserved for royalty alone.","backgroundImage":"https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=75","ctaText":"Plan This Experience","ctaLink":"/enquire"}},
{"id":"e6-tiles","type":"Tiles","data":{"heading":"What you might do","tiles":[{"title":"Vintage drives","description":"A classic car through the old city at golden hour."},{"title":"Lakeside high tea","description":"An exclusive table set just for you."},{"title":"Private dinners","description":"A historic courtyard, candlelight and nobody else."}]}},
{"id":"e6-places","type":"Place Chips","data":{"heading":"Best enjoyed in","places":[{"name":"Udaipur","region":"Rajasthan"},{"name":"Jodhpur","region":"Rajasthan"},{"name":"Mysuru","region":"Karnataka"}]}},
{"id":"e6-cta","type":"CTA Banner","data":{"headline":"Live like royalty","body":"Every royal experience is private and yours alone.","buttonLabel":"Plan my royal journey","buttonLink":"/enquire"}}
]$$::jsonb,
$${"title":"Royal and Exclusive | MANNYAM","description":"Moments once reserved for royalty.","canonical_url":"https://mannyam.in/experience-royal"}$$::jsonb),

('Arts Music and Performance', 'experience-arts', 'Category', 'Published',
$$[
{"id":"e7-hero","type":"Hero","data":{"headline":"Arts, Music and Performance","subheadline":"Discover India's creative soul, from classical musicians to regional dance and martial forms.","backgroundImage":"https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=75","ctaText":"Plan This Experience","ctaLink":"/enquire"}},
{"id":"e7-tiles","type":"Tiles","data":{"heading":"What you might do","tiles":[{"title":"Private recitals","description":"An intimate performance by masters of a classical form."},{"title":"Art districts","description":"The studios and lanes where India still makes by hand."},{"title":"Stage traditions","description":"Kathakali, Kalbeliya and more, up close."}]}},
{"id":"e7-places","type":"Place Chips","data":{"heading":"Best enjoyed in","places":[{"name":"Kochi","region":"Kerala"},{"name":"Jaipur","region":"Rajasthan"},{"name":"Kolkata","region":"West Bengal"}]}},
{"id":"e7-cta","type":"CTA Banner","data":{"headline":"Feel the rhythm","body":"India's creative soul, arranged privately.","buttonLabel":"Plan my arts journey","buttonLink":"/enquire"}}
]$$::jsonb,
$${"title":"Arts Music and Performance | MANNYAM","description":"India's creative soul.","canonical_url":"https://mannyam.in/experience-arts"}$$::jsonb),

('Honeymoon and Romance', 'experience-honeymoon', 'Category', 'Published',
$$[
{"id":"e8-hero","type":"Hero","data":{"headline":"Honeymoon and Romance","subheadline":"However you picture it, India sets the scene for romance like nowhere else.","backgroundImage":"https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=75","ctaText":"Plan This Experience","ctaLink":"/enquire"}},
{"id":"e8-tiles","type":"Tiles","data":{"heading":"What you might do","tiles":[{"title":"Lake palaces","description":"A suite on the water and a boat to a private dinner."},{"title":"Desert nights","description":"Sundowners on the dunes and a sky full of stars."},{"title":"Backwater calm","description":"Just the two of you, drifting, with your own cook."}]}},
{"id":"e8-places","type":"Place Chips","data":{"heading":"Best enjoyed in","places":[{"name":"Udaipur","region":"Rajasthan"},{"name":"Jaisalmer","region":"Rajasthan"},{"name":"Alleppey","region":"Kerala"}]}},
{"id":"e8-cta","type":"CTA Banner","data":{"headline":"Your love story starts here","body":"India sets the scene for romance like nowhere else.","buttonLabel":"Plan our honeymoon","buttonLink":"/enquire"}}
]$$::jsonb,
$${"title":"Honeymoon and Romance | MANNYAM","description":"Private honeymoon journeys in India.","canonical_url":"https://mannyam.in/experience-honeymoon"}$$::jsonb);


-- ─── FESTIVALS ───────────────────────────────────────────────────────────────

INSERT INTO public.pages (title, slug, type, status, content, seo_meta) VALUES
('Holi', 'festival-holi', 'Category', 'Published',
$$[
{"id":"f1-hero","type":"Hero","data":{"headline":"Holi - Festival of Colour","subheadline":"The festival of colour, love and spring. A morning that turns whole towns into a swirl of pink, gold and laughter.","backgroundImage":"https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=75","ctaText":"Plan My Holi Journey","ctaLink":"/enquire"}},
{"id":"f1-facts","type":"Fact Bar","data":{"facts":[{"label":"When","value":"March"},{"label":"Where","value":"Mathura, Vrindavan, Barsana (UP); Jaipur, Udaipur (Rajasthan)"}]}},
{"id":"f1-tiles","type":"Tiles","data":{"heading":"How we celebrate it with you","tiles":[{"title":"The colour throw","description":"Join the crowds, or watch from a calm rooftop, as colour fills the air."},{"title":"Barsana traditions","description":"The famous, joyful Lathmar Holi in the towns near Mathura."},{"title":"A gentler Holi","description":"A private, family-style celebration if the crowds feel too much."}]}},
{"id":"f1-places","type":"Place Chips","data":{"heading":"Best cities","places":[{"name":"Mathura","region":"Uttar Pradesh"},{"name":"Vrindavan","region":"Uttar Pradesh"},{"name":"Barsana","region":"Uttar Pradesh"},{"name":"Jaipur","region":"Rajasthan"},{"name":"Udaipur","region":"Rajasthan"}]}},
{"id":"f1-cta","type":"CTA Banner","data":{"headline":"Make the celebration the heart of your trip","body":"Dates shift each year and the best spots fill early. Tell us your travel window.","buttonLabel":"Plan my Holi journey","buttonLink":"/enquire"}}
]$$::jsonb,
$${"title":"Holi Festival Journey | MANNYAM","description":"Join the festival of colour near Mathura with a trusted host.","canonical_url":"https://mannyam.in/festival-holi"}$$::jsonb),

('Diwali', 'festival-diwali', 'Category', 'Published',
$$[
{"id":"f2-hero","type":"Hero","data":{"headline":"Diwali - Festival of Lights","subheadline":"Lamps along every doorway, fireworks over the rivers and a warmth that fills the night.","backgroundImage":"https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=75","ctaText":"Plan My Diwali Journey","ctaLink":"/enquire"}},
{"id":"f2-facts","type":"Fact Bar","data":{"facts":[{"label":"When","value":"October to November"},{"label":"Where","value":"Varanasi, Jaipur, Udaipur, Amritsar"}]}},
{"id":"f2-tiles","type":"Tiles","data":{"heading":"How we celebrate it with you","tiles":[{"title":"Lamp-lit ghats","description":"Thousands of oil lamps float and glow along the river at Varanasi."},{"title":"City of light","description":"Jaipur and Udaipur dressed head to toe in light and colour."},{"title":"A family Diwali","description":"Sweets, prayers and lamps in a home that welcomes you in."}]}},
{"id":"f2-places","type":"Place Chips","data":{"heading":"Best cities","places":[{"name":"Varanasi","region":"Uttar Pradesh"},{"name":"Jaipur","region":"Rajasthan"},{"name":"Udaipur","region":"Rajasthan"},{"name":"Amritsar","region":"Punjab"}]}},
{"id":"f2-cta","type":"CTA Banner","data":{"headline":"Follow the lights","body":"We handle the timing, the travel and the crowds.","buttonLabel":"Plan my Diwali journey","buttonLink":"/enquire"}}
]$$::jsonb,
$${"title":"Diwali Festival Journey | MANNYAM","description":"Follow the festival of lights from Rajasthan to Varanasi.","canonical_url":"https://mannyam.in/festival-diwali"}$$::jsonb),

('Dussehra', 'festival-dussehra', 'Category', 'Published',
$$[
{"id":"f3-hero","type":"Hero","data":{"headline":"Dussehra - Triumph of Good","subheadline":"Royal processions, towering effigies and ancient street theatre.","backgroundImage":"https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=75","ctaText":"Plan My Journey","ctaLink":"/enquire"}},
{"id":"f3-facts","type":"Fact Bar","data":{"facts":[{"label":"When","value":"October"},{"label":"Where","value":"Mysuru, Kullu, Varanasi"}]}},
{"id":"f3-tiles","type":"Tiles","data":{"heading":"How we celebrate it with you","tiles":[{"title":"Mysuru Dasara","description":"The lit palace and a grand procession of elephants and music."},{"title":"Kullu's gods","description":"Hundreds of village deities carried together through the valley."},{"title":"Ramlila nights","description":"The old retelling of the Ramayana, performed across the city."}]}},
{"id":"f3-cta","type":"CTA Banner","data":{"headline":"Witness the triumph","body":"We arrange reserved views and the full cultural context.","buttonLabel":"Plan my Dussehra journey","buttonLink":"/enquire"}}
]$$::jsonb,
$${"title":"Dussehra Journey | MANNYAM","description":"Royal processions and ancient theatre.","canonical_url":"https://mannyam.in/festival-dussehra"}$$::jsonb),

('Durga Puja', 'festival-durga-puja', 'Category', 'Published',
$$[
{"id":"f4-hero","type":"Hero","data":{"headline":"Durga Puja - Art and Devotion","subheadline":"Whole neighbourhoods become open-air galleries of light, sculpture and devotion.","backgroundImage":"https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=75","ctaText":"Plan My Journey","ctaLink":"/enquire"}},
{"id":"f4-facts","type":"Fact Bar","data":{"facts":[{"label":"When","value":"October"},{"label":"Where","value":"Kolkata, West Bengal"}]}},
{"id":"f4-tiles","type":"Tiles","data":{"heading":"How we celebrate it with you","tiles":[{"title":"Pandal hopping","description":"Walk between extraordinary temporary art pavilions, each one different."},{"title":"The drums","description":"Live dhak drumming and dance that builds for days."},{"title":"River farewell","description":"The final, moving procession to the water."}]}},
{"id":"f4-cta","type":"CTA Banner","data":{"headline":"Art and devotion in Kolkata","body":"We guide you through the best pandals and arrange the timing.","buttonLabel":"Plan my Durga Puja journey","buttonLink":"/enquire"}}
]$$::jsonb,
$${"title":"Durga Puja Journey | MANNYAM","description":"Art and devotion in Kolkata.","canonical_url":"https://mannyam.in/festival-durga-puja"}$$::jsonb),

('Navratri and Garba', 'festival-navratri', 'Category', 'Published',
$$[
{"id":"f5-hero","type":"Hero","data":{"headline":"Navratri and Garba","subheadline":"Nine nights of rhythm. Great circles of dancers in mirror work and colour.","backgroundImage":"https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=75","ctaText":"Plan My Journey","ctaLink":"/enquire"}},
{"id":"f5-facts","type":"Fact Bar","data":{"facts":[{"label":"When","value":"October"},{"label":"Where","value":"Ahmedabad and Vadodara, Gujarat"}]}},
{"id":"f5-tiles","type":"Tiles","data":{"heading":"How we celebrate it with you","tiles":[{"title":"Learn the steps","description":"A gentle lesson before you join the circle yourself."},{"title":"The big grounds","description":"The energy of thousands dancing Garba and Dandiya together."},{"title":"Dress the part","description":"Traditional outfits arranged, so you feel part of it all."}]}},
{"id":"f5-cta","type":"CTA Banner","data":{"headline":"Nine nights of dance","body":"We arrange the outfits, the grounds, and the timing.","buttonLabel":"Plan my Navratri journey","buttonLink":"/enquire"}}
]$$::jsonb,
$${"title":"Navratri and Garba | MANNYAM","description":"Nine nights of dance in Gujarat.","canonical_url":"https://mannyam.in/festival-navratri"}$$::jsonb),

('Ganesh Chaturthi', 'festival-ganesh-chaturthi', 'Category', 'Published',
$$[
{"id":"f6-hero","type":"Hero","data":{"headline":"Ganesh Chaturthi","subheadline":"Streets full of music and colour as the elephant-headed god is welcomed and sent to the sea.","backgroundImage":"https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=75","ctaText":"Plan My Journey","ctaLink":"/enquire"}},
{"id":"f6-facts","type":"Fact Bar","data":{"facts":[{"label":"When","value":"August to September"},{"label":"Where","value":"Mumbai and Konkan coast, Maharashtra"}]}},
{"id":"f6-tiles","type":"Tiles","data":{"heading":"How we celebrate it with you","tiles":[{"title":"Welcome days","description":"Beautifully made idols and the joy of the opening processions."},{"title":"Coastal Konkan","description":"A quieter, village side of the festival along the coast."},{"title":"To the water","description":"The final procession to the sea, vast and full of feeling."}]}},
{"id":"f6-cta","type":"CTA Banner","data":{"headline":"Feel the city celebrate","body":"We place you safely in the heart of it.","buttonLabel":"Plan my journey","buttonLink":"/enquire"}}
]$$::jsonb,
$${"title":"Ganesh Chaturthi | MANNYAM","description":"Mumbai's biggest celebration.","canonical_url":"https://mannyam.in/festival-ganesh-chaturthi"}$$::jsonb),

('Pongal and Onam', 'festival-harvest', 'Category', 'Published',
$$[
{"id":"f7-hero","type":"Hero","data":{"headline":"Pongal and Onam","subheadline":"The south gives thanks. Floral carpets, boat races and feasts on banana leaves.","backgroundImage":"https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=75","ctaText":"Plan My Journey","ctaLink":"/enquire"}},
{"id":"f7-facts","type":"Fact Bar","data":{"facts":[{"label":"When","value":"January (Pongal) and August (Onam)"},{"label":"Where","value":"Tamil Nadu and Kerala"}]}},
{"id":"f7-tiles","type":"Tiles","data":{"heading":"How we celebrate it with you","tiles":[{"title":"Onam feast","description":"The grand Sadhya, dish after dish on a fresh banana leaf."},{"title":"Flower carpets","description":"Intricate Pookalam laid out across doorways and courtyards."},{"title":"Snake boats","description":"The thunder of Kerala's long racing boats on the water."}]}},
{"id":"f7-cta","type":"CTA Banner","data":{"headline":"Harvest and gratitude","body":"The south's most joyful celebrations, arranged for you.","buttonLabel":"Plan my journey","buttonLink":"/enquire"}}
]$$::jsonb,
$${"title":"Pongal and Onam | MANNYAM","description":"Harvest festivals of the south.","canonical_url":"https://mannyam.in/festival-harvest"}$$::jsonb),

('Celebration Shows', 'festival-celebration-shows', 'Category', 'Published',
$$[
{"id":"f8-hero","type":"Hero","data":{"headline":"Celebration Shows","subheadline":"Private evenings of folk dance, music and fire, arranged just for you, year round.","backgroundImage":"https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=75","ctaText":"Plan My Journey","ctaLink":"/enquire"}},
{"id":"f8-facts","type":"Fact Bar","data":{"facts":[{"label":"When","value":"All year"},{"label":"Where","value":"Rajasthan, Kerala, Gujarat"}]}},
{"id":"f8-tiles","type":"Tiles","data":{"heading":"What we arrange","tiles":[{"title":"Desert evenings","description":"Kalbeliya dancers and folk musicians under a Rajasthani sky."},{"title":"Kathakali up close","description":"The painted faces and slow drama of Kerala's great art form."},{"title":"Light and fire","description":"Drummers, lamps and movement, set in a courtyard or fort."}]}},
{"id":"f8-cta","type":"CTA Banner","data":{"headline":"Any night can be a celebration","body":"Tell us when and where, and we will arrange the performance.","buttonLabel":"Plan my evening","buttonLink":"/enquire"}}
]$$::jsonb,
$${"title":"Private Celebration Shows | MANNYAM","description":"Folk dance and music arranged for you year round.","canonical_url":"https://mannyam.in/festival-celebration-shows"}$$::jsonb);


-- ─── DESTINATIONS ────────────────────────────────────────────────────────────

INSERT INTO public.pages (title, slug, type, status, content, seo_meta) VALUES
('Rajasthan', 'destination-rajasthan', 'Category', 'Published',
$$[
{"id":"d1-hero","type":"Hero","data":{"headline":"Rajasthan","subheadline":"Desert forts, mirrored palaces and cities painted pink, blue and gold.","backgroundImage":"https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=75","ctaText":"Plan My Rajasthan Journey","ctaLink":"/enquire"}},
{"id":"d1-facts","type":"Fact Bar","data":{"facts":[{"label":"Best season","value":"October to March"}]}},
{"id":"d1-tiles","type":"Tiles","data":{"heading":"What you might do","tiles":[{"title":"Palace stays","description":"Sleep within working palaces in Udaipur and Jaipur."},{"title":"Blue Jodhpur","description":"Mehrangarh Fort at dawn, then the blue lanes below."},{"title":"Desert nights","description":"Sundowners on the dunes near Jaisalmer."}]}},
{"id":"d1-places","type":"Place Chips","data":{"heading":"Key places","places":[{"name":"Jaipur","region":"Pink City"},{"name":"Udaipur","region":"Lakes"},{"name":"Jodhpur","region":"Blue City"},{"name":"Jaisalmer","region":"Desert"}]}},
{"id":"d1-cta","type":"CTA Banner","data":{"headline":"Your Rajasthan, your way","body":"Combine regions, or go deep into one.","buttonLabel":"Plan my Rajasthan journey","buttonLink":"/enquire"}}
]$$::jsonb,
$${"title":"Rajasthan Travel | MANNYAM","description":"Private Rajasthan journeys through desert forts and lake palaces.","canonical_url":"https://mannyam.in/destination-rajasthan"}$$::jsonb),

('Kerala', 'destination-kerala', 'Category', 'Published',
$$[
{"id":"d2-hero","type":"Hero","data":{"headline":"Kerala","subheadline":"Backwater houseboats, spice hills and air that smells of cardamom.","backgroundImage":"https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=1200&q=75","ctaText":"Plan My Kerala Journey","ctaLink":"/enquire"}},
{"id":"d2-facts","type":"Fact Bar","data":{"facts":[{"label":"Best season","value":"September to March"}]}},
{"id":"d2-tiles","type":"Tiles","data":{"heading":"What you might do","tiles":[{"title":"On the water","description":"A private houseboat night with your own cook."},{"title":"Tea hills","description":"Walk the green slopes of Munnar with a grower."},{"title":"Old Kochi","description":"Harbour mornings among churches and fishing nets."}]}},
{"id":"d2-places","type":"Place Chips","data":{"heading":"Key places","places":[{"name":"Kochi","region":"Harbour"},{"name":"Munnar","region":"Tea hills"},{"name":"Alleppey","region":"Backwaters"}]}},
{"id":"d2-cta","type":"CTA Banner","data":{"headline":"India at the pace of water","body":"Palm-lined backwaters, tea hills and southern calm.","buttonLabel":"Plan my Kerala journey","buttonLink":"/enquire"}}
]$$::jsonb,
$${"title":"Kerala Travel | MANNYAM","description":"Private Kerala journeys through backwaters and spice hills.","canonical_url":"https://mannyam.in/destination-kerala"}$$::jsonb),

('The Himalayas', 'destination-himalayas', 'Category', 'Published',
$$[
{"id":"d3-hero","type":"Hero","data":{"headline":"The Himalayas","subheadline":"Ladakh, Spiti and the hill stations. Monasteries, high passes and clean silence.","backgroundImage":"https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=75","ctaText":"Plan My Himalayan Journey","ctaLink":"/enquire"}},
{"id":"d3-facts","type":"Fact Bar","data":{"facts":[{"label":"Best season","value":"May to September"}]}},
{"id":"d3-tiles","type":"Tiles","data":{"heading":"What you might do","tiles":[{"title":"Monastery dawn","description":"Morning prayers at Thiksey before the day begins."},{"title":"High passes","description":"A careful drive over the world's great mountain roads."},{"title":"Night skies","description":"Stars so clear the Milky Way feels close."}]}},
{"id":"d3-places","type":"Place Chips","data":{"heading":"Key places","places":[{"name":"Leh","region":"Ladakh"},{"name":"Nubra","region":"Valley"},{"name":"Spiti","region":"Highlands"}]}},
{"id":"d3-cta","type":"CTA Banner","data":{"headline":"Above the clouds","body":"Carefully paced, with time to acclimatise.","buttonLabel":"Plan my Himalayan journey","buttonLink":"/enquire"}}
]$$::jsonb,
$${"title":"Himalayan Travel | MANNYAM","description":"Private journeys through Ladakh and Spiti.","canonical_url":"https://mannyam.in/destination-himalayas"}$$::jsonb),

('Tamil Nadu', 'destination-tamil-nadu', 'Category', 'Published',
$$[
{"id":"d4-hero","type":"Hero","data":{"headline":"Tamil Nadu","subheadline":"Towering temple gateways, Chettinad mansions and the slow Coromandel coast.","backgroundImage":"https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=75","ctaText":"Plan My Journey","ctaLink":"/enquire"}},
{"id":"d4-facts","type":"Fact Bar","data":{"facts":[{"label":"Best season","value":"November to February"}]}},
{"id":"d4-tiles","type":"Tiles","data":{"heading":"What you might do","tiles":[{"title":"Temple dawns","description":"Inside a working temple as the first prayers begin."},{"title":"Chettinad tables","description":"A long lunch in a heritage mansion."},{"title":"Coastal calm","description":"Slow days by the sea in Pondicherry."}]}},
{"id":"d4-places","type":"Place Chips","data":{"heading":"Key places","places":[{"name":"Madurai","region":"Temples"},{"name":"Thanjavur","region":"Bronze"},{"name":"Pondicherry","region":"Coast"}]}},
{"id":"d4-cta","type":"CTA Banner","data":{"headline":"The heartland of temple culture","body":"Carved gateways that rise like mountains.","buttonLabel":"Plan my Tamil Nadu journey","buttonLink":"/enquire"}}
]$$::jsonb,
$${"title":"Tamil Nadu Travel | MANNYAM","description":"Towering temples and the Coromandel coast.","canonical_url":"https://mannyam.in/destination-tamil-nadu"}$$::jsonb),

('Varanasi and the Ganges', 'destination-varanasi', 'Category', 'Published',
$$[
{"id":"d5-hero","type":"Hero","data":{"headline":"Varanasi and the Ganges","subheadline":"The world's oldest living city. Dawn boats, fire rituals and lanes of incense.","backgroundImage":"https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=1200&q=75","ctaText":"Plan My Journey","ctaLink":"/enquire"}},
{"id":"d5-facts","type":"Fact Bar","data":{"facts":[{"label":"Best season","value":"October to March"}]}},
{"id":"d5-tiles","type":"Tiles","data":{"heading":"What you might do","tiles":[{"title":"River at first light","description":"A quiet boat as the city bathes and prays."},{"title":"Evening fire","description":"A reserved view of the Ganga Aarti."},{"title":"The first sermon","description":"A calm morning at Sarnath nearby."}]}},
{"id":"d5-places","type":"Place Chips","data":{"heading":"Key places","places":[{"name":"Varanasi","region":"The ghats"},{"name":"Sarnath","region":"Buddhist"}]}},
{"id":"d5-cta","type":"CTA Banner","data":{"headline":"Few places move a traveller more deeply","body":"One of the oldest lived-in cities on earth.","buttonLabel":"Plan my Varanasi journey","buttonLink":"/enquire"}}
]$$::jsonb,
$${"title":"Varanasi Travel | MANNYAM","description":"Dawn boats and fire rituals on the Ganges.","canonical_url":"https://mannyam.in/destination-varanasi"}$$::jsonb),

('The North-East', 'destination-north-east', 'Category', 'Published',
$$[
{"id":"d6-hero","type":"Hero","data":{"headline":"The North-East","subheadline":"Living-root bridges, tea gardens and tribal cultures far from any crowd.","backgroundImage":"https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=75","ctaText":"Plan My Journey","ctaLink":"/enquire"}},
{"id":"d6-facts","type":"Fact Bar","data":{"facts":[{"label":"Best season","value":"October to April"}]}},
{"id":"d6-tiles","type":"Tiles","data":{"heading":"What you might do","tiles":[{"title":"Root bridges","description":"Walk to bridges grown, not built, over generations."},{"title":"Village welcome","description":"Time with a Khasi or Naga family in the hills."},{"title":"Tea and rhino","description":"An Assam garden stay paired with Kaziranga."}]}},
{"id":"d6-places","type":"Place Chips","data":{"heading":"Key places","places":[{"name":"Shillong","region":"Meghalaya"},{"name":"Kaziranga","region":"Assam"},{"name":"Nagaland","region":"Hills"}]}},
{"id":"d6-cta","type":"CTA Banner","data":{"headline":"India's best-kept secret","body":"A green world far from any crowd.","buttonLabel":"Plan my North-East journey","buttonLink":"/enquire"}}
]$$::jsonb,
$${"title":"North-East India | MANNYAM","description":"Root bridges and tribal cultures.","canonical_url":"https://mannyam.in/destination-north-east"}$$::jsonb),

('Gujarat', 'destination-gujarat', 'Category', 'Published',
$$[
{"id":"d7-hero","type":"Hero","data":{"headline":"Gujarat","subheadline":"White salt deserts, artisan villages and the last of Asia's wild lions.","backgroundImage":"https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=75","ctaText":"Plan My Journey","ctaLink":"/enquire"}},
{"id":"d7-facts","type":"Fact Bar","data":{"facts":[{"label":"Best season","value":"November to February"}]}},
{"id":"d7-tiles","type":"Tiles","data":{"heading":"What you might do","tiles":[{"title":"White desert","description":"An evening on the salt flats as the light turns."},{"title":"Craft villages","description":"Days among master weavers and embroiderers."},{"title":"Wild lions","description":"A careful safari in Gir, their last refuge."}]}},
{"id":"d7-places","type":"Place Chips","data":{"heading":"Key places","places":[{"name":"Kutch","region":"Salt desert"},{"name":"Ahmedabad","region":"Old city"},{"name":"Gir","region":"Lions"}]}},
{"id":"d7-cta","type":"CTA Banner","data":{"headline":"India's most surprising state","body":"Extraordinary craft and empty white deserts.","buttonLabel":"Plan my Gujarat journey","buttonLink":"/enquire"}}
]$$::jsonb,
$${"title":"Gujarat Travel | MANNYAM","description":"Salt deserts, artisan villages and Asia's last wild lions.","canonical_url":"https://mannyam.in/destination-gujarat"}$$::jsonb);

-- ============================================================================
-- DONE: 8 experiences + 8 festivals + 7 destinations = 23 pages
-- Each page has: Hero (with background image), Tiles, Place Chips, CTA Banner
-- Festivals also have Fact Bar (When/Where)
-- All images are embedded directly in the Hero block data.
-- No separate seed_images.sql run is needed.
-- ============================================================================
