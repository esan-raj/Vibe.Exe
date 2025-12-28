import { Destination, Guide, Product, Booking, Itinerary, AdminUser } from '../types';

// ===== KOLKATA HERITAGE DATA =====

export const destinations: Destination[] = [
  {
    id: '1',
    name: 'Victoria Memorial',
    nameBengali: 'ভিক্টোরিয়া মেমোরিয়াল',
    description: 'Iconic white marble monument built in memory of Queen Victoria, featuring a museum with rare artifacts and beautiful gardens',
    image: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&h=600&q=80',
    category: 'heritage',
    rating: 4.8,
    location: { lat: 22.5448, lng: 88.3426 }
  },
  {
    id: '2',
    name: 'Howrah Bridge',
    nameBengali: 'হাওড়া ব্রিজ',
    description: 'The iconic cantilever bridge over the Hooghly River, a symbol of Kolkata connecting the city to Howrah',
    image: 'https://images.unsplash.com/photo-1536421469767-80559bb6f5e1?auto=format&fit=crop&w=800&h=600&q=80',
    category: 'heritage',
    rating: 4.7,
    location: { lat: 22.5851, lng: 88.3468 }
  },
  {
    id: '3',
    name: 'Dakshineswar Kali Temple',
    nameBengali: 'দক্ষিণেশ্বর কালী মন্দির',
    description: 'Famous Hindu temple dedicated to Goddess Kali, associated with Saint Ramakrishna Paramhansa',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&h=600&q=80',
    category: 'temples',
    rating: 4.9,
    location: { lat: 22.6552, lng: 88.3578 }
  },
  {
    id: '4',
    name: 'Kumartuli',
    nameBengali: 'কুমারটুলি',
    description: 'The famous potter\'s quarter where artisans create stunning clay idols for Durga Puja and other festivals',
    image: 'https://images.unsplash.com/photo-1599030641314-e7f9e2f5e8e1?auto=format&fit=crop&w=800&h=600&q=80',
    category: 'culture',
    rating: 4.6,
    location: { lat: 22.6000, lng: 88.3667 }
  },
  {
    id: '5',
    name: 'College Street',
    nameBengali: 'কলেজ স্ট্রীট',
    description: 'Asia\'s largest second-hand book market, surrounded by educational institutions and the iconic Indian Coffee House',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&h=600&q=80',
    category: 'literature',
    rating: 4.5,
    location: { lat: 22.5761, lng: 88.3628 }
  },
  {
    id: '6',
    name: 'Princep Ghat',
    nameBengali: 'প্রিন্সেপ ঘাট',
    description: 'Beautiful riverside ghat with Palladian architecture, perfect for evening walks and boat rides on the Hooghly',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&h=600&q=80',
    category: 'heritage',
    rating: 4.4,
    location: { lat: 22.5571, lng: 88.3282 }
  },
  {
    id: '7',
    name: 'Marble Palace',
    nameBengali: 'মার্বেল প্যালেস',
    description: 'A 19th-century palatial mansion with an exquisite collection of art, antiques, and rare marble sculptures',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&h=600&q=80',
    category: 'heritage',
    rating: 4.5,
    location: { lat: 22.5859, lng: 88.3642 }
  },
  {
    id: '8',
    name: 'Park Street',
    nameBengali: 'পার্ক স্ট্রীট',
    description: 'The iconic party street of Kolkata, famous for restaurants, nightlife, and Christmas celebrations',
    image: 'https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=800&h=600&q=80',
    category: 'food',
    rating: 4.6,
    location: { lat: 22.5512, lng: 88.3579 }
  },
  {
    id: '9',
    name: 'Kalighat Temple',
    nameBengali: 'কালীঘাট মন্দির',
    description: 'One of the 51 Shakti Peethas, an ancient Hindu temple dedicated to Goddess Kali',
    image: 'https://images.unsplash.com/photo-1545126178-862cdb469409?auto=format&fit=crop&w=800&h=600&q=80',
    category: 'temples',
    rating: 4.7,
    location: { lat: 22.5197, lng: 88.3434 }
  },
  {
    id: '10',
    name: 'Indian Museum',
    nameBengali: 'ইন্ডিয়ান মিউজিয়াম',
    description: 'The oldest and largest museum in India, housing rare antiques, fossils, armor, and Mughal paintings',
    image: 'https://images.unsplash.com/photo-1565060169194-19fabf63012e?auto=format&fit=crop&w=800&h=600&q=80',
    category: 'culture',
    rating: 4.4,
    location: { lat: 22.5581, lng: 88.3510 }
  },
  {
    id: '11',
    name: 'New Market (Hogg Market)',
    nameBengali: 'নিউ মার্কেট',
    description: 'Kolkata\'s iconic Victorian-era market selling everything from clothes to spices since 1874',
    image: 'https://images.unsplash.com/photo-1555529771-7888783a18d3?auto=format&fit=crop&w=800&h=600&q=80',
    category: 'markets',
    rating: 4.3,
    location: { lat: 22.5576, lng: 88.3520 }
  },
  {
    id: '12',
    name: 'Jorasanko Thakur Bari',
    nameBengali: 'জোড়াসাঁকো ঠাকুরবাড়ি',
    description: 'The ancestral home of Nobel Laureate Rabindranath Tagore, now a museum and university',
    image: 'https://images.unsplash.com/photo-1584806749948-697891c67821?auto=format&fit=crop&w=800&h=600&q=80',
    category: 'literature',
    rating: 4.8,
    location: { lat: 22.5894, lng: 88.3619 }
  }
];

export const guides: Guide[] = [
  {
    id: '1',
    name: 'Subhojit Chatterjee',
    nameBengali: 'শুভজিৎ চট্টোপাধ্যায়',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    rating: 4.9,
    experience: 12,
    languages: ['English', 'Hindi', 'Bengali'],
    specialties: ['Heritage Walks', 'Photography Tours', 'Colonial History'],
    pricePerDay: 2500,
    isVerified: true,
    location: 'North Kolkata',
    bio: 'A third-generation Kolkatan who knows every gully and para of the city. Specializes in heritage walks through colonial architecture.'
  },
  {
    id: '2',
    name: 'Dipanwita Roy',
    nameBengali: 'দীপান্বিতা রায়',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    rating: 4.8,
    experience: 8,
    languages: ['English', 'Bengali', 'French'],
    specialties: ['Durga Puja Tours', 'Art & Culture', 'Food Walks'],
    pricePerDay: 3000,
    isVerified: true,
    location: 'South Kolkata',
    bio: 'Art historian and Pujo enthusiast. Leads the most comprehensive Durga Puja pandal hopping tours in the city.'
  },
  {
    id: '3',
    name: 'Arnab Mukherjee',
    nameBengali: 'অর্ণব মুখার্জি',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    rating: 4.7,
    experience: 6,
    languages: ['English', 'Hindi', 'Bengali'],
    specialties: ['Literary Tours', 'Coffee House History', 'College Street'],
    pricePerDay: 2000,
    isVerified: true,
    location: 'Central Kolkata',
    bio: 'Literature professor and book collector. Expert on Kolkata\'s literary heritage and the legends of Coffee House adda.'
  },
  {
    id: '4',
    name: 'Rima Sen',
    nameBengali: 'রিমা সেন',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
    rating: 4.9,
    experience: 10,
    languages: ['English', 'Bengali', 'German'],
    specialties: ['Tram Heritage', 'Street Food', 'Night Photography'],
    pricePerDay: 2800,
    isVerified: true,
    location: 'Esplanade',
    bio: 'Tram historian and street food connoisseur. Has documented every tram route and the best puchkas in the city.'
  },
  {
    id: '5',
    name: 'Sourav Ghosh',
    nameBengali: 'সৌরভ ঘোষ',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
    rating: 4.6,
    experience: 5,
    languages: ['English', 'Hindi', 'Bengali'],
    specialties: ['Kumartuli Tours', 'Artisan Workshops', 'Idol Making'],
    pricePerDay: 2200,
    isVerified: true,
    location: 'Kumartuli',
    bio: 'Born in Kumartuli among the idol makers. Offers unique access to artisan workshops and the secrets of clay idol crafting.'
  }
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Baluchari Silk Saree',
    nameBengali: 'বালুচরী সিল্ক শাড়ি',
    description: 'Authentic hand-woven Baluchari saree with intricate mythological motifs from Bishnupur',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Textiles',
    seller: {
      name: 'Bishnupur Weavers Cooperative',
      rating: 4.9,
      isVerified: true
    },
    inStock: true
  },
  {
    id: '2',
    name: 'Dokra Durga Idol',
    nameBengali: 'ডোকরা দুর্গা মূর্তি',
    description: 'Traditional lost-wax brass casting of Goddess Durga, handcrafted by tribal artisans',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Art',
    seller: {
      name: 'Bankura Dokra Artisans',
      rating: 4.8,
      isVerified: true
    },
    inStock: true
  },
  {
    id: '3',
    name: 'Terracotta Horse',
    nameBengali: 'টেরাকোটা ঘোড়া',
    description: 'Iconic Bankura horse in terracotta, a symbol of Bengal\'s rich pottery heritage',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Handicrafts',
    seller: {
      name: 'Panchmura Potters Guild',
      rating: 4.7,
      isVerified: true
    },
    inStock: true
  },
  {
    id: '4',
    name: 'Patachitra Scroll Painting',
    nameBengali: 'পটচিত্র স্ক্রোল পেইন্টিং',
    description: 'Traditional narrative scroll painting depicting Durga Puja story, on cloth',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1579541814924-49fef17c5be5?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Art',
    seller: {
      name: 'Naya Village Patuas',
      rating: 4.9,
      isVerified: true
    },
    inStock: true
  },
  {
    id: '5',
    name: 'Kantha Embroidered Dupatta',
    nameBengali: 'কাঁথা এমব্রয়ডারি দুপাট্টা',
    description: 'Hand-stitched Kantha work on pure silk, each piece tells a unique story',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Textiles',
    seller: {
      name: 'Shantiniketan Kantha Collective',
      rating: 4.8,
      isVerified: true
    },
    inStock: true
  },
  {
    id: '6',
    name: 'Jamdani Saree',
    nameBengali: 'জামদানি শাড়ি',
    description: 'Exquisite muslin weave with supplementary weft technique, UNESCO heritage craft',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Textiles',
    seller: {
      name: 'Tangail Weavers Society',
      rating: 4.9,
      isVerified: true
    },
    inStock: true
  },
  {
    id: '7',
    name: 'Conch Shell Bangle Set',
    nameBengali: 'শাঁখা পোলা সেট',
    description: 'Traditional Bengali bridal bangles - Shakha (white conch) and Pola (red coral)',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Jewelry',
    seller: {
      name: 'Bow Bazar Shankha Artisans',
      rating: 4.6,
      isVerified: true
    },
    inStock: true
  },
  {
    id: '8',
    name: 'Miniature Tram Model',
    nameBengali: 'মিনিয়েচার ট্রাম মডেল',
    description: 'Handcrafted wooden replica of Kolkata\'s iconic yellow tram, perfect collector\'s item',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Souvenirs',
    seller: {
      name: 'Kolkata Craft Studio',
      rating: 4.5,
      isVerified: true
    },
    inStock: true
  }
];

export const bookings: Booking[] = [
  {
    id: '1',
    type: 'guide',
    title: 'Durga Puja Pandal Hopping with Dipanwita',
    titleBengali: 'দীপান্বিতার সাথে দুর্গা পুজো প্যান্ডেল হপিং',
    date: '2025-10-01',
    status: 'confirmed',
    amount: 6000,
    blockchainHash: '0x1a2b3c4d5e6f7890abcdef'
  },
  {
    id: '2',
    type: 'accommodation',
    title: 'Heritage Stay at The Oberoi Grand',
    titleBengali: 'দ্য ওবেরয় গ্র্যান্ডে হেরিটেজ স্টে',
    date: '2025-01-20',
    status: 'pending',
    amount: 12500
  },
  {
    id: '3',
    type: 'package',
    title: 'Complete Kolkata Heritage Tour - 3 Days',
    titleBengali: 'সম্পূর্ণ কলকাতা হেরিটেজ ট্যুর - ৩ দিন',
    date: '2025-02-15',
    status: 'confirmed',
    amount: 25000,
    blockchainHash: '0xabcdef1234567890fedcba'
  },
  {
    id: '4',
    type: 'guide',
    title: 'Victoria Memorial Heritage Walk',
    titleBengali: 'ভিক্টোরিয়া মেমোরিয়াল হেরিটেজ ওয়াক',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    status: 'confirmed',
    amount: 3500,
    blockchainHash: '0xfuture1234567890abcdef'
  }
];

export const itineraries: Itinerary[] = [
  {
    id: '1',
    title: 'Colonial Heritage Walk',
    titleBengali: 'ঔপনিবেশিক ঐতিহ্য হাঁটা',
    duration: 1,
    destinations: destinations.filter(d => d.category === 'heritage'),
    activities: ['Victoria Memorial Tour', 'Howrah Bridge Walk', 'St. Paul\'s Cathedral', 'Writer\'s Building'],
    estimatedCost: 2500,
    createdAt: '2025-01-10'
  },
  {
    id: '2',
    title: 'Durga Puja Special',
    titleBengali: 'দুর্গা পুজো স্পেশাল',
    duration: 2,
    destinations: destinations.filter(d => d.category === 'temples' || d.category === 'culture'),
    activities: ['Kumartuli Artisan Visit', 'Top 20 Pandal Hopping', 'Dhunuchi Naach', 'Bhog Prasad Experience'],
    estimatedCost: 8500,
    createdAt: '2025-01-08'
  },
  {
    id: '3',
    title: 'Literary & Culinary Kolkata',
    titleBengali: 'সাহিত্যিক ও রন্ধন কলকাতা',
    duration: 1,
    destinations: destinations.filter(d => d.category === 'literature' || d.category === 'food'),
    activities: ['College Street Book Hunt', 'Coffee House Adda', 'Park Street Food Walk', 'Mishti Doi Tasting'],
    estimatedCost: 3500,
    createdAt: '2025-01-12'
  }
];

// Kolkata-specific AI Tips
export const aiTips = [
  "🚃 Tram Route 36 passes through the most heritage spots - perfect for a vintage tour!",
  "🪔 Best Durga Puja pandals are in South Kolkata - start at Ekdalia Evergreen",
  "☕ For authentic adda, visit Indian Coffee House on College Street since 1942",
  "🎭 Kumartuli artisans start work on idols 4 months before Pujo - visit in July!",
  "📚 College Street has the largest second-hand book market in the world",
  "🌅 Princep Ghat sunset views are magical - arrive 30 mins before sunset",
  "🍛 Try Arsalan's biryani or 6 Ballygunge Place for authentic Bengali cuisine",
  "🏛️ Victoria Memorial is best visited early morning to avoid crowds",
  "🚕 Yellow taxis follow meter + ₹10 rule for short distances in the city",
  "🎨 Jorasanko Thakur Bari has Tagore's original artworks - don't miss it!",
  "🛕 Kalighat Temple allows short visits - go during aarti for the experience",
  "🌉 Howrah Bridge carries 100,000 vehicles daily - walk across at dawn!",
  "🎪 Park Street transforms during Christmas - best visited after 7 PM",
  "🎵 Rabindra Sadan hosts classical concerts - check schedule for baul performances",
  "🍰 Don't leave without trying mishti doi and sandesh from Balaram Mullick",
];

// Kolkata Testimonials
export const testimonials = [
  {
    id: '1',
    name: 'Anirban Chatterjee',
    nameBengali: 'অনির্বাণ চট্টোপাধ্যায়',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'The heritage walk through Kumartuli was magical! Watching artisans create Durga idols with such devotion - this app helped me discover the soul of Kolkata.',
    sentiment: 'Amazing 🎭',
    location: 'Mumbai, India'
  },
  {
    id: '2',
    name: 'Sarah Chen',
    nameBengali: 'সারা চেন',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'The Durga Puja route planner was a lifesaver! Visited 15 pandals without getting lost. The AI knew exactly when to avoid crowds.',
    sentiment: 'Incredible 🪔',
    location: 'Singapore'
  },
  {
    id: '3',
    name: 'Rahul Ghosh',
    nameBengali: 'রাহুল ঘোষ',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'Born in Kolkata but this app showed me places I never knew existed! The College Street book walk was pure nostalgia.',
    sentiment: 'Nostalgic 📚',
    location: 'Bangalore, India'
  },
  {
    id: '4',
    name: 'Emma Williams',
    nameBengali: 'এমা উইলিয়ামস',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'The tram heritage tour was unforgettable! Riding through Esplanade at sunset while the audio guide narrated history - pure magic.',
    sentiment: 'Magical 🚃',
    location: 'London, UK'
  },
  {
    id: '5',
    name: 'Priya Mukherjee',
    nameBengali: 'প্রিয়া মুখার্জি',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'Bought authentic Baluchari saree from verified artisans through this app. Blockchain certificate proves it\'s genuine handloom!',
    sentiment: 'Verified ✓',
    location: 'Delhi, India'
  },
  {
    id: '6',
    name: 'James Thompson',
    nameBengali: 'জেমস থম্পসন',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'The Adda AI companion talked about Tagore like a true Kolkatan! Recommended the best mishti doi shop - exactly what locals prefer.',
    sentiment: 'Authentic ☕',
    location: 'New York, USA'
  }
];

// Mock data for Admin Dashboard
export const adminUsers: AdminUser[] = [
  {
    id: '1',
    name: 'Arnab Banerjee',
    email: 'arnab.banerjee@kolkataheritage.in',
    role: 'tourist',
    status: 'Active',
    joinDate: '2025-01-15',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'
  },
  {
    id: '2',
    name: 'Dipanwita Roy',
    email: 'dipanwita.roy@kolkataheritage.in',
    role: 'guide',
    status: 'Active',
    joinDate: '2025-01-10',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
  },
  {
    id: '3',
    name: 'Sourav Ghosh',
    email: 'sourav.ghosh@kolkataheritage.in',
    role: 'seller',
    status: 'Active',
    joinDate: '2025-01-05',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop'
  },
  {
    id: '4',
    name: 'Rima Sen',
    email: 'rima.sen@kolkataheritage.in',
    role: 'guide',
    status: 'Active',
    joinDate: '2025-01-20',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop'
  },
  {
    id: '5',
    name: 'Subhojit Chatterjee',
    email: 'subhojit.chatterjee@kolkataheritage.in',
    role: 'guide',
    status: 'Active',
    joinDate: '2025-01-12',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop'
  }
];

// Mock data for Guide Dashboard - Kolkata Tours
export const guideTours = [
  {
    id: '1',
    title: 'Victoria Memorial & Colonial Heritage Walk',
    titleBengali: 'ভিক্টোরিয়া মেমোরিয়াল ও ঔপনিবেশিক ঐতিহ্য হাঁটা',
    description: 'Explore the grand Victoria Memorial and surrounding colonial architecture with expert narration',
    image: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=400&h=300&q=80',
    status: 'Active' as const,
    duration: '4 hours',
    price: 2500,
    bookings: 45
  },
  {
    id: '2',
    title: 'Durga Puja Pandal Hopping Special',
    titleBengali: 'দুর্গা পুজো প্যান্ডেল হপিং স্পেশাল',
    description: 'Experience the best Durga Puja pandals with insider access and cultural insights',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&h=300&q=80',
    status: 'Active' as const,
    duration: '8 hours',
    price: 4500,
    bookings: 128
  },
  {
    id: '3',
    title: 'Kumartuli Artisan Experience',
    titleBengali: 'কুমারটুলি শিল্পী অভিজ্ঞতা',
    description: 'Meet the clay idol makers and learn about the 300-year-old tradition of Kolkata',
    image: 'https://images.unsplash.com/photo-1599030641314-e7f9e2f5e8e1?auto=format&fit=crop&w=400&h=300&q=80',
    status: 'Active' as const,
    duration: '3 hours',
    price: 2000,
    bookings: 67
  },
  {
    id: '4',
    title: 'Tram Heritage & Street Food Tour',
    titleBengali: 'ট্রাম ঐতিহ্য ও স্ট্রিট ফুড ট্যুর',
    description: 'Ride the iconic Kolkata tram while sampling the best street food',
    image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=400&h=300&q=80',
    status: 'Draft' as const,
    duration: '5 hours',
    price: 3000,
    bookings: 0
  }
];

export const guideBookings = [
  {
    id: '1',
    tourName: 'Durga Puja Pandal Hopping Special',
    touristName: 'Sarah Chen',
    touristEmail: 'sarah.chen@email.com',
    date: '2025-10-01',
    status: 'Confirmed' as const,
    amount: 4500,
    participants: 2
  },
  {
    id: '2',
    tourName: 'Victoria Memorial & Colonial Heritage Walk',
    touristName: 'James Thompson',
    touristEmail: 'james.thompson@email.com',
    date: '2025-02-20',
    status: 'Pending' as const,
    amount: 5000,
    participants: 2
  },
  {
    id: '3',
    tourName: 'Kumartuli Artisan Experience',
    touristName: 'Emma Williams',
    touristEmail: 'emma.williams@email.com',
    date: '2025-02-25',
    status: 'Confirmed' as const,
    amount: 2000,
    participants: 1
  },
  {
    id: '4',
    tourName: 'Durga Puja Pandal Hopping Special',
    touristName: 'Rahul Ghosh',
    touristEmail: 'rahul.ghosh@email.com',
    date: '2025-10-02',
    status: 'Confirmed' as const,
    amount: 9000,
    participants: 2
  }
];

// Mock data for Marketplace Dashboard - Kolkata Artisan Products
export const vendorProducts = [
  {
    id: '1',
    name: 'Baluchari Silk Saree',
    nameBengali: 'বালুচরী সিল্ক শাড়ি',
    description: 'Authentic hand-woven Baluchari saree with intricate mythological motifs from Bishnupur',
    price: 15000,
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Textiles',
    status: 'Active' as const,
    sales: 89
  },
  {
    id: '2',
    name: 'Dokra Durga Idol',
    nameBengali: 'ডোকরা দুর্গা মূর্তি',
    description: 'Traditional lost-wax brass casting of Goddess Durga, handcrafted by tribal artisans',
    price: 8500,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Art',
    status: 'Active' as const,
    sales: 45
  },
  {
    id: '3',
    name: 'Terracotta Horse',
    nameBengali: 'টেরাকোটা ঘোড়া',
    description: 'Iconic Bankura horse in terracotta, a symbol of Bengal\'s rich pottery heritage',
    price: 1200,
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Handicrafts',
    status: 'Active' as const,
    sales: 234
  },
  {
    id: '4',
    name: 'Conch Shell Bangle Set',
    nameBengali: 'শাঁখা পোলা সেট',
    description: 'Traditional Bengali bridal bangles - Shakha (white conch) and Pola (red coral)',
    price: 2500,
    stock: 0,
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Jewelry',
    status: 'Out of Stock' as const,
    sales: 156
  }
];

// Pujo Pandals for special feature
export const pujoPandals = [
  {
    id: '1',
    name: 'Ekdalia Evergreen',
    nameBengali: 'একডালিয়া এভারগ্রিন',
    location: 'Ekdalia, South Kolkata',
    theme: 'Climate Change Awareness',
    rating: 4.9,
    crowdLevel: 'High',
    bestVisitTime: '2 AM - 5 AM',
    coordinates: { lat: 22.5023, lng: 88.3630 }
  },
  {
    id: '2',
    name: 'Bagbazar Sarbojanin',
    nameBengali: 'বাগবাজার সার্বজনীন',
    location: 'Bagbazar, North Kolkata',
    theme: 'Traditional Heritage',
    rating: 4.8,
    crowdLevel: 'Very High',
    bestVisitTime: '3 AM - 6 AM',
    coordinates: { lat: 22.6017, lng: 88.3654 }
  },
  {
    id: '3',
    name: 'Santosh Mitra Square',
    nameBengali: 'সন্তোষ মিত্র স্কয়ার',
    location: 'Sealdah, Central Kolkata',
    theme: 'Artistic Innovation',
    rating: 4.9,
    crowdLevel: 'Very High',
    bestVisitTime: '2 AM - 5 AM',
    coordinates: { lat: 22.5682, lng: 88.3737 }
  },
  {
    id: '4',
    name: 'College Square',
    nameBengali: 'কলেজ স্কয়ার',
    location: 'College Street, Central Kolkata',
    theme: 'Education & Literature',
    rating: 4.6,
    crowdLevel: 'Medium',
    bestVisitTime: '8 PM - 12 AM',
    coordinates: { lat: 22.5761, lng: 88.3628 }
  },
  {
    id: '5',
    name: 'Kumartuli Park',
    nameBengali: 'কুমারটুলি পার্ক',
    location: 'Kumartuli, North Kolkata',
    theme: 'Artisan Heritage',
    rating: 4.7,
    crowdLevel: 'Medium',
    bestVisitTime: '6 PM - 10 PM',
    coordinates: { lat: 22.6000, lng: 88.3667 }
  }
];

// Tram Routes for heritage feature
export const tramRoutes = [
  {
    id: '1',
    routeNumber: '36',
    from: 'Esplanade',
    to: 'Gariahat',
    stops: ['Esplanade', 'Park Street', 'Hazra', 'Kalighat', 'Gariahat'],
    heritage: 'Colonial era route, passing through major landmarks',
    frequency: '15 minutes',
    operatingHours: '5:00 AM - 10:00 PM'
  },
  {
    id: '2',
    routeNumber: '5',
    from: 'Howrah Station',
    to: 'Esplanade',
    stops: ['Howrah Station', 'BBD Bagh', 'Esplanade'],
    heritage: 'Historic route connecting the railway station to heart of Kolkata',
    frequency: '20 minutes',
    operatingHours: '6:00 AM - 9:00 PM'
  },
  {
    id: '3',
    routeNumber: '25',
    from: 'Shyambazar',
    to: 'Tollygunge',
    stops: ['Shyambazar', 'Bagbazar', 'Sealdah', 'Park Circus', 'Tollygunge'],
    heritage: 'North-South route through cultural heart of the city',
    frequency: '12 minutes',
    operatingHours: '5:30 AM - 10:30 PM'
  }
];
