import { Request, Response } from 'express';

interface NearbyPlacesRequest {
  lat: number;
  lng: number;
  radius?: number; // in meters, default 5000 (5km)
}

interface TouristPlace {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  distance: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  image?: string;
  openingHours?: string;
  estimatedVisitTime?: string;
}

// Mock tourist places data for Kolkata area
const kolkataTouristPlaces: TouristPlace[] = [
  {
    id: '1',
    name: 'Victoria Memorial',
    description: 'Iconic marble monument dedicated to Queen Victoria, showcasing Indo-Saracenic architecture with beautiful gardens.',
    category: 'Historical Monument',
    rating: 4.5,
    distance: 0,
    coordinates: { lat: 22.5448, lng: 88.3426 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '10:00 AM - 6:00 PM (Closed on Mondays)',
    estimatedVisitTime: '2-3 hours'
  },
  {
    id: '2',
    name: 'Howrah Bridge',
    description: 'Famous cantilever bridge over the Hooghly River, an engineering marvel and iconic symbol of Kolkata.',
    category: 'Landmark',
    rating: 4.3,
    distance: 0,
    coordinates: { lat: 22.5958, lng: 88.3468 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '24 hours',
    estimatedVisitTime: '1 hour'
  },
  {
    id: '3',
    name: 'Dakshineswar Kali Temple',
    description: 'Sacred Hindu temple dedicated to Goddess Kali, known for its spiritual significance and beautiful architecture.',
    category: 'Religious Site',
    rating: 4.6,
    distance: 0,
    coordinates: { lat: 22.6553, lng: 88.3578 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '6:00 AM - 12:30 PM, 3:00 PM - 9:00 PM',
    estimatedVisitTime: '1-2 hours'
  },
  {
    id: '4',
    name: 'Indian Museum',
    description: 'Oldest and largest museum in India with vast collections of artifacts, fossils, and cultural treasures.',
    category: 'Museum',
    rating: 4.2,
    distance: 0,
    coordinates: { lat: 22.5579, lng: 88.3511 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '10:00 AM - 5:00 PM (Closed on Mondays)',
    estimatedVisitTime: '2-4 hours'
  },
  {
    id: '5',
    name: 'Kalighat Temple',
    description: 'Ancient temple dedicated to Goddess Kali, one of the 51 Shakti Peethas with deep religious significance.',
    category: 'Religious Site',
    rating: 4.4,
    distance: 0,
    coordinates: { lat: 22.5186, lng: 88.3426 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '5:00 AM - 2:00 PM, 5:00 PM - 10:30 PM',
    estimatedVisitTime: '1 hour'
  },
  {
    id: '6',
    name: 'Belur Math',
    description: 'Headquarters of the Ramakrishna Math and Mission, known for its architectural beauty and spiritual atmosphere.',
    category: 'Religious Site',
    rating: 4.7,
    distance: 0,
    coordinates: { lat: 22.6322, lng: 88.3576 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '6:00 AM - 12:00 PM, 4:00 PM - 7:30 PM',
    estimatedVisitTime: '1-2 hours'
  },
  {
    id: '7',
    name: 'St. Paul\'s Cathedral',
    description: 'Beautiful Anglican cathedral with Gothic Revival architecture and stunning stained glass windows.',
    category: 'Religious Site',
    rating: 4.3,
    distance: 0,
    coordinates: { lat: 22.5441, lng: 88.3518 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '9:00 AM - 12:00 PM, 3:00 PM - 6:00 PM',
    estimatedVisitTime: '1 hour'
  },
  {
    id: '8',
    name: 'Marble Palace',
    description: 'Neoclassical mansion with exquisite marble sculptures, paintings, and antique collections.',
    category: 'Historical Monument',
    rating: 4.1,
    distance: 0,
    coordinates: { lat: 22.5975, lng: 88.3712 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '10:00 AM - 4:00 PM (Closed on Mondays and Thursdays)',
    estimatedVisitTime: '1-2 hours'
  },
  {
    id: '9',
    name: 'Birla Planetarium',
    description: 'One of the largest planetariums in Asia, offering fascinating shows about astronomy and space.',
    category: 'Educational',
    rating: 4.0,
    distance: 0,
    coordinates: { lat: 22.5431, lng: 88.3503 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '12:00 PM - 7:30 PM (Closed on Thursdays)',
    estimatedVisitTime: '1-2 hours'
  },
  {
    id: '10',
    name: 'New Market',
    description: 'Historic shopping complex offering a wide variety of goods from clothing to souvenirs.',
    category: 'Shopping',
    rating: 3.8,
    distance: 0,
    coordinates: { lat: 22.5564, lng: 88.3501 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '10:00 AM - 8:00 PM',
    estimatedVisitTime: '2-3 hours'
  },
  // Add places closer to the default test location (22.5726, 88.3639)
  {
    id: '11',
    name: 'Kolkata Maidan',
    description: 'Large urban park in the heart of Kolkata, perfect for morning walks and recreational activities.',
    category: 'Park',
    rating: 4.1,
    distance: 0,
    coordinates: { lat: 22.5726, lng: 88.3539 }, // Very close to test location
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '24 hours',
    estimatedVisitTime: '1-2 hours'
  },
  {
    id: '12',
    name: 'Eden Gardens',
    description: 'Historic cricket stadium and one of the most iconic sports venues in India.',
    category: 'Sports Venue',
    rating: 4.4,
    distance: 0,
    coordinates: { lat: 22.5645, lng: 88.3433 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: 'Match days only',
    estimatedVisitTime: '3-4 hours'
  },
  {
    id: '13',
    name: 'Fort William',
    description: 'Historic fort built by the British East India Company, now serving as military headquarters.',
    category: 'Historical Monument',
    rating: 4.0,
    distance: 0,
    coordinates: { lat: 22.5555, lng: 88.3444 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: 'Restricted access',
    estimatedVisitTime: '1 hour'
  },
  // Restaurants
  {
    id: '14',
    name: 'Peter Cat',
    description: 'Famous restaurant known for its Chelo Kebabs and continental cuisine in Park Street.',
    category: 'Restaurant',
    rating: 4.3,
    distance: 0,
    coordinates: { lat: 22.5519, lng: 88.3617 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '12:00 PM - 11:30 PM',
    estimatedVisitTime: '1-2 hours'
  },
  {
    id: '15',
    name: 'Flurys',
    description: 'Iconic tearoom and confectionery on Park Street, serving since 1927.',
    category: 'Restaurant',
    rating: 4.2,
    distance: 0,
    coordinates: { lat: 22.5498, lng: 88.3635 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '7:30 AM - 10:00 PM',
    estimatedVisitTime: '1 hour'
  },
  {
    id: '16',
    name: 'Arsalan',
    description: 'Renowned for authentic Kolkata biryani and Mughlai cuisine.',
    category: 'Restaurant',
    rating: 4.5,
    distance: 0,
    coordinates: { lat: 22.5389, lng: 88.3478 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '11:00 AM - 11:00 PM',
    estimatedVisitTime: '1-2 hours'
  },
  {
    id: '17',
    name: 'Kewpies Kitchen',
    description: 'Authentic Bengali home-style cooking in a cozy heritage setting.',
    category: 'Restaurant',
    rating: 4.4,
    distance: 0,
    coordinates: { lat: 22.5267, lng: 88.3589 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '12:00 PM - 3:00 PM, 7:00 PM - 10:00 PM',
    estimatedVisitTime: '1-2 hours'
  },
  // Shopping Malls
  {
    id: '18',
    name: 'South City Mall',
    description: 'One of the largest shopping malls in Eastern India with multiple brands and entertainment.',
    category: 'Shopping Mall',
    rating: 4.2,
    distance: 0,
    coordinates: { lat: 22.5067, lng: 88.3689 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '11:00 AM - 10:00 PM',
    estimatedVisitTime: '2-4 hours'
  },
  {
    id: '19',
    name: 'Quest Mall',
    description: 'Premium shopping destination with luxury brands, dining, and entertainment options.',
    category: 'Shopping Mall',
    rating: 4.3,
    distance: 0,
    coordinates: { lat: 22.5578, lng: 88.3456 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '11:00 AM - 10:00 PM',
    estimatedVisitTime: '2-4 hours'
  },
  {
    id: '20',
    name: 'City Centre Salt Lake',
    description: 'Modern shopping mall in Salt Lake with diverse retail and food options.',
    category: 'Shopping Mall',
    rating: 4.1,
    distance: 0,
    coordinates: { lat: 22.5789, lng: 88.4156 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '10:00 AM - 10:00 PM',
    estimatedVisitTime: '2-3 hours'
  },
  {
    id: '21',
    name: 'Acropolis Mall',
    description: 'Popular shopping and entertainment complex in Kasba with multiplex and food court.',
    category: 'Shopping Mall',
    rating: 4.0,
    distance: 0,
    coordinates: { lat: 22.5156, lng: 88.3889 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '11:00 AM - 9:30 PM',
    estimatedVisitTime: '2-3 hours'
  },
  // Transit Hubs
  {
    id: '22',
    name: 'Sealdah Railway Station',
    description: 'Major railway terminus connecting Kolkata to North and East Bengal.',
    category: 'Transit Hub',
    rating: 3.8,
    distance: 0,
    coordinates: { lat: 22.5689, lng: 88.3694 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '24 hours',
    estimatedVisitTime: '30 minutes'
  },
  {
    id: '23',
    name: 'Howrah Junction',
    description: 'One of the busiest railway stations in India, connecting to all major cities.',
    category: 'Transit Hub',
    rating: 3.9,
    distance: 0,
    coordinates: { lat: 22.5856, lng: 88.3456 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '24 hours',
    estimatedVisitTime: '30 minutes'
  },
  {
    id: '24',
    name: 'Netaji Subhash Chandra Bose International Airport',
    description: 'Primary airport serving Kolkata and Eastern India with domestic and international flights.',
    category: 'Transit Hub',
    rating: 4.0,
    distance: 0,
    coordinates: { lat: 22.6547, lng: 88.4467 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '24 hours',
    estimatedVisitTime: '1 hour'
  },
  // Metro Stations
  {
    id: '25',
    name: 'Esplanade Metro Station',
    description: 'Central metro station connecting North-South and East-West metro lines.',
    category: 'Metro Station',
    rating: 3.7,
    distance: 0,
    coordinates: { lat: 22.5689, lng: 88.3478 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '6:00 AM - 10:00 PM',
    estimatedVisitTime: '15 minutes'
  },
  {
    id: '26',
    name: 'Kalighat Metro Station',
    description: 'Important metro station on the North-South line near Kalighat Temple.',
    category: 'Metro Station',
    rating: 3.6,
    distance: 0,
    coordinates: { lat: 22.5167, lng: 88.3411 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '6:00 AM - 10:00 PM',
    estimatedVisitTime: '15 minutes'
  },
  {
    id: '27',
    name: 'Park Street Metro Station',
    description: 'Popular metro station in the heart of Kolkata\'s commercial district.',
    category: 'Metro Station',
    rating: 3.8,
    distance: 0,
    coordinates: { lat: 22.5489, lng: 88.3622 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '6:00 AM - 10:00 PM',
    estimatedVisitTime: '15 minutes'
  },
  {
    id: '28',
    name: 'Maidan Metro Station',
    description: 'Metro station serving the Maidan area and nearby attractions.',
    category: 'Metro Station',
    rating: 3.5,
    distance: 0,
    coordinates: { lat: 22.5578, lng: 88.3456 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '6:00 AM - 10:00 PM',
    estimatedVisitTime: '15 minutes'
  },
  {
    id: '29',
    name: 'Chandni Chowk Metro Station',
    description: 'Metro station in the bustling Chandni Chowk market area.',
    category: 'Metro Station',
    rating: 3.4,
    distance: 0,
    coordinates: { lat: 22.5789, lng: 88.3567 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '6:00 AM - 10:00 PM',
    estimatedVisitTime: '15 minutes'
  },
  {
    id: '30',
    name: 'Rabindra Sadan Metro Station',
    description: 'Metro station near cultural centers and Nandan cinema complex.',
    category: 'Metro Station',
    rating: 3.6,
    distance: 0,
    coordinates: { lat: 22.5456, lng: 88.3567 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '6:00 AM - 10:00 PM',
    estimatedVisitTime: '15 minutes'
  },
  {
    id: '31',
    name: 'Jatin Das Park Metro Station',
    description: 'Metro station serving the southern part of central Kolkata.',
    category: 'Metro Station',
    rating: 3.5,
    distance: 0,
    coordinates: { lat: 22.5334, lng: 88.3578 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '6:00 AM - 10:00 PM',
    estimatedVisitTime: '15 minutes'
  },
  {
    id: '32',
    name: 'Tollygunge Metro Station',
    description: 'Southern terminus of the North-South metro line.',
    category: 'Metro Station',
    rating: 3.7,
    distance: 0,
    coordinates: { lat: 22.4789, lng: 88.3567 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '6:00 AM - 10:00 PM',
    estimatedVisitTime: '15 minutes'
  },
  // Bus Stops
  {
    id: '33',
    name: 'Esplanade Bus Terminus',
    description: 'Major bus terminus in central Kolkata with routes to all parts of the city.',
    category: 'Bus Stop',
    rating: 3.2,
    distance: 0,
    coordinates: { lat: 22.5678, lng: 88.3489 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '5:00 AM - 11:00 PM',
    estimatedVisitTime: '10 minutes'
  },
  {
    id: '34',
    name: 'Park Street Bus Stop',
    description: 'Busy bus stop on Park Street serving multiple city routes.',
    category: 'Bus Stop',
    rating: 3.1,
    distance: 0,
    coordinates: { lat: 22.5498, lng: 88.3635 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '5:00 AM - 11:00 PM',
    estimatedVisitTime: '10 minutes'
  },
  {
    id: '35',
    name: 'Shyama Charan Mukherjee Street Bus Stop',
    description: 'Important bus stop connecting to various parts of South Kolkata.',
    category: 'Bus Stop',
    rating: 3.0,
    distance: 0,
    coordinates: { lat: 22.5389, lng: 88.3478 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '5:00 AM - 11:00 PM',
    estimatedVisitTime: '10 minutes'
  },
  {
    id: '36',
    name: 'Sealdah Bus Stand',
    description: 'Bus terminal near Sealdah railway station with suburban routes.',
    category: 'Bus Stop',
    rating: 3.3,
    distance: 0,
    coordinates: { lat: 22.5689, lng: 88.3694 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '5:00 AM - 11:00 PM',
    estimatedVisitTime: '10 minutes'
  },
  {
    id: '37',
    name: 'Howrah Bridge Bus Stop',
    description: 'Bus stop near the iconic Howrah Bridge with cross-river connections.',
    category: 'Bus Stop',
    rating: 3.2,
    distance: 0,
    coordinates: { lat: 22.5958, lng: 88.3468 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '5:00 AM - 11:00 PM',
    estimatedVisitTime: '10 minutes'
  },
  {
    id: '38',
    name: 'Gariahat Bus Stop',
    description: 'Major bus stop in South Kolkata serving shopping and residential areas.',
    category: 'Bus Stop',
    rating: 3.1,
    distance: 0,
    coordinates: { lat: 22.5167, lng: 88.3611 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '5:00 AM - 11:00 PM',
    estimatedVisitTime: '10 minutes'
  },
  {
    id: '39',
    name: 'Rashbehari Avenue Bus Stop',
    description: 'Busy bus stop on Rashbehari Avenue connecting to southern suburbs.',
    category: 'Bus Stop',
    rating: 3.0,
    distance: 0,
    coordinates: { lat: 22.5067, lng: 88.3689 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '5:00 AM - 11:00 PM',
    estimatedVisitTime: '10 minutes'
  },
  {
    id: '40',
    name: 'Ballygunge Phari Bus Stop',
    description: 'Important bus junction in Ballygunge area with multiple route connections.',
    category: 'Bus Stop',
    rating: 3.2,
    distance: 0,
    coordinates: { lat: 22.5267, lng: 88.3589 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '5:00 AM - 11:00 PM',
    estimatedVisitTime: '10 minutes'
  },
  {
    id: '41',
    name: 'Salt Lake Bus Terminus',
    description: 'Major bus terminus serving Salt Lake City and IT sector areas.',
    category: 'Bus Stop',
    rating: 3.4,
    distance: 0,
    coordinates: { lat: 22.5789, lng: 88.4156 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '5:00 AM - 11:00 PM',
    estimatedVisitTime: '10 minutes'
  },
  {
    id: '42',
    name: 'New Market Bus Stop',
    description: 'Bus stop near New Market shopping area with city-wide connections.',
    category: 'Bus Stop',
    rating: 3.1,
    distance: 0,
    coordinates: { lat: 22.5564, lng: 88.3501 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '5:00 AM - 11:00 PM',
    estimatedVisitTime: '10 minutes'
  },
  // Salt Lake / New Town Area Places (around 22.5758, 88.4281)
  {
    id: '43',
    name: 'Salt Lake Stadium (Vivekananda Yuba Bharati Krirangan)',
    description: 'One of the largest football stadiums in the world, hosting major sporting events.',
    category: 'Sports Venue',
    rating: 4.3,
    distance: 0,
    coordinates: { lat: 22.5645, lng: 88.4214 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: 'Event days only',
    estimatedVisitTime: '2-3 hours'
  },
  {
    id: '44',
    name: 'City Centre Salt Lake',
    description: 'Modern shopping mall in Salt Lake with diverse retail and food options.',
    category: 'Shopping Mall',
    rating: 4.1,
    distance: 0,
    coordinates: { lat: 22.5789, lng: 88.4156 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '10:00 AM - 10:00 PM',
    estimatedVisitTime: '2-3 hours'
  },
  {
    id: '45',
    name: 'Salt Lake Sector V IT Hub',
    description: 'Major IT and business district with modern office complexes and tech companies.',
    category: 'Landmark',
    rating: 4.0,
    distance: 0,
    coordinates: { lat: 22.5734, lng: 88.4367 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '24 hours',
    estimatedVisitTime: '1 hour'
  },
  {
    id: '46',
    name: 'Karunamoyee Metro Station',
    description: 'Important metro station serving Salt Lake City and IT sector areas.',
    category: 'Metro Station',
    rating: 3.8,
    distance: 0,
    coordinates: { lat: 22.5756, lng: 88.4289 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '6:00 AM - 10:00 PM',
    estimatedVisitTime: '15 minutes'
  },
  {
    id: '47',
    name: 'Salt Lake Sector V Metro Station',
    description: 'Metro station in the heart of Salt Lake IT district.',
    category: 'Metro Station',
    rating: 3.7,
    distance: 0,
    coordinates: { lat: 22.5734, lng: 88.4367 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '6:00 AM - 10:00 PM',
    estimatedVisitTime: '15 minutes'
  },
  {
    id: '48',
    name: 'Central Park Metro Station',
    description: 'Metro station near Central Park in Salt Lake.',
    category: 'Metro Station',
    rating: 3.6,
    distance: 0,
    coordinates: { lat: 22.5823, lng: 88.4178 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '6:00 AM - 10:00 PM',
    estimatedVisitTime: '15 minutes'
  },
  {
    id: '49',
    name: 'Salt Lake Bus Terminus',
    description: 'Major bus terminus serving Salt Lake City and IT sector areas.',
    category: 'Bus Stop',
    rating: 3.4,
    distance: 0,
    coordinates: { lat: 22.5789, lng: 88.4156 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '5:00 AM - 11:00 PM',
    estimatedVisitTime: '10 minutes'
  },
  {
    id: '50',
    name: 'Sector V Bus Stop',
    description: 'Bus stop serving the IT district and office complexes.',
    category: 'Bus Stop',
    rating: 3.3,
    distance: 0,
    coordinates: { lat: 22.5734, lng: 88.4367 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '5:00 AM - 11:00 PM',
    estimatedVisitTime: '10 minutes'
  },
  {
    id: '51',
    name: 'Karunamoyee Bus Stop',
    description: 'Busy bus stop near Karunamoyee metro station with multiple routes.',
    category: 'Bus Stop',
    rating: 3.2,
    distance: 0,
    coordinates: { lat: 22.5756, lng: 88.4289 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '5:00 AM - 11:00 PM',
    estimatedVisitTime: '10 minutes'
  },
  {
    id: '52',
    name: 'Central Park Salt Lake',
    description: 'Large urban park in Salt Lake with walking paths, lake, and recreational facilities.',
    category: 'Park',
    rating: 4.2,
    distance: 0,
    coordinates: { lat: 22.5823, lng: 88.4178 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '5:00 AM - 9:00 PM',
    estimatedVisitTime: '1-2 hours'
  },
  {
    id: '53',
    name: 'Nicco Park',
    description: 'Popular amusement park with rides, games, and entertainment for families.',
    category: 'Park',
    rating: 4.0,
    distance: 0,
    coordinates: { lat: 22.5645, lng: 88.4214 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '10:30 AM - 7:30 PM',
    estimatedVisitTime: '3-4 hours'
  },
  {
    id: '54',
    name: 'Swabhumi Heritage Park',
    description: 'Cultural heritage park showcasing Bengali traditions, crafts, and architecture.',
    category: 'Historical Monument',
    rating: 4.1,
    distance: 0,
    coordinates: { lat: 22.5567, lng: 88.4289 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '10:00 AM - 8:00 PM',
    estimatedVisitTime: '2-3 hours'
  },
  {
    id: '55',
    name: 'Eco Tourism Park',
    description: 'Large eco-friendly park with lakes, gardens, and nature trails in New Town.',
    category: 'Park',
    rating: 4.3,
    distance: 0,
    coordinates: { lat: 22.5889, lng: 88.4756 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '9:00 AM - 6:00 PM',
    estimatedVisitTime: '2-4 hours'
  },
  {
    id: '56',
    name: 'Cafe Coffee Day Salt Lake',
    description: 'Popular coffee chain outlet in Salt Lake for quick refreshments.',
    category: 'Restaurant',
    rating: 3.8,
    distance: 0,
    coordinates: { lat: 22.5756, lng: 88.4289 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '8:00 AM - 11:00 PM',
    estimatedVisitTime: '30 minutes'
  },
  {
    id: '57',
    name: 'Mainland China Salt Lake',
    description: 'Renowned Chinese restaurant chain with authentic cuisine.',
    category: 'Restaurant',
    rating: 4.1,
    distance: 0,
    coordinates: { lat: 22.5789, lng: 88.4156 },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    openingHours: '12:00 PM - 11:00 PM',
    estimatedVisitTime: '1-2 hours'
  }
];

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

// Generate dynamic places around user location if no static places found
const generateDynamicPlaces = (userLat: number, userLng: number, radius: number): TouristPlace[] => {
  const dynamicPlaces: TouristPlace[] = [];
  
  // Generate places in a grid pattern around user location
  const radiusInDegrees = radius / 111000; // Rough conversion: 1 degree ≈ 111km
  const gridSize = 0.01; // About 1km spacing
  
  const placeTypes = [
    { category: 'Metro Station', name: 'Metro Station', icon: 'M', rating: 3.5 },
    { category: 'Bus Stop', name: 'Bus Stop', icon: 'B', rating: 3.2 },
    { category: 'Restaurant', name: 'Local Restaurant', icon: 'R', rating: 4.0 },
    { category: 'Shopping Mall', name: 'Shopping Center', icon: 'S', rating: 3.8 },
    { category: 'Park', name: 'Local Park', icon: 'P', rating: 4.1 },
    { category: 'Historical Monument', name: 'Heritage Site', icon: 'H', rating: 4.2 }
  ];
  
  let placeId = 1000; // Start with high ID to avoid conflicts
  
  // Generate places in different directions
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8; // 8 directions
    const distance = Math.random() * (radius * 0.8) + (radius * 0.2); // Random distance within radius
    
    const lat = userLat + (Math.cos(angle) * distance) / 111000;
    const lng = userLng + (Math.sin(angle) * distance) / (111000 * Math.cos(userLat * Math.PI / 180));
    
    const placeType = placeTypes[Math.floor(Math.random() * placeTypes.length)];
    
    dynamicPlaces.push({
      id: `dynamic-${placeId++}`,
      name: `${placeType.name} ${i + 1}`,
      description: `Nearby ${placeType.category.toLowerCase()} within walking distance.`,
      category: placeType.category,
      rating: placeType.rating + (Math.random() * 0.4 - 0.2), // ±0.2 variation
      distance: calculateDistance(userLat, userLng, lat, lng),
      coordinates: { lat, lng },
      openingHours: placeType.category.includes('Metro') || placeType.category.includes('Bus') 
        ? '6:00 AM - 10:00 PM' 
        : '9:00 AM - 9:00 PM',
      estimatedVisitTime: placeType.category.includes('Metro') || placeType.category.includes('Bus')
        ? '15 minutes'
        : '1-2 hours'
    });
  }
  
  return dynamicPlaces.sort((a, b) => a.distance - b.distance);
};

export const getNearbyPlaces = async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius = 5000 } = req.body as NearbyPlacesRequest;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    console.log(`🗺️ Finding places near ${lat}, ${lng} within ${radius}m`);

    // Calculate distances and filter places within radius
    let nearbyPlaces = kolkataTouristPlaces
      .map(place => ({
        ...place,
        distance: calculateDistance(lat, lng, place.coordinates.lat, place.coordinates.lng)
      }))
      .filter(place => place.distance <= radius)
      .sort((a, b) => a.distance - b.distance); // Sort by distance

    // If no places found within radius, generate some nearby places dynamically
    if (nearbyPlaces.length === 0) {
      console.log(`⚠️ No places found within ${radius}m, generating dynamic places`);
      nearbyPlaces = generateDynamicPlaces(lat, lng, radius);
    }

    console.log(`✅ Found ${nearbyPlaces.length} places within ${radius}m`);

    res.json({
      success: true,
      data: {
        places: nearbyPlaces,
        userLocation: { lat, lng },
        radius,
        count: nearbyPlaces.length
      }
    });

  } catch (error: any) {
    console.error('❌ Error finding nearby places:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find nearby places',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getPlaceDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const place = kolkataTouristPlaces.find(p => p.id === id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }

    res.json({
      success: true,
      data: place
    });

  } catch (error: any) {
    console.error('❌ Error getting place details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get place details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getAISuggestions = async (req: Request, res: Response) => {
  try {
    const { lat, lng, preferences = [], radius = 5000 } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    console.log(`🤖 AI Suggestions for ${lat}, ${lng} with preferences: ${preferences.join(', ')}`);

    // Calculate distances and filter places within radius
    const allPlaces = kolkataTouristPlaces
      .map(place => ({
        ...place,
        distance: calculateDistance(lat, lng, place.coordinates.lat, place.coordinates.lng)
      }))
      .filter(place => place.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    // AI-powered categorization and suggestions
    const suggestions = {
      restaurants: allPlaces.filter(p => p.category === 'Restaurant').slice(0, 5),
      shopping: allPlaces.filter(p => p.category === 'Shopping Mall').slice(0, 5),
      transit: allPlaces.filter(p => 
        ['Transit Hub', 'Metro Station', 'Bus Stop'].includes(p.category)
      ).slice(0, 10),
      metroStations: allPlaces.filter(p => p.category === 'Metro Station').slice(0, 8),
      busStops: allPlaces.filter(p => p.category === 'Bus Stop').slice(0, 8),
      heritage: allPlaces.filter(p => 
        ['Historical Monument', 'Religious Site', 'Museum'].includes(p.category)
      ).slice(0, 8),
      attractions: allPlaces.filter(p => 
        ['Historical Monument', 'Religious Site', 'Museum', 'Landmark', 'Park', 'Sports Venue'].includes(p.category)
      ).slice(0, 8),
      recommended: [] as any[]
    };

    // AI recommendation logic based on preferences and proximity
    const recommendedPlaces = [];

    // If user prefers heritage, prioritize historical and cultural sites
    if (preferences.includes('heritage') || preferences.includes('history') || preferences.includes('culture')) {
      recommendedPlaces.push(...suggestions.heritage.filter(h => h.rating >= 4.0).slice(0, 2));
    }

    // If user prefers restaurants, prioritize highly rated ones nearby
    if (preferences.includes('restaurants') || preferences.includes('food')) {
      recommendedPlaces.push(...suggestions.restaurants.filter(r => r.rating >= 4.2).slice(0, 2));
    }

    // If user prefers shopping, suggest malls with good ratings
    if (preferences.includes('shopping') || preferences.includes('mall')) {
      recommendedPlaces.push(...suggestions.shopping.filter(s => s.rating >= 4.0).slice(0, 2));
    }

    // If user prefers transit, suggest nearest stations
    if (preferences.includes('transit') || preferences.includes('transport')) {
      recommendedPlaces.push(...suggestions.transit.slice(0, 2));
    }

    // Always include top-rated attractions
    recommendedPlaces.push(...suggestions.attractions.filter(a => a.rating >= 4.3).slice(0, 3));

    // Remove duplicates and sort by rating and distance
    suggestions.recommended = Array.from(new Set(recommendedPlaces))
      .sort((a, b) => (b.rating - a.rating) || (a.distance - b.distance))
      .slice(0, 6);

    // Generate AI insights
    const insights = {
      totalPlaces: allPlaces.length,
      nearestRestaurant: suggestions.restaurants[0]?.name || 'None found',
      nearestMall: suggestions.shopping[0]?.name || 'None found',
      nearestTransit: suggestions.transit[0]?.name || 'None found',
      nearestMetro: suggestions.metroStations[0]?.name || 'None found',
      nearestBusStop: suggestions.busStops[0]?.name || 'None found',
      nearestHeritage: suggestions.heritage[0]?.name || 'None found',
      averageDistance: allPlaces.length > 0 ? 
        Math.round(allPlaces.reduce((sum, p) => sum + p.distance, 0) / allPlaces.length) : 0,
      recommendation: generateRecommendationText(suggestions, preferences)
    };

    console.log(`✅ AI generated ${suggestions.recommended.length} recommendations`);

    res.json({
      success: true,
      data: {
        suggestions,
        insights,
        userLocation: { lat, lng },
        radius,
        preferences
      }
    });

  } catch (error: any) {
    console.error('❌ Error generating AI suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Generate personalized recommendation text
const generateRecommendationText = (suggestions: any, preferences: string[]): string => {
  const { restaurants, shopping, transit, attractions, heritage } = suggestions;
  
  let text = "Based on your location, here's what I recommend: ";
  
  if (heritage.length > 0) {
    text += `Explore ${heritage[0].name} for rich cultural heritage (${Math.round(heritage[0].distance)}m away). `;
  }
  
  if (restaurants.length > 0) {
    text += `Try ${restaurants[0].name} for great food (${Math.round(restaurants[0].distance)}m away). `;
  }
  
  if (shopping.length > 0) {
    text += `Visit ${shopping[0].name} for shopping (${Math.round(shopping[0].distance)}m away). `;
  }
  
  if (attractions.length > 0) {
    text += `Don't miss ${attractions[0].name} - it's highly rated and nearby. `;
  }
  
  if (transit.length > 0) {
    text += `${transit[0].name} is your closest transit option for getting around.`;
  }
  
  return text || "Explore the area to discover amazing places!";
};