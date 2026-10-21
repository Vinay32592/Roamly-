require('dotenv').config();
const mongoose = require('mongoose');
const Destination = require('../src/models/Destination');

const destinations = [
  {
    name: 'Araku Valley',
    city: 'Araku',
    state: 'Andhra Pradesh',
    category: 'Nature & Wildlife',
    description: 'Araku Valley is a serene hill station nestled in the Eastern Ghats, celebrated for its organic coffee plantations, indigenous tribal heritage, and mist-wrapped lush hills. Located at an altitude of approximately 900 meters, it features pleasant year-round weather and panoramic valley viewpoints. Visitors frequently enjoy the scenic rail journey through tunnels and over bridges on the Visakhapatnam-Kirandul line.',
    images: ['/images/destinations/araku-valley.jpg'],
    bestTimeToVisit: 'October to March',
    entryFee: 'Free (individual attractions may charge)',
    visitorTips: ['Sample fresh Araku Arabica coffee', 'Bring light woolens for cool evenings', 'Visit the Padmapuram Botanical Gardens and Tribal Museum'],
    nearbyAttractions: ['Borra Caves', 'Katiki Waterfalls', 'Chaparai Cascades', 'Galikonda Viewpoint'],
    isFeatured: true
  },
  {
    name: 'Borra Caves',
    city: 'Araku',
    state: 'Andhra Pradesh',
    category: 'Nature & Wildlife',
    description: 'Borra Caves are dramatic karst limestone caves in the Ananthagiri Hills of the Eastern Ghats. Extending to a depth of around 80 meters, the caverns feature spectacular stalactite and stalagmite formations illuminated by vibrant natural and architectural lights. The site also holds local spiritual reverence, containing a natural Shiva Lingam formation worshipped by surrounding communities.',
    images: ['/images/destinations/borra-caves.jpg'],
    bestTimeToVisit: 'October to February',
    entryFee: '₹40-80',
    openingHours: '10:00 AM – 5:00 PM',
    visitorTips: ['Wear non-slip footwear as the cavern floor can be damp', 'Allow around 1 to 2 hours for exploring the main chambers', 'Look for the Shiva Lingam and Kamadhenu rock formations'],
    nearbyAttractions: ['Araku Valley', 'Katiki Waterfalls', 'Gosthani River gorge'],
    isFeatured: false
  },
  {
    name: 'Hampi',
    city: 'Hampi',
    state: 'Karnataka',
    category: 'Historical',
    description: 'Hampi is an awe-inspiring UNESCO World Heritage Site set amidst a boulder-strewn landscape along the Tungabhadra River. Once the prosperous 14th-century capital of the Vijayanagara Empire, it features monumental temple complexes, monolithic sculptures, palace ruins, and ancient royal baths. The iconic Stone Chariot at the Vijaya Vittala Temple and the towering Virupaksha Temple are world-renowned wonders.',
    images: ['/images/destinations/hampi.jpg'],
    bestTimeToVisit: 'October to February',
    entryFee: '₹40 for Indians, ₹600 for foreign tourists',
    visitorTips: ['Rent a bicycle or moped to comfortably navigate the expansive ruins', 'Climb Matanga Hill before sunrise or sunset for panoramic vistas', 'Carry plenty of drinking water and sun protection'],
    nearbyAttractions: ['Anegundi Village', 'Tungabhadra Dam', 'Daroji Bear Sanctuary'],
    isFeatured: true
  },
  {
    name: 'Tirupati (Tirumala)',
    city: 'Tirupati',
    state: 'Andhra Pradesh',
    category: 'Spiritual',
    description: 'The Sri Venkateswara Swamy Temple on the sacred Venkatadri hill of Tirumala is one of the most venerated pilgrimage destinations in the world. Dedicated to Lord Vishnu as Venkateswara (Balaji), the temple boasts an exquisite gold-gilded Ananda Nilayam vimana, Dravidian architecture, and deeply moving spiritual traditions. Pilgrims experience profound devotion amidst the seven holy hills.',
    images: ['/images/destinations/tirupati.jpg'],
    bestTimeToVisit: 'September to March',
    entryFee: 'Free general darshan; Special entry tickets available online',
    visitorTips: ['Book Special Entry Darshan and accommodation online well in advance', 'Adhere strictly to the traditional Indian dress code', 'Taste the world-famous consecrated Tirupati Laddu Prasadam'],
    nearbyAttractions: ['Sri Padmavathi Ammavari Temple', 'Silathoranam (Natural Rock Arch)', 'Talakona Waterfalls'],
    isFeatured: true
  },
  {
    name: 'Goa Beaches',
    city: 'Panaji',
    state: 'Goa',
    category: 'Beaches',
    description: 'Goa boasts over 100 kilometers of sun-kissed Arabian Sea coastline fringed with swaying coconut groves and golden sands. From the peaceful crescent shores of Palolem and Agonda in South Goa to the energetic shores and watersports of Baga and Calangute in the north, Goa blends coastal relaxation with Portuguese heritage, historic forts, whitewashed churches, and world-class seafood.',
    images: ['/images/destinations/goa-beaches.jpg'],
    bestTimeToVisit: 'November to February',
    entryFee: 'Free',
    visitorTips: ['Head to South Goa for pristine quiet beaches and peaceful sunsets', 'Rent a scooter to explore coastal backroads and spice plantations', 'Sample authentic Goan fish curry, prawn balchao, and bebinca'],
    nearbyAttractions: ['Fort Aguada', 'Basilica of Bom Jesus', 'Dudhsagar Falls', 'Chapora Fort'],
    isFeatured: true
  },
  {
    name: 'Munnar',
    city: 'Munnar',
    state: 'Kerala',
    category: 'Hill Stations',
    description: 'Munnar is a picturesque hill retreat perched at 1,600 meters in the Western Ghats of Kerala, renowned for its rolling emerald tea estates, mist-laden peaks, and exotic flora like the Neelakurinji flower. Located at the confluence of three mountain streams, Munnar offers crisp highland air, tranquil lakes, and access to Anamudi, the highest peak in South India.',
    images: ['/images/destinations/munnar.jpg'],
    bestTimeToVisit: 'September to March',
    entryFee: 'Free (tea museums and parks charge nominal fees)',
    visitorTips: ['Tour a functioning tea factory to taste fresh orthodox teas', 'Visit Eravikulam National Park early to spot endangered Nilgiri Tahr', 'Wear layers for chilly morning and evening temperatures'],
    nearbyAttractions: ['Eravikulam National Park', 'Mattupetty Dam', 'Top Station', 'Attukad Waterfalls'],
    isFeatured: true
  },
  {
    name: 'Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    category: 'Heritage',
    description: 'Jaipur, the celebrated Pink City of Rajasthan, forms a key point of the Golden Triangle. Founded in 1727 by Maharaja Sawai Jai Singh II, the UNESCO-listed historic center showcases brilliant Rajput town planning, grand palaces, and monumental forts. The honeycomb facade of Hawa Mahal, the hilltop Amber Fort, and the royal collections in City Palace showcase supreme Rajasthani artistry.',
    images: ['/images/destinations/jaipur.jpg'],
    bestTimeToVisit: 'October to March',
    entryFee: 'Monument composite tickets available',
    visitorTips: ['Purchase the Rajasthan Tourism composite ticket to save on monument entries', 'Visit Amber Fort in the morning to beat the afternoon desert heat', 'Explore Johari and Bapu Bazaars for traditional handicrafts and textiles'],
    nearbyAttractions: ['Amber Fort', 'Hawa Mahal', 'City Palace', 'Jantar Mantar', 'Nahargarh Fort'],
    isFeatured: true
  },
  {
    name: 'Ooty',
    city: 'Ooty',
    state: 'Tamil Nadu',
    category: 'Hill Stations',
    description: 'Udhagamandalam, affectionately known as Ooty, is the Queen of Hill Stations in the Nilgiri Hills of Tamil Nadu. Positioned amidst blue mountain ranges, eucalyptus groves, and manicured botanical gardens, Ooty was established as a British colonial summer retreat. The UNESCO-recognized Nilgiri Mountain Railway toy train journey to Ooty is celebrated as one of the most delightful rail trips on earth.',
    images: ['/images/destinations/ooty.jpg'],
    bestTimeToVisit: 'October to June',
    entryFee: 'Free (parks and lake boating charge nominal fees)',
    visitorTips: ['Book tickets on the Nilgiri Mountain Railway toy train weeks in advance', 'Try handmade Ooty chocolates and local Nilgiri aromatic oils', 'Spend an afternoon boating on the calm waters of Ooty Lake'],
    nearbyAttractions: ['Government Botanical Garden', 'Doddabetta Peak', 'Ooty Lake', 'Pykara Falls & Lake'],
    isFeatured: false
  },
  {
    name: 'Manali',
    city: 'Manali',
    state: 'Himachal Pradesh',
    category: 'Mountains',
    description: 'Nestled in the Beas River valley of Himachal Pradesh, Manali is a premier Himalayan destination framed by snow-clad Pir Panjal and Dhauladhar ranges. From serene deodar forests and ancient wooden temples like Hadimba Temple to adrenaline-fueled adventures like paragliding and skiing in Solang Valley, Manali serves as the legendary gateway to the high-altitude deserts of Spiti and Ladakh.',
    images: ['/images/destinations/manali.jpg'],
    bestTimeToVisit: 'October to June (December to February for snowfall)',
    entryFee: 'Free',
    visitorTips: ['Book Rohtang Pass permits in advance through official government portals', 'Visit Old Manali for rustic cafes, bakeries, and traditional wood-and-stone homes', 'Carry heavy thermal wear during winter trips'],
    nearbyAttractions: ['Solang Valley', 'Rohtang Pass', 'Hadimba Devi Temple', 'Atal Tunnel', 'Jogini Waterfall'],
    isFeatured: true
  },
  {
    name: 'Varanasi',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    category: 'Spiritual',
    description: 'Varanasi, also called Kashi or Benares, is one of the world\'s oldest continuously inhabited cities and the spiritual heartbeat of India. Spanning the sacred crescent bank of the River Ganges, its legendary stone ghats witness ancient rituals, timeless prayers, and the mesmerizing evening Ganga Aarti at Dashashwamedh Ghat. The maze of historic alleys reveals thousands of shrines, silk weaver guilds, and legendary street food.',
    images: ['/images/destinations/varanasi.jpg'],
    bestTimeToVisit: 'October to March',
    entryFee: 'Free (temples and boat rides vary)',
    visitorTips: ['Experience a dawn rowing boat ride along the Ganges ghats', 'Attend the spectacular evening Ganga Aarti at Dashashwamedh Ghat from a river boat', 'Sample authentic Banarasi kachori, lassi, and famous paan'],
    nearbyAttractions: ['Kashi Vishwanath Temple', 'Dashashwamedh Ghat', 'Sarnath', 'Assi Ghat', 'Ramnagar Fort'],
    isFeatured: true
  },
  {
    name: 'Charminar',
    city: 'Hyderabad',
    state: 'Telangana',
    category: 'Historical',
    description: 'The Charminar is the quintessential monument and global symbol of Hyderabad. Commissioned in 1591 by Muhammad Quli Qutb Shah, this magnificent square structure boasts four towering minarets rising 48.7 meters, intricate stucco ornamentation, and a mosque on its upper floor. Situated in the vibrant historic center, it is surrounded by the bustling bazaars of Laad Bazaar, renowned for handmade lacquer bangles and pearls.',
    images: ['/images/destinations/charminar.jpg'],
    bestTimeToVisit: 'October to March',
    entryFee: '₹25 for Indians, ₹300 for foreigners',
    openingHours: '9:30 AM – 5:30 PM',
    visitorTips: ['Climb the upper deck for panoramic views of Hyderabad old city', 'Explore Laad Bazaar adjacent to Charminar for authentic bangles and pearls', 'Indulge in authentic Hyderabadi Dum Biryani and Irani Chai at nearby cafes'],
    nearbyAttractions: ['Mecca Masjid', 'Chowmahalla Palace', 'Salar Jung Museum', 'Golconda Fort'],
    isFeatured: true
  },
  {
    name: 'Rishikesh',
    city: 'Rishikesh',
    state: 'Uttarakhand',
    category: 'Adventure',
    description: 'Renowned globally as the Yoga Capital of the World, Rishikesh sits where the emerald-green holy Ganges leaves the Himalayan foothills and enters the northern plains. Famed for historic suspension bridges like Lakshman Jhula and Ram Jhula, ashrams, and riverside yoga retreats, it is equally celebrated as India\'s adventure capital, offering thrilling white-water rafting, bungee jumping, and Himalayan trekking.',
    images: ['/images/destinations/rishikesh.jpg'],
    bestTimeToVisit: 'September to May',
    entryFee: 'Free',
    visitorTips: ['Experience white-water rafting on the Ganges between September and June', 'Attend the soulful evening Ganga Aarti at Triveni Ghat or Parmarth Niketan', 'Book a traditional yoga and meditation session at an authentic ashram'],
    nearbyAttractions: ['Ram Jhula & Lakshman Jhula', 'Beatles Ashram (Chaurasi Kutia)', 'Neelkanth Mahadev Temple', 'Shivpuri Rafting Base'],
    isFeatured: true
  },
  {
    name: 'Alleppey (Alappuzha)',
    city: 'Alappuzha',
    state: 'Kerala',
    category: 'Nature & Wildlife',
    description: 'Often called the Venice of the East, Alappuzha is the hub of Kerala\'s world-famous backwaters. A labyrinthine network of palm-fringed canals, tranquil lagoons, and freshwater lakes like Vembanad Lake allows travelers to voyage aboard traditional Kettuvallam houseboats handcrafted from coir and teak wood, observing pastoral Kerala village life, paddy fields, and migratory birds.',
    images: ['/images/destinations/alleppey.jpg'],
    bestTimeToVisit: 'September to March',
    entryFee: 'Free (houseboat rentals and kayak tours vary)',
    visitorTips: ['Book an overnight traditional houseboat cruise for an unforgettable stay', 'Taste authentic Karimeen Pollichathu (pearl spot fish) and Malabar parotta', 'Take an early morning canoe tour through narrow village waterways'],
    nearbyAttractions: ['Vembanad Lake', 'Marari Beach', 'Alappuzha Beach & Lighthouse', 'Kumarakom Bird Sanctuary'],
    isFeatured: true
  },
  {
    name: 'Ladakh',
    city: 'Leh',
    state: 'Ladakh',
    category: 'Mountains',
    description: 'Ladakh, the Land of High Passes, is a high-altitude Himalayan desert kingdom of barren peaks, azure mountain lakes, whitewashed Tibetan Buddhist gompas, and warm Ladakhi hospitality. Highlights include the iridescent blue waters of Pangong Tso, the dramatic sand dunes of Nubra Valley with double-humped Bactrian camels, and crossing the mighty Khardung La pass.',
    images: ['/images/destinations/ladakh.jpg'],
    bestTimeToVisit: 'May to September',
    entryFee: 'Inner Line Permits required for certain border sectors',
    visitorTips: ['Dedicate the first 24-48 hours in Leh strictly to rest and acclimatize', 'Stay hydrated and carry altitude sickness remedies', 'Respect monastic customs and dress modestly at ancient Buddhist gompas'],
    nearbyAttractions: ['Pangong Tso Lake', 'Nubra Valley', 'Thiksey Monastery', 'Khardung La Pass', 'Shanti Stupa'],
    isFeatured: true
  },
  {
    name: 'Udaipur',
    city: 'Udaipur',
    state: 'Rajasthan',
    category: 'Heritage',
    description: 'Known as the City of Lakes and the Venice of the East, Udaipur is widely acclaimed as the most romantic city in India. Set against the forested Aravalli Hills and centered on the shimmering waters of Lake Pichola, the city features the monumental City Palace, marble pleasure pavilions like Jag Mandir and the Lake Palace, and intricately carved temples that reflect centuries of Mewar royal valor and elegance.',
    images: ['/images/destinations/udaipur.jpg'],
    bestTimeToVisit: 'October to March',
    entryFee: 'Monuments charge individual admissions',
    visitorTips: ['Take a sunset boat cruise on Lake Pichola for breathtaking palace vistas', 'Explore the City Palace complex with an experienced audio or live guide', 'Watch a traditional Rajasthani folk dance performance at Bagore Ki Haveli'],
    nearbyAttractions: ['City Palace', 'Lake Pichola', 'Jag Mandir', 'Saheliyon-ki-Bari', 'Monsoon Palace (Sajjangarh)'],
    isFeatured: true
  },
  {
    name: 'Darjeeling',
    city: 'Darjeeling',
    state: 'West Bengal',
    category: 'Hill Stations',
    description: 'Perched in the Lesser Himalayas of West Bengal at an altitude of 2,050 meters, Darjeeling is internationally famed for producing the Champagne of Teas. Dominated by views of Mount Kanchenjunga—the world\'s third highest peak—it offers colonial architectural charm, serene Buddhist monasteries, and the UNESCO World Heritage Darjeeling Himalayan Railway, where century-old steam locomotives still puff up mountain slopes.',
    images: ['/images/destinations/darjeeling.jpg'],
    bestTimeToVisit: 'October to May',
    entryFee: 'Free',
    visitorTips: ['Wake up early to catch the golden sunrise over Kanchenjunga from Tiger Hill', 'Ride the heritage steam toy train between Darjeeling and Ghum', 'Taste pure first-flush and muscatel teas at a heritage tea estate'],
    nearbyAttractions: ['Tiger Hill', 'Batasia Loop', 'Himalayan Mountaineering Institute', 'Happy Valley Tea Estate', 'Peace Pagoda'],
    isFeatured: false
  },
  {
    name: 'Rann of Kutch',
    city: 'Bhuj',
    state: 'Gujarat',
    category: 'Nature & Wildlife',
    description: 'The Great Rann of Kutch is a surreal expanse of salt marsh spanning over 7,500 square kilometers in the Thar Desert. Flooded during the monsoon, the salt crystallizes in winter into a shimmering white salt desert that stretches endlessly toward the horizon. The vibrant Rann Utsav festival celebrates Kutchi folk dance, mirror-work textiles, music, and camel safaris under the glow of full-moon nights.',
    images: ['/images/destinations/rann-of-kutch.jpg'],
    bestTimeToVisit: 'November to February (Rann Utsav season)',
    entryFee: 'Permits required for Dhordo border area (obtainable online or at checkpoint)',
    visitorTips: ['Plan your visit during a full moon night for an ethereal silvery landscape', 'Purchase authentic Kutchi Rogan art and mirror-embroidered handicrafts', 'Stay in traditional Bhunga mud-huts for an authentic cultural experience'],
    nearbyAttractions: ['Kala Dungar (Black Hill)', 'Kutch Desert Wildlife Sanctuary', 'Dholavira Harappan Site', 'Bhuj Palace'],
    isFeatured: true
  },
  {
    name: 'Kodaikanal',
    city: 'Kodaikanal',
    state: 'Tamil Nadu',
    category: 'Hill Stations',
    description: 'Often referred to as the Princess of Hill Stations, Kodaikanal sits at an elevation of 2,133 meters in the Palani Hills of Tamil Nadu. Founded in 1845 as a refuge from the summer heat, it is blessed with a star-shaped lake, dense pine forests, dramatic rock pillars, cascading waterfalls, and rolling meadows. The rare Kurinji flower blooms here in vibrant purple once every 12 years.',
    images: ['/images/destinations/kodaikanal.jpg'],
    bestTimeToVisit: 'September to May',
    entryFee: 'Free',
    visitorTips: ['Cycle or pedal boat around the picturesque Kodaikanal Lake', 'Walk the scenic paved path of Coaker\'s Walk for views of the plains below', 'Visit Pillar Rocks on clear mornings before mountain mist rolls in'],
    nearbyAttractions: ['Kodaikanal Lake', 'Coaker\'s Walk', 'Pillar Rocks', 'Silver Cascade Falls', 'Bryant Park'],
    isFeatured: false
  },
  {
    name: 'Taj Mahal',
    city: 'Agra',
    state: 'Uttar Pradesh',
    category: 'Heritage',
    description: 'The Taj Mahal is an ivory-white marble mausoleum on the south bank of the Yamuna River, commissioned in 1631 by Mughal Emperor Shah Jahan to house the tomb of his favorite wife, Mumtaz Mahal. Universally admired as a masterpiece of Islamic and Mughal architecture and one of the New Seven Wonders of the World, its symmetry, intricate pietra dura inlay, and reflecting pools inspire awe in millions of travelers.',
    images: ['/images/destinations/taj-mahal.jpg'],
    bestTimeToVisit: 'October to March',
    entryFee: '₹50 for Indians, ₹1100 for foreign tourists (closed on Fridays)',
    openingHours: 'Sunrise to Sunset (Closed on Fridays)',
    visitorTips: ['Arrive at the East or West gate at sunrise for soft morning light and fewer crowds', 'Note that the monument is strictly closed to tourists on Fridays', 'Visit Mehtab Bagh across the Yamuna for sunset reflections of the Taj'],
    nearbyAttractions: ['Agra Fort', 'Fatehpur Sikri', 'Mehtab Bagh', 'Itmad-ud-Daulah (Baby Taj)'],
    isFeatured: true
  },
  {
    name: 'Golden Temple (Harmandir Sahib)',
    city: 'Amritsar',
    state: 'Punjab',
    category: 'Spiritual',
    description: 'Sri Harmandir Sahib, known worldwide as the Golden Temple, is the holiest gurdwara of Sikhism. Built around a sacred man-made pool (Amrit Sarovar) founded by Guru Ram Das in 1577, the gold-gilded sanctum features four welcoming entrances symbolizing openness to all humanity regardless of caste, creed, or faith. The temple\'s community kitchen (Langar) serves free nourishing hot meals to over 100,000 visitors every single day.',
    images: ['/images/destinations/golden-temple.jpg'],
    bestTimeToVisit: 'October to March',
    entryFee: 'Free for everyone',
    openingHours: 'Open 24 hours daily',
    visitorTips: ['Cover your head with a scarf and remove shoes before entering the complex', 'Partake in the sacred Langar meal cooked entirely by selfless volunteers', 'Witness the evening Palki Sahib ceremony when the holy Granth Sahib is carried to rest'],
    nearbyAttractions: ['Jallianwala Bagh', 'Wagah Border Flag Ceremony', 'Partition Museum', 'Akal Takht'],
    isFeatured: true
  },
  {
    name: 'Mysore Palace (Amba Vilas)',
    city: 'Mysuru',
    state: 'Karnataka',
    category: 'Heritage',
    description: 'Mysore Palace, the royal seat of the Wadiyar dynasty, is one of the most visited historical monuments in India. Designed by British architect Henry Irwin in the Indo-Saracenic style with Rajput, Hindu, and Gothic elements, the palace houses ornate durbar halls, stained glass ceilings, carved rosewood doors, and jewel-encrusted thrones. On Sunday evenings and during the Dasara festival, it is illuminated by nearly 100,000 incandescent bulbs.',
    images: ['/images/destinations/mysore-palace.jpg'],
    bestTimeToVisit: 'October to March (especially during Dasara celebrations)',
    entryFee: '₹100 for Indians, ₹300 for foreigners',
    openingHours: '10:00 AM – 5:30 PM (Illumination on Sundays 7:00 – 7:45 PM)',
    visitorTips: ['Do not miss the Sunday evening illumination when the entire palace is bathed in golden light', 'Wear easily removable footwear as shoes must be deposited outside the palace interior', 'Combine with a visit to the royal Chamundeshwari Temple atop Chamundi Hill'],
    nearbyAttractions: ['Chamundi Hill', 'Brindavan Gardens', 'St. Philomena\'s Cathedral', 'Ranganathittu Bird Sanctuary'],
    isFeatured: true
  },
  {
    name: 'Qutub Minar',
    city: 'New Delhi',
    state: 'Delhi',
    category: 'Historical',
    description: 'The Qutub Minar is a magnificent 72.5-meter-tall red sandstone minaret in the Mehrauli district of South Delhi, built by Qutb-ud-din Aibak and expanded by successive Sultanate rulers beginning in 1192. A UNESCO World Heritage Site, the fluted tower features carved Quranic verses and geometric balconies. The surrounding complex includes the Quwwat-ul-Islam Mosque and the mysterious 1,600-year-old rust-resistant Iron Pillar of Delhi.',
    images: ['/images/destinations/qutub-minar.jpg'],
    bestTimeToVisit: 'October to March',
    entryFee: '₹40 for Indians, ₹600 for foreigners',
    openingHours: 'Sunrise to Sunset daily',
    visitorTips: ['Visit in late afternoon to photograph the red sandstone illuminated by golden hour light', 'Observe the Iron Pillar of Chandragupta II, which has withstood weather without rusting since the 4th century', 'Explore the adjacent Mehrauli Archaeological Park for tombs and stepwells'],
    nearbyAttractions: ['Iron Pillar of Delhi', 'Alai Darwaza', 'Mehrauli Archaeological Park', 'Lotus Temple'],
    isFeatured: false
  },
  {
    name: 'Meenakshi Amman Temple',
    city: 'Madurai',
    state: 'Tamil Nadu',
    category: 'Spiritual',
    description: 'The Meenakshi Sundareswarar Temple in Madurai is a masterwork of Dravidian architecture and the cultural heart of Tamil Nadu. Dedicated to Goddess Meenakshi (an avatar of Parvati) and her consort Lord Sundareswarar (Shiva), the sprawling temple complex features 14 towering gopurams (gateway towers) elaborately sculpted with thousands of vibrant painted mythological figures, along with the magnificent Hall of Thousand Pillars.',
    images: ['/images/destinations/meenakshi-temple.jpg'],
    bestTimeToVisit: 'October to March',
    entryFee: 'Free (nominal camera and special darshan tickets apply)',
    openingHours: '5:00 AM – 12:30 PM, 4:00 PM – 10:00 PM',
    visitorTips: ['Observe the nocturnal procession ceremony at 9:00 PM when the icon of Shiva is carried to Meenakshi\'s shrine', 'Strict traditional dress code applies (dhoti/pant for men, saree/salwar for women)', 'Explore the Hall of Thousand Pillars and the museum inside'],
    nearbyAttractions: ['Thirumalai Nayakkar Mahal', 'Gandhi Memorial Museum', 'Vandiyur Mariamman Teppakulam'],
    isFeatured: true
  },
  {
    name: 'Coorg (Kodagu)',
    city: 'Madikeri',
    state: 'Karnataka',
    category: 'Hill Stations',
    description: 'Coorg, officially Kodagu, is a lush highland district nestled on the eastern slopes of the Western Ghats in Karnataka. Celebrated as the Scotland of India, Coorg is carpeted in world-class coffee and black pepper plantations, dense teak and sandalwood forests, and cascading waterfalls like Abbey Falls. It is also the homeland of the martial Kodava community, famed for its distinct cultural customs, hospitality, and rich pork pandi curry.',
    images: ['/images/destinations/coorg.jpg'],
    bestTimeToVisit: 'October to April',
    entryFee: 'Free',
    visitorTips: ['Stay in an authentic plantation homestay to experience local Kodava cuisine and culture', 'Visit the Namdroling Tibetan Monastery (Golden Temple) in Bylakuppe nearby', 'Take a refreshing trek through coffee groves to Abbey Falls'],
    nearbyAttractions: ['Abbey Falls', 'Raja\'s Seat', 'Namdroling Tibetan Monastery', 'Talakaveri (Source of Cauvery River)', 'Dubare Elephant Camp'],
    isFeatured: true
  },
  {
    name: 'Gokarna',
    city: 'Gokarna',
    state: 'Karnataka',
    category: 'Beaches',
    description: 'Gokarna is a tranquil coastal town on the Arabian Sea in Karnataka, famous for its sacred Mahabaleshwar Shiva temple and its sequence of pristine, crescent-shaped beaches. Unlike crowded party spots, beaches like Om Beach (naturally shaped like the auspicious Om symbol), Kudle Beach, Half Moon Beach, and Paradise Beach offer dramatic coastal cliff hiking trails, golden sands, calm waters, and tranquil sunset views.',
    images: ['/images/destinations/gokarna.jpg'],
    bestTimeToVisit: 'October to March',
    entryFee: 'Free',
    visitorTips: ['Trek along the scenic coastal cliff trail connecting Kudle, Om, Half Moon, and Paradise beaches', 'Om Beach is shaped like the sacred Om symbol; climb the rocky headland for the best vantage point', 'Sample fresh local seafood and Italian dishes at beachfront shacks'],
    nearbyAttractions: ['Om Beach', 'Kudle Beach', 'Mahabaleshwar Temple', 'Half Moon Beach', 'Mirjan Fort'],
    isFeatured: true
  },
  {
    name: 'Kaziranga National Park',
    city: 'Golaghat',
    state: 'Assam',
    category: 'Nature & Wildlife',
    description: 'Kaziranga National Park is a world-renowned UNESCO World Heritage Site in Assam, situated along the floodplains of the mighty Brahmaputra River. It is home to the world\'s largest population of the endangered Great Indian One-Horned Rhinoceros, along with tigers, wild water buffalo, Asian elephants, and swamp deer. Its tall elephant grass and dense tropical moist broadleaf forests offer an exceptional wildlife safari experience.',
    images: ['/images/destinations/kaziranga.jpg'],
    bestTimeToVisit: 'November to April (Closed during monsoon flood season)',
    entryFee: 'Safari permits and vehicle charges apply per zone',
    openingHours: 'Park opens for morning and afternoon safaris from November 1 to April 30',
    visitorTips: ['Book early morning elephant and open-jeep safaris in the Central (Kohora) or Western (Bagori) ranges', 'Carry a pair of high-zoom binoculars for bird and rhino watching', 'The park is closed from May to October due to annual Brahmaputra monsoonal flooding'],
    nearbyAttractions: ['Kaziranga National Orchid Park', 'Brahmaputra River Boat Safari', 'Hoollongapar Gibbon Sanctuary', 'Assam Tea Estates'],
    isFeatured: true
  },
  {
    name: 'Konark Sun Temple',
    city: 'Puri',
    state: 'Odisha',
    category: 'Historical',
    description: 'The 13th-century Konark Sun Temple, a UNESCO World Heritage Site on the coast of Odisha, was conceived as a gigantic stone chariot for Surya, the Sun God. Designed with 24 exquisitely carved stone wheels pulled by seven galloping horses, the temple is an architectural marvel of Kalinga engineering. The stone wheels double as precise sundials, and the relief sculptures depict mythological epics, musicians, and dancers.',
    images: ['/images/destinations/konark-sun-temple.jpg'],
    bestTimeToVisit: 'October to March',
    entryFee: '₹40 for Indians, ₹600 for foreigners',
    openingHours: '6:00 AM – 8:00 PM daily',
    visitorTips: ['Hire an approved ASI guide to decode the sundial calculations and intricate stone carvings', 'Attend the evening Sound & Light show to learn about King Narasimhadeva and master architect Dharmapada', 'Visit the nearby Chandrabhaga Beach for quiet coastal sunrises'],
    nearbyAttractions: ['Chandrabhaga Beach', 'Puri Jagannath Temple', 'Raghurajpur Heritage Craft Village', 'Chilika Lake'],
    isFeatured: true
  },
  {
    name: 'Ajanta Caves',
    city: 'Aurangabad',
    state: 'Maharashtra',
    category: 'Heritage',
    description: 'Carved into the sheer horseshoe cliff above the Waghur River gorge, the Ajanta Caves comprise 30 rock-cut Buddhist monument caves dating from the 2nd century BCE to about 480 CE. A UNESCO World Heritage Site, Ajanta is globally celebrated for its expressive ancient mural paintings, considered masterpieces of religious Buddhist art depicting Jataka tales, celestial beings, and the life of Gautama Buddha.',
    images: ['/images/destinations/ajanta-caves.jpg'],
    bestTimeToVisit: 'October to March',
    entryFee: '₹40 for Indians, ₹600 for foreigners (Closed on Mondays)',
    openingHours: '9:00 AM – 5:00 PM (Closed on Mondays)',
    visitorTips: ['Flash photography is strictly prohibited inside cave shrines to protect ancient vegetable dyes', 'Carry a portable torch/flashlight to illuminate dimly lit murals', 'Wear easily removable footwear since shoes must be taken off at major prayer caves'],
    nearbyAttractions: ['Ellora Caves', 'Bibi Ka Maqbara', 'Daulatabad Fort', 'Grishneshwar Jyotirlinga'],
    isFeatured: true
  },
  {
    name: 'Ellora Caves (Kailasa Temple)',
    city: 'Aurangabad',
    state: 'Maharashtra',
    category: 'Historical',
    description: 'Ellora Caves are a UNESCO World Heritage Site featuring 34 monumental rock-cut monasteries and temples carved side-by-side along the Charanandri hills between the 6th and 10th centuries CE. Demonstrating religious harmony, the complex includes Buddhist, Hindu, and Jain sanctuaries. Its crown jewel, Cave 16 (Kailasa Temple), is the largest monolithic rock excavation in the world, carved vertically top-down from a single basalt cliff.',
    images: ['/images/destinations/ellora-caves.jpg'],
    bestTimeToVisit: 'October to March',
    entryFee: '₹40 for Indians, ₹600 for foreigners (Closed on Tuesdays)',
    openingHours: 'Sunrise to Sunset (Closed on Tuesdays)',
    visitorTips: ['Spend at least 2 hours admiring the monumental multi-story Kailasa Temple (Cave 16)', 'The Jain group of caves (Caves 30–34) feature exceptionally fine ceiling carvings', 'Closed on Tuesdays; plan your Aurangabad itinerary accordingly'],
    nearbyAttractions: ['Grishneshwar Jyotirlinga Temple', 'Daulatabad Fort', 'Ajanta Caves', 'Bibi Ka Maqbara'],
    isFeatured: true
  },
  {
    name: 'Jim Corbett National Park',
    city: 'Nainital',
    state: 'Uttarakhand',
    category: 'Nature & Wildlife',
    description: 'Established in 1936 as Hailey National Park and later renamed after legendary hunter-naturalist Jim Corbett, this is India\'s oldest national park and the birthplace of Project Tiger. Nestled in the Himalayan foothills of Uttarakhand along the Ramganga River, the park comprises dense sal forests, riverine belts, and savannah grasslands sheltering Royal Bengal tigers, wild elephants, leopards, and over 600 species of birds.',
    images: ['/images/destinations/jim-corbett.jpg'],
    bestTimeToVisit: 'November to June (Dhikala zone open November 15 to June 15)',
    entryFee: 'Zone permits and gypsy fees apply',
    visitorTips: ['Book Dhikala or Bijrani safari permits months in advance through the official forest department portal', 'Staying inside the heritage Dhikala Forest Rest House offers the best wildlife encounter chances', 'Winter mornings can be freezing; carry heavy windbreakers and beanies on open safaris'],
    nearbyAttractions: ['Corbett Falls', 'Garjiya Devi Temple', 'Jim Corbett Museum (Kaladhungi)', 'Kosi River'],
    isFeatured: true
  },
  {
    name: 'Radhanagar Beach',
    city: 'Havelock Island',
    state: 'Andaman & Nicobar Islands',
    category: 'Beaches',
    description: 'Located on Havelock Island (Swaraj Dweep), Radhanagar Beach (Beach No. 7) has been voted Asia\'s Best Beach by Time Magazine. With its vast expanse of silky white powder sand, crystal-clear turquoise waters of the Andaman Sea, and a backdrop of lush rainforest canopies, it offers idyllic swimming conditions and unforgettable sunset panoramas far removed from commercial hustle.',
    images: ['/images/destinations/radhanagar-beach.jpg'],
    bestTimeToVisit: 'October to May',
    entryFee: 'Free',
    visitorTips: ['Swimming is safe and blissful here; waters remain calm with gentle surf', 'Stay for sunset when the sky lights up in dramatic shades of pink, gold, and violet', 'Combine with scuba diving and sea-walking at nearby Elephant Beach'],
    nearbyAttractions: ['Elephant Beach', 'Kalapathar Beach', 'Neil Island (Shaheed Dweep)', 'Cellular Jail (Port Blair)'],
    isFeatured: true
  },
  {
    name: 'Sundarbans National Park',
    city: 'South 24 Parganas',
    state: 'West Bengal',
    category: 'Nature & Wildlife',
    description: 'The Sundarbans is the world\'s largest contiguous mangrove delta forest, formed by the confluence of the Ganges, Brahmaputra, and Meghna rivers in the Bay of Bengal. A UNESCO World Heritage Site and Biosphere Reserve, this tidal ecosystem is the unique swimming habitat of the Royal Bengal Tiger, estuarine saltwater crocodiles, Gangetic dolphins, and vast colonies of waterbirds.',
    images: ['/images/destinations/sundarbans.jpg'],
    bestTimeToVisit: 'September to March',
    entryFee: 'Boat safari permits apply',
    visitorTips: ['All wildlife exploration in Sundarbans is conducted by motorized boats along tidal waterways', 'Climb the watchtowers at Sajnekhali, Sudhanyakhali, and Do Banki for canopy views', 'Carry mosquito repellent and binoculars for bird watching'],
    nearbyAttractions: ['Sajnekhali Bird Sanctuary', 'Sudhanyakhali Watch Tower', 'Netidhopani Ruins', 'Dobanki Canopy Walk'],
    isFeatured: false
  },
  {
    name: 'Jaisalmer Fort (Sonar Qila)',
    city: 'Jaisalmer',
    state: 'Rajasthan',
    category: 'Heritage',
    description: 'Rising like a golden mirage from the sandy plains of the Thar Desert, Jaisalmer Fort (Sonar Qila) is one of the world\'s few living forts. Built in 1156 CE by Rajput king Rawal Jaisal, nearly a quarter of the old city\'s population still resides within its towering yellow sandstone ramparts. The fort houses intricately carved Jain temples, the royal palace, stepwells, and rooftop havelis.',
    images: ['/images/destinations/jaisalmer-fort.jpg'],
    bestTimeToVisit: 'October to March',
    entryFee: 'Free for fort grounds; Palace museum charges nominal fee',
    visitorTips: ['Visit at sunset when the yellow sandstone walls glow like molten gold', 'Explore the seven interconnected 12th-to-15th century Jain temples inside the fort', 'Combine your visit with an overnight desert camel safari at Sam Sand Dunes'],
    nearbyAttractions: ['Sam Sand Dunes', 'Patwon Ki Haveli', 'Gadisar Lake', 'Kuldhara Ghost Village'],
    isFeatured: true
  },
  {
    name: 'Khajuraho Temples',
    city: 'Chhatarpur',
    state: 'Madhya Pradesh',
    category: 'Historical',
    description: 'The Khajuraho Group of Monuments in Madhya Pradesh is a UNESCO World Heritage Site renowned for its Nagara-style architectural design and exquisite stone sculptures. Built between 950 and 1050 CE by the Chandela dynasty, only about 20 of the original 85 temples survive. The Kandariya Mahadeva Temple is the crowning jewel, showcasing remarkable sculptures celebrating life, spirituality, and love.',
    images: ['/images/destinations/khajuraho.jpg'],
    bestTimeToVisit: 'October to March',
    entryFee: '₹40 for Indians, ₹600 for foreigners',
    openingHours: 'Sunrise to Sunset daily',
    visitorTips: ['Begin your tour in the Western Group of Temples, which contains the best preserved monuments', 'Attend the evening Sound & Light show narrated by Amitabh Bachchan in the garden', 'Visit in February to witness the annual Khajuraho Dance Festival'],
    nearbyAttractions: ['Kandariya Mahadeva Temple', 'Panna National Park', 'Raneh Falls Canyon', 'Ken Gharial Sanctuary'],
    isFeatured: true
  },
  {
    name: 'Valley of Flowers',
    city: 'Chamoli',
    state: 'Uttarakhand',
    category: 'Mountains',
    description: 'Nestled high in the West Himalayan biosphere of Uttarakhand, the Valley of Flowers National Park is an extraordinary UNESCO World Heritage Site. Endemic alpine flower meadows bloom into a breathtaking carpet of hundreds of vibrant species—including the rare blue poppy, brahma kamal, and Himalayan bellflower—framed by snow-dusted peaks, glaciers, and cascading streams.',
    images: ['/images/destinations/valley-of-flowers.jpg'],
    bestTimeToVisit: 'July to September (Peak blooming season)',
    entryFee: '₹150 for Indians, ₹600 for foreigners',
    openingHours: '7:00 AM – 5:00 PM (No overnight camping inside the park)',
    visitorTips: ['The trek begins at Govindghat / Ghangaria; carry sturdy waterproof trekking boots and rain gear', 'July and August offer the most spectacular wildflower blooms', 'Overnight stays inside the national park are strictly forbidden; return to Ghangaria before dusk'],
    nearbyAttractions: ['Hemkund Sahib Sikh Shrine', 'Nanda Devi Biosphere Reserve', 'Badrinath Temple', 'Mana Village'],
    isFeatured: true
  },
  {
    name: 'Ranthambore National Park',
    city: 'Sawai Madhopur',
    state: 'Rajasthan',
    category: 'Nature & Wildlife',
    description: 'Ranthambore National Park is one of the premier tiger reserves in India, famous for its daytime sightings of Royal Bengal Tigers in their natural habitat. Set amidst the junction of the Aravalli and Vindhya ranges, the park features dry deciduous forests, sparkling lakes like Padam Talao, and the monumental 10th-century Ranthambore Fort perched high atop a cliff inside the forest.',
    images: ['/images/destinations/ranthambore.jpg'],
    bestTimeToVisit: 'October to June',
    entryFee: 'Safari permits and gypsy/canter charges apply',
    openingHours: 'Morning and afternoon safaris daily (Park closed July to September)',
    visitorTips: ['Book safari zones (Zones 1-5 are considered core) well in advance through Rajasthan forest portal', 'Opt for a 6-seater open gypsy for photography rather than larger 20-seater canters', 'Visit the 10th-century UNESCO Ranthambore Fort within the park for sweeping jungle views'],
    nearbyAttractions: ['Ranthambore Fort', 'Padam Talao & Jogi Mahal', 'Trinetra Ganesha Temple', 'Kachida Valley'],
    isFeatured: true
  },
  {
    name: 'Shimla',
    city: 'Shimla',
    state: 'Himachal Pradesh',
    category: 'Hill Stations',
    description: 'Shimla, the capital of Himachal Pradesh, was the official summer capital of British India during the Raj. Set across seven hills in the lower Himalayas at 2,200 meters, it retains colonial architecture like the neo-Gothic Christ Church, the Viceregal Lodge, and the bustling pedestrianized Mall Road and Ridge. Surrounding pine and oak forests overlook the snow-crowned Himalayan crest.',
    images: ['/images/destinations/shimla.jpg'],
    bestTimeToVisit: 'March to June, and December to February (for winter snowfall)',
    entryFee: 'Free',
    visitorTips: ['Stroll down the pedestrian-only Mall Road and The Ridge in the evening', 'Take the UNESCO Kalka-Shimla Toy Train for unforgettable mountain switchback views', 'Visit the Jakhoo Temple atop Jakhoo Hill to see the 108-foot Hanuman statue and panoramic vistas'],
    nearbyAttractions: ['The Ridge & Christ Church', 'Viceregal Lodge (IIAS)', 'Jakhoo Temple', 'Kufri Snow Point', 'Mall Road'],
    isFeatured: true
  },
  {
    name: 'Wayanad',
    city: 'Kalpetta',
    state: 'Kerala',
    category: 'Nature & Wildlife',
    description: 'Wayanad is a tranquil plateau in the Western Ghats of northern Kerala, characterized by rolling spice plantations of cardamom and pepper, aromatic coffee estates, and ancient Neolithic rock art in Edakkal Caves. With trekking peaks like Chembra Peak featuring a natural heart-shaped lake, cascading waterfalls like Soochipara, and bamboo forests in the Wayanad Wildlife Sanctuary, it is an unspoiled nature paradise.',
    images: ['/images/destinations/wayanad.jpg'],
    bestTimeToVisit: 'October to May',
    entryFee: 'Free (caves, waterfalls, and sanctuaries charge nominal fees)',
    visitorTips: ['Climb up to the ancient Neolithic petroglyphs at Edakkal Caves early in the morning', 'Trek to the heart-shaped Hridaya Saras lake on the slopes of Chembra Peak', 'Explore the Wayanad Wildlife Sanctuary for herds of wild Asian elephants and spotted deer'],
    nearbyAttractions: ['Edakkal Caves', 'Banasura Sagar Dam', 'Chembra Peak', 'Soochipara Waterfalls', 'Wayanad Wildlife Sanctuary'],
    isFeatured: true
  }
];

async function seedDestinations() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  console.log(`Upserting ${destinations.length} verified destinations...`);
  for (const dest of destinations) {
    const existing = await Destination.findOne({ name: dest.name });
    if (existing) {
      existing.city = dest.city;
      existing.state = dest.state;
      existing.category = dest.category;
      existing.description = dest.description;
      existing.images = dest.images;
      existing.bestTimeToVisit = dest.bestTimeToVisit;
      existing.entryFee = dest.entryFee;
      existing.visitorTips = dest.visitorTips;
      existing.nearbyAttractions = dest.nearbyAttractions;
      existing.isFeatured = dest.isFeatured;
      if (dest.openingHours) existing.openingHours = dest.openingHours;
      await existing.save();
    } else {
      await Destination.create(dest);
    }
  }

  const total = await Destination.countDocuments();
  console.log(`Done! Total destinations seeded: ${total}`);
  process.exit(0);
}

seedDestinations().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
