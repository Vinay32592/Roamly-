require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Destination = require('../src/models/Destination');
const Review = require('../src/models/Review');

const sampleUsers = [
  {
    name: 'Priya Sharma',
    username: 'priya_travels',
    email: 'priya@example.com',
    password: 'Password@123',
    role: 'user'
  },
  {
    name: 'Rahul Verma',
    username: 'rahul_v',
    email: 'rahul@example.com',
    password: 'Password@123',
    role: 'user'
  },
  {
    name: 'Ananya Iyer',
    username: 'ananya_i',
    email: 'ananya@example.com',
    password: 'Password@123',
    role: 'user'
  },
  {
    name: 'Vikram Malhotra',
    username: 'vikram_m',
    email: 'vikram@example.com',
    password: 'Password@123',
    role: 'user'
  },
  {
    name: 'Sneha Patel',
    username: 'sneha_p',
    email: 'sneha@example.com',
    password: 'Password@123',
    role: 'user'
  }
];

const seedReviewsData = [
  {
    destName: 'Araku Valley',
    userIndex: 0,
    rating: 5,
    title: 'Breathtaking train journey and aromatic coffee gardens',
    comment: 'The scenic Vistadome train ride from Visakhapatnam to Araku is something every traveler must experience at least once. The mist-covered hills and tunnels make the 4-hour journey fly by. In Araku, make sure you visit the local tribal museum and pick up fresh Arabica coffee powder directly from the plantations.',
    visitDate: new Date('2025-11-14'),
    helpfulVotes: 14
  },
  {
    destName: 'Araku Valley',
    userIndex: 1,
    rating: 4,
    title: 'Peaceful weekend getaway in the Eastern Ghats',
    comment: 'Visited Araku with family over a long weekend. The weather in December was comfortably cool. Katiki falls and Borra caves are nearby and worth visiting. Roads inside the valley are mostly well maintained. Food options are authentic Andhra cuisine with lots of spice.',
    visitDate: new Date('2025-12-02'),
    helpfulVotes: 6
  },
  {
    destName: 'Hampi',
    userIndex: 2,
    rating: 5,
    title: 'Surreal boulder landscapes and timeless Vijayanagara glory',
    comment: 'Hampi is unlike anywhere else on earth. Walking around the Vijaya Vittala temple complex and standing before the iconic Stone Chariot gave me chills. Sunset from Hemakuta Hill overlooking the Virupaksha temple tower is truly magical. Rent a moped to explore both sides of the river.',
    visitDate: new Date('2026-01-10'),
    helpfulVotes: 23
  },
  {
    destName: 'Hampi',
    userIndex: 3,
    rating: 5,
    title: 'A living museum carved in stone',
    comment: 'Spent three full days exploring the royal enclosures, underground Shiva temple, and lotus mahal. The architecture tells such vivid stories of an empire that once rivaled Rome. Local guides are very knowledgeable and bring the ruins to life.',
    visitDate: new Date('2025-10-18'),
    helpfulVotes: 9
  },
  {
    destName: 'Tirupati (Tirumala)',
    userIndex: 4,
    rating: 5,
    title: 'Deeply divine and spiritually overwhelming experience',
    comment: 'The spiritual energy at Tirumala is indescribable. Despite the massive pilgrim crowd, the TTD temple administration manages queues with great efficiency. The Ananda Nilayam vimana covered in gold is mesmerizing, and the Tirupati Laddu prasadam is unmatched in taste.',
    visitDate: new Date('2025-12-22'),
    helpfulVotes: 31
  },
  {
    destName: 'Goa Beaches',
    userIndex: 0,
    rating: 5,
    title: 'Palolem is the perfect slice of coastal paradise',
    comment: 'If you want to avoid commercial crowds, head straight to Palolem and Agonda in South Goa. The calm crescent bay is ideal for swimming and stand-up paddleboarding. We took an early morning boat trip and spotted wild dolphins playing just 500 meters offshore.',
    visitDate: new Date('2026-02-04'),
    helpfulVotes: 17
  },
  {
    destName: 'Munnar',
    userIndex: 1,
    rating: 5,
    title: 'Endless carpets of emerald tea gardens and cool mountain mist',
    comment: 'Driving through Munnar feels like moving inside a postcard. The tea estates roll across hills as far as the eye can see. We visited the Lockhart tea factory, tasted fresh green tea, and trekked to Top Station for panoramic views into the neighboring Tamil Nadu plains.',
    visitDate: new Date('2025-09-28'),
    helpfulVotes: 15
  },
  {
    destName: 'Jaipur',
    userIndex: 2,
    rating: 4,
    title: 'Majestic Amber Fort and stunning royal palaces',
    comment: 'The Pink City lived up to all expectations. Amber Fort\'s Sheesh Mahal (Mirror Palace) was the highlight—the glass mosaic artistry is unbelievable. Make sure to visit Hawa Mahal early in the morning before traffic starts for unobstructed photography.',
    visitDate: new Date('2025-11-05'),
    helpfulVotes: 11
  },
  {
    destName: 'Varanasi',
    userIndex: 3,
    rating: 5,
    title: 'Soul-stirring Ganga Aarti and ancient spiritual heartbeat',
    comment: 'Varanasi transforms the way you view life. Experiencing the evening Maha Aarti at Dashashwamedh Ghat from a wooden rowing boat in the middle of the river, with thousands of floating earthen diyas, is an indelible sensory memory. The morning boat ride along Assi Ghat was equally serene.',
    visitDate: new Date('2025-12-15'),
    helpfulVotes: 28
  },
  {
    destName: 'Charminar',
    userIndex: 4,
    rating: 4,
    title: 'Iconic Hyderabad landmark with unmatched culinary surroundings',
    comment: 'Climbed the Charminar for a view over the bustling Laad Bazaar below. The stucco stucco work on the arches is remarkable. After visiting the monument, we headed straight to Shadab for authentic Hyderabadi mutton biryani and Irani chai with Osmania biscuits. Truly an essential experience.',
    visitDate: new Date('2026-01-25'),
    helpfulVotes: 18
  },
  {
    destName: 'Rishikesh',
    userIndex: 0,
    rating: 5,
    title: 'Adrenaline on the Ganges and peace at the ashrams',
    comment: 'We did the 16km Shivpuri to Rishikesh river rafting stretch—rapids like Roller Coaster and Golf Course were thrilling yet safe with our certified guide. Evenings spent listening to kirtan on the ghats with the Himalayan breeze blowing down the valley gave such profound peace.',
    visitDate: new Date('2025-10-30'),
    helpfulVotes: 19
  },
  {
    destName: 'Darjeeling',
    userIndex: 1,
    rating: 5,
    title: 'Sunrise over Kanchenjunga and vintage toy train nostalgia',
    comment: 'Woke up at 4 AM for the sunrise over Kanchenjunga from Tiger Hill—when the golden rays hit the snow peaks, everyone went silent in awe. Riding the DHR steam toy train to Ghum station was like traveling back in time. Sip fresh first-flush Darjeeling tea at Glenary\'s bakery.',
    visitDate: new Date('2025-11-20'),
    helpfulVotes: 12
  },
  {
    destName: 'Gokarna',
    userIndex: 0,
    rating: 5,
    title: 'Om Beach is pure magic and peaceful tranquility',
    comment: 'The natural Om-shaped coastline is unlike any beach I have visited in India. Walking the headland trail from Kudle to Om and Half Moon beach offers stunning viewpoints over the Arabian Sea. Enjoyed fresh coconut water and relaxed at the shacks watching dolphins in the bay.',
    visitDate: new Date('2025-12-05'),
    helpfulVotes: 19
  },
  {
    destName: 'Kaziranga National Park',
    userIndex: 1,
    rating: 5,
    title: 'Incredible rhino sightings in the misty grasslands',
    comment: 'We saw over ten one-horned rhinos during our morning safari in the Bagori zone! The elephant safari at dawn with morning mist rising above the wetlands is an experience you will never forget. Also saw swamp deer and wild water buffalo.',
    visitDate: new Date('2026-01-18'),
    helpfulVotes: 24
  },
  {
    destName: 'Jim Corbett National Park',
    userIndex: 2,
    rating: 5,
    title: 'Thrilling safari and spotted a majestic Bengal Tiger in Dhikala',
    comment: 'Staying overnight at the Dhikala forest lodge is worth every penny. We were fortunate enough to spot a Royal Bengal Tiger crossing the Ramganga river bed in the early morning light. The sal forests and wild elephant herds are spectacular.',
    visitDate: new Date('2025-11-20'),
    helpfulVotes: 27
  },
  {
    destName: 'Radhanagar Beach',
    userIndex: 3,
    rating: 5,
    title: 'The cleanest and most breathtaking beach in Asia',
    comment: 'The soft white powdery sand and crystal clear turquoise waters at Radhanagar Beach feel like paradise. Swimming here is completely safe with gentle waves. The sunset here paints the entire horizon in golden and purple hues.',
    visitDate: new Date('2026-02-10'),
    helpfulVotes: 31
  },
  {
    destName: 'Konark Sun Temple',
    userIndex: 4,
    rating: 5,
    title: 'Astonishing stone architecture and ancient sundial engineering',
    comment: 'The precision of the 24 stone chariot wheels and how they accurately calculate time down to the minute is mind-blowing. The sheer scale of the temple and the detailed carvings of dancers and mythological scenes leave you speechless.',
    visitDate: new Date('2025-12-28'),
    helpfulVotes: 18
  },
  {
    destName: 'Jaisalmer Fort (Sonar Qila)',
    userIndex: 0,
    rating: 5,
    title: 'A living golden fort rising out of the Thar Desert',
    comment: 'Walking through the narrow cobblestone lanes of Sonar Qila feels like stepping straight into a medieval tale. The golden sandstone glows brilliantly at sunset. Enjoyed staying in a heritage haveli right inside the fort ramparts.',
    visitDate: new Date('2025-12-12'),
    helpfulVotes: 22
  },
  {
    destName: 'Ellora Caves (Kailasa Temple)',
    userIndex: 1,
    rating: 5,
    title: 'Cave 16 Kailasa Temple is an engineering miracle of the ancient world',
    comment: 'It is impossible to comprehend how craftsmen carved an entire multi-story temple complex out of a single solid basalt cliff from the top down. The scale, intricate elephant sculptures, and sheer artistic vision are beyond magnificent.',
    visitDate: new Date('2026-01-08'),
    helpfulVotes: 29
  },
  {
    destName: 'Ajanta Caves',
    userIndex: 2,
    rating: 5,
    title: 'Timeless Buddhist murals and peaceful cliffside serenity',
    comment: 'The natural horseshoe gorge setting is breathtaking. The 2,000-year-old fresco murals depicting the Jataka tales have preserved their vibrant expressions and colors astonishingly well. A true wonder of Indian heritage.',
    visitDate: new Date('2026-01-09'),
    helpfulVotes: 16
  },
  {
    destName: 'Khajuraho Temples',
    userIndex: 3,
    rating: 5,
    title: 'Supreme stone mastery at Kandariya Mahadeva',
    comment: 'The Western group of temples in Khajuraho are preserved in impeccable condition. The stone carvings celebrating life, music, dance, and spiritual devotion are carved with remarkable delicacy. The evening sound and light show is great too.',
    visitDate: new Date('2025-11-18'),
    helpfulVotes: 14
  },
  {
    destName: 'Valley of Flowers',
    userIndex: 4,
    rating: 5,
    title: 'An enchanting alpine paradise of wild Himalayan blooms',
    comment: 'Trekking from Ghangaria into the valley in August felt like entering another realm. Thousands of endemic flowers blanketed the meadow under mist-shrouded glaciers and waterfalls. A must-do trek for every nature and mountain lover.',
    visitDate: new Date('2025-08-15'),
    helpfulVotes: 35
  },
  {
    destName: 'Ranthambore National Park',
    userIndex: 0,
    rating: 5,
    title: 'Royal Bengal tigers against the backdrop of an ancient fort',
    comment: 'Had an unbelievable sighting of a tigress and her two cubs near Padam Talao lake. The ancient 10th-century fort ruins towering over the jungle make the landscape dramatic and uniquely picturesque. Highly recommend booking Zone 3 or 4.',
    visitDate: new Date('2026-02-22'),
    helpfulVotes: 21
  },
  {
    destName: 'Shimla',
    userIndex: 1,
    rating: 4,
    title: 'Charming colonial heritage and winter snowfall on The Ridge',
    comment: 'Took the heritage toy train from Kalka to Shimla which was delightfully scenic with 102 tunnels. The Ridge and Mall road are completely vehicle-free and enjoyable for evening strolls with views of snow-peaked Himalayan ranges.',
    visitDate: new Date('2026-01-02'),
    helpfulVotes: 13
  },
  {
    destName: 'Wayanad',
    userIndex: 2,
    rating: 5,
    title: 'Lush spice plantations and prehistoric rock carvings',
    comment: 'Wayanad is green, peaceful, and clean. The hike up to the ancient Neolithic petroglyphs at Edakkal Caves was fascinating, and trekking to Chembra Peak’s heart-shaped lake was memorable. The cardamom and coffee aromas are everywhere.',
    visitDate: new Date('2025-10-25'),
    helpfulVotes: 17
  }
];

async function seedUsersAndReviews() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding community reviews...');

    // 1. Create or retrieve users
    const createdUsers = [];
    for (const u of sampleUsers) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create(u);
        console.log(`  ✓ Created user: ${user.name} (@${user.username})`);
      } else {
        console.log(`  - Existing user: ${user.name}`);
      }
      createdUsers.push(user);
    }

    // 2. Create reviews
    for (const r of seedReviewsData) {
      const dest = await Destination.findOne({ name: r.destName });
      if (!dest) {
        console.log(`  ! Destination not found: ${r.destName}`);
        continue;
      }

      const user = createdUsers[r.userIndex % createdUsers.length];
      const existing = await Review.findOne({ user: user._id, destination: dest._id });
      if (!existing) {
        await Review.create({
          user: user._id,
          destination: dest._id,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          visitDate: r.visitDate,
          helpfulVotes: r.helpfulVotes || 0
        });
        console.log(`  ✓ Added review for: ${dest.name} by ${user.name}`);
      } else {
        console.log(`  - Review exists for: ${dest.name} by ${user.name}`);
      }
    }

    // 3. Recalculate average ratings
    const allDests = await Destination.find({});
    for (const d of allDests) {
      await Review.calcAverageRating(d._id);
    }

    console.log('\nCommunity reviews seed & rating recalculation complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding reviews:', error.message);
    process.exit(1);
  }
}

seedUsersAndReviews();
