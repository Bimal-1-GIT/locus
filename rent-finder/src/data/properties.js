// Mock property data for AuraEstate
export const properties = [
  {
    id: 1,
    title: "Modern Loft in Downtown",
    type: "rent",
    price: 2800,
    priceType: "month",
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    address: "123 Urban Ave, Downtown District",
    city: "San Francisco",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop"
    ],
    features: ["Home Office", "Gym Access", "Rooftop Terrace", "Smart Home"],
    auraScore: {
      overall: 92,
      lifestyle: 95,
      connectivity: 90,
      environment: 88
    },
    description: "Stunning modern loft featuring floor-to-ceiling windows with panoramic city views. Open-concept living with premium finishes throughout.",
    available: "Immediate",
    petFriendly: true,
    parking: "1 Space Included"
  },
  {
    id: 2,
    title: "Luxury Penthouse Suite",
    type: "sale",
    price: 2450000,
    priceType: "total",
    bedrooms: 4,
    bathrooms: 3.5,
    sqft: 3200,
    address: "888 Skyline Tower, Financial District",
    city: "San Francisco",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&auto=format&fit=crop"
    ],
    features: ["Private Elevator", "Wine Cellar", "Chef's Kitchen", "Smart Home", "Concierge"],
    auraScore: {
      overall: 98,
      lifestyle: 99,
      connectivity: 96,
      environment: 97
    },
    description: "Exclusive penthouse offering unparalleled luxury living with 360-degree views. Features include private elevator access, temperature-controlled wine cellar, and Boffi kitchen.",
    available: "Q2 2026",
    petFriendly: true,
    parking: "3 Spaces"
  },
  {
    id: 3,
    title: "Cozy Studio Near Transit",
    type: "rent",
    price: 1650,
    priceType: "month",
    bedrooms: 0,
    bathrooms: 1,
    sqft: 550,
    address: "45 Metro Lane, Mission District",
    city: "San Francisco",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800&auto=format&fit=crop"
    ],
    features: ["In-Unit Laundry", "Bike Storage", "Fast Transit", "Utilities Included"],
    auraScore: {
      overall: 78,
      lifestyle: 82,
      connectivity: 95,
      environment: 72
    },
    description: "Efficient studio apartment perfect for young professionals. Steps away from BART station with excellent walkability score.",
    available: "Feb 1, 2026",
    petFriendly: false,
    parking: "Street"
  },
  {
    id: 4,
    title: "Victorian Townhouse",
    type: "sale",
    price: 1875000,
    priceType: "total",
    bedrooms: 3,
    bathrooms: 2.5,
    sqft: 2400,
    address: "567 Heritage Row, Pacific Heights",
    city: "San Francisco",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&auto=format&fit=crop"
    ],
    features: ["Original Details", "Garden", "Home Office", "Updated Kitchen", "Fireplace"],
    auraScore: {
      overall: 89,
      lifestyle: 91,
      connectivity: 78,
      environment: 94
    },
    description: "Beautifully restored Victorian townhouse blending period charm with modern amenities. Features original crown moldings, bay windows, and a sun-drenched private garden.",
    available: "Immediate",
    petFriendly: true,
    parking: "1 Car Garage"
  },
  {
    id: 5,
    title: "Waterfront Condo",
    type: "rent",
    price: 4200,
    priceType: "month",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1800,
    address: "1 Marina Blvd, Embarcadero",
    city: "San Francisco",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&auto=format&fit=crop"
    ],
    features: ["Bay Views", "Pool", "Doorman", "Gym", "Spa"],
    auraScore: {
      overall: 94,
      lifestyle: 96,
      connectivity: 88,
      environment: 95
    },
    description: "Spectacular waterfront living with unobstructed bay views. Resort-style amenities include infinity pool, full-service spa, and 24/7 concierge.",
    available: "Mar 15, 2026",
    petFriendly: true,
    parking: "2 Spaces"
  },
  {
    id: 6,
    title: "Modern Family Home",
    type: "sale",
    price: 1250000,
    priceType: "total",
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2800,
    address: "234 Sunset Drive, Outer Sunset",
    city: "San Francisco",
    image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&auto=format&fit=crop"
    ],
    features: ["Backyard", "Home Office", "Solar Panels", "EV Charger", "Smart Home"],
    auraScore: {
      overall: 86,
      lifestyle: 84,
      connectivity: 75,
      environment: 92
    },
    description: "Sustainable family home with modern amenities. Solar-powered with EV charging, spacious backyard, and dedicated home office space.",
    available: "Q1 2026",
    petFriendly: true,
    parking: "2 Car Garage"
  },
  {
    id: 7,
    title: "Artist Loft Conversion",
    type: "rent",
    price: 3100,
    priceType: "month",
    bedrooms: 1,
    bathrooms: 1,
    sqft: 1400,
    address: "78 Gallery Way, SoMa",
    city: "San Francisco",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&auto=format&fit=crop"
    ],
    features: ["High Ceilings", "North Light", "Exposed Brick", "Freight Elevator"],
    auraScore: {
      overall: 85,
      lifestyle: 90,
      connectivity: 87,
      environment: 80
    },
    description: "Converted warehouse loft with soaring 16ft ceilings and original industrial details. Perfect for creatives seeking an inspiring live/work space.",
    available: "Feb 15, 2026",
    petFriendly: true,
    parking: "Street"
  },
  {
    id: 8,
    title: "Hillside Estate",
    type: "sale",
    price: 4950000,
    priceType: "total",
    bedrooms: 5,
    bathrooms: 4.5,
    sqft: 5200,
    address: "1 Summit Circle, Twin Peaks",
    city: "San Francisco",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop"
    ],
    features: ["Panoramic Views", "Pool", "Home Theater", "Wine Room", "Guest Suite", "Smart Home"],
    auraScore: {
      overall: 97,
      lifestyle: 98,
      connectivity: 82,
      environment: 99
    },
    description: "Architectural masterpiece perched on Twin Peaks with 270-degree views of the city and bay. Features include infinity pool, professional home theater, and separate guest quarters.",
    available: "Negotiable",
    petFriendly: true,
    parking: "4 Car Garage"
  }
];

// Search suggestions for SmartMatch
export const searchSuggestions = [
  "Modern 3-bedroom with a home office under $3M",
  "Pet-friendly apartment near downtown with gym",
  "Luxury penthouse with panoramic views",
  "Family home with backyard and good schools",
  "Studio apartment with fast transit links",
  "Waterfront property with pool access"
];

// Feature tags for filtering
export const featureTags = [
  "Home Office",
  "Gym Access",
  "Pool",
  "Pet Friendly",
  "Smart Home",
  "Parking",
  "Doorman",
  "Rooftop",
  "Garden",
  "Waterfront",
  "Transit Nearby",
  "Laundry"
];
