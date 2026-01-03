import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.searchHistory.deleteMany();
  await prisma.savedSearch.deleteMany();
  await prisma.review.deleteMany();
  await prisma.viewingSchedule.deleteMany();
  await prisma.application.deleteMany();
  await prisma.savedProperty.deleteMany();
  await prisma.propertyFeature.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.tenantProfile.deleteMany();
  await prisma.landlordProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('📦 Creating users...');

  // Create demo users
  const passwordHash = await bcrypt.hash('password123', 12);

  const demoRenter = await prisma.user.create({
    data: {
      email: 'renter@demo.com',
      passwordHash,
      firstName: 'Alex',
      lastName: 'Johnson',
      phone: '+1-555-0101',
      role: 'RENTER',
      isVerified: true,
      tenantProfile: {
        create: {
          occupation: 'Software Engineer',
          employer: 'Tech Corp',
          annualIncome: 120000,
          creditScore: 750,
          hasPets: true,
          petDetails: 'One small dog (Corgi)',
          isVerified: true,
        },
      },
    },
  });

  const demoLandlord = await prisma.user.create({
    data: {
      email: 'landlord@demo.com',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Chen',
      phone: '+1-555-0102',
      role: 'LANDLORD',
      isVerified: true,
      landlordProfile: {
        create: {
          companyName: 'Chen Properties LLC',
          totalProperties: 5,
          yearsExperience: 8,
          bio: 'Professional property manager with a focus on tenant satisfaction.',
          responseRate: 98.5,
          avgResponseTime: 30,
          isVerified: true,
          isSuperhost: true,
        },
      },
    },
  });

  const demoBuyer = await prisma.user.create({
    data: {
      email: 'buyer@demo.com',
      passwordHash,
      firstName: 'Michael',
      lastName: 'Smith',
      phone: '+1-555-0103',
      role: 'BUYER',
      isVerified: true,
    },
  });

  console.log('🏠 Creating properties...');

  // Property data
  const propertiesData = [
    {
      title: 'Modern Loft in Downtown',
      description: 'Stunning modern loft featuring floor-to-ceiling windows with panoramic city views. Open-concept living with premium finishes throughout. Perfect for professionals seeking urban living at its finest.',
      type: 'LOFT',
      listingType: 'RENT',
      price: 2800,
      priceType: 'MONTHLY',
      deposit: 5600,
      address: '123 Urban Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200,
      yearBuilt: 2020,
      parking: '1 Space Included',
      petFriendly: true,
      petDeposit: 500,
      auraScoreOverall: 92,
      auraScoreLifestyle: 95,
      auraScoreConnectivity: 90,
      auraScoreEnvironment: 88,
      availableFrom: new Date('2026-01-15'),
      leaseTerm: 12,
      features: ['Home Office', 'Gym Access', 'Rooftop Terrace', 'Smart Home', 'In-Unit Laundry', 'Central AC'],
      images: [
        { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop', isPrimary: false },
        { url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop', isPrimary: false },
      ],
    },
    {
      title: 'Luxury Penthouse Suite',
      description: 'Exclusive penthouse offering unparalleled luxury living with 360-degree views. Features include private elevator access, temperature-controlled wine cellar, and Boffi kitchen.',
      type: 'PENTHOUSE',
      listingType: 'SALE',
      price: 2450000,
      priceType: 'TOTAL',
      address: '888 Skyline Tower',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94104',
      bedrooms: 4,
      bathrooms: 3.5,
      sqft: 3200,
      yearBuilt: 2022,
      parking: '3 Spaces',
      petFriendly: true,
      auraScoreOverall: 98,
      auraScoreLifestyle: 99,
      auraScoreConnectivity: 96,
      auraScoreEnvironment: 97,
      features: ['Private Elevator', 'Wine Cellar', "Chef's Kitchen", 'Smart Home', 'Concierge', '24/7 Security'],
      images: [
        { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop', isPrimary: false },
      ],
    },
    {
      title: 'Cozy Studio Near Transit',
      description: 'Efficient studio apartment perfect for young professionals. Steps away from BART station with excellent walkability score.',
      type: 'STUDIO',
      listingType: 'RENT',
      price: 1650,
      priceType: 'MONTHLY',
      deposit: 1650,
      address: '45 Metro Lane',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94110',
      bedrooms: 0,
      bathrooms: 1,
      sqft: 550,
      yearBuilt: 2015,
      parking: 'Street',
      petFriendly: false,
      auraScoreOverall: 78,
      auraScoreLifestyle: 82,
      auraScoreConnectivity: 95,
      auraScoreEnvironment: 72,
      availableFrom: new Date('2026-02-01'),
      leaseTerm: 12,
      features: ['In-Unit Laundry', 'Bike Storage', 'Fast Transit', 'Utilities Included'],
      images: [
        { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop', isPrimary: true },
      ],
    },
    {
      title: 'Victorian Townhouse',
      description: 'Beautifully restored Victorian townhouse blending period charm with modern amenities. Features original crown moldings, bay windows, and a sun-drenched private garden.',
      type: 'TOWNHOUSE',
      listingType: 'SALE',
      price: 1875000,
      priceType: 'TOTAL',
      address: '567 Heritage Row',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94115',
      bedrooms: 3,
      bathrooms: 2.5,
      sqft: 2400,
      yearBuilt: 1905,
      parking: '1 Car Garage',
      petFriendly: true,
      auraScoreOverall: 89,
      auraScoreLifestyle: 91,
      auraScoreConnectivity: 78,
      auraScoreEnvironment: 94,
      features: ['Original Details', 'Garden', 'Home Office', 'Updated Kitchen', 'Fireplace', 'Wine Storage'],
      images: [
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&auto=format&fit=crop', isPrimary: false },
      ],
    },
    {
      title: 'Waterfront Condo',
      description: 'Spectacular waterfront living with unobstructed bay views. Resort-style amenities include infinity pool, full-service spa, and 24/7 concierge.',
      type: 'CONDO',
      listingType: 'RENT',
      price: 4200,
      priceType: 'MONTHLY',
      deposit: 8400,
      address: '1 Marina Blvd',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94123',
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1800,
      yearBuilt: 2019,
      parking: '2 Spaces',
      petFriendly: true,
      petDeposit: 750,
      auraScoreOverall: 94,
      auraScoreLifestyle: 96,
      auraScoreConnectivity: 88,
      auraScoreEnvironment: 95,
      availableFrom: new Date('2026-03-15'),
      leaseTerm: 12,
      features: ['Bay Views', 'Pool', 'Doorman', 'Gym', 'Spa', 'Concierge'],
      images: [
        { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop', isPrimary: true },
      ],
    },
    {
      title: 'Modern Family Home',
      description: 'Sustainable family home with modern amenities. Solar-powered with EV charging, spacious backyard, and dedicated home office space.',
      type: 'HOUSE',
      listingType: 'SALE',
      price: 1250000,
      priceType: 'TOTAL',
      address: '234 Sunset Drive',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94122',
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2800,
      yearBuilt: 2021,
      lotSize: 0.15,
      parking: '2 Car Garage',
      petFriendly: true,
      auraScoreOverall: 86,
      auraScoreLifestyle: 84,
      auraScoreConnectivity: 75,
      auraScoreEnvironment: 92,
      features: ['Backyard', 'Home Office', 'Solar Panels', 'EV Charger', 'Smart Home'],
      images: [
        { url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&auto=format&fit=crop', isPrimary: true },
      ],
    },
    {
      title: 'Artist Loft Conversion',
      description: 'Converted warehouse loft with soaring 16ft ceilings and original industrial details. Perfect for creatives seeking an inspiring live/work space.',
      type: 'LOFT',
      listingType: 'RENT',
      price: 3100,
      priceType: 'MONTHLY',
      deposit: 6200,
      address: '78 Gallery Way',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
      bedrooms: 1,
      bathrooms: 1,
      sqft: 1400,
      yearBuilt: 1920,
      parking: 'Street',
      petFriendly: true,
      auraScoreOverall: 85,
      auraScoreLifestyle: 90,
      auraScoreConnectivity: 87,
      auraScoreEnvironment: 80,
      availableFrom: new Date('2026-02-15'),
      leaseTerm: 12,
      features: ['High Ceilings', 'North Light', 'Exposed Brick', 'Freight Elevator'],
      images: [
        { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop', isPrimary: true },
      ],
    },
    {
      title: 'Hillside Estate',
      description: 'Architectural masterpiece perched on Twin Peaks with 270-degree views of the city and bay. Features include infinity pool, professional home theater, and separate guest quarters.',
      type: 'VILLA',
      listingType: 'SALE',
      price: 4950000,
      priceType: 'TOTAL',
      address: '1 Summit Circle',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94131',
      bedrooms: 5,
      bathrooms: 4.5,
      sqft: 5200,
      yearBuilt: 2018,
      lotSize: 0.4,
      parking: '4 Car Garage',
      petFriendly: true,
      auraScoreOverall: 97,
      auraScoreLifestyle: 98,
      auraScoreConnectivity: 82,
      auraScoreEnvironment: 99,
      features: ['Panoramic Views', 'Pool', 'Home Theater', 'Wine Room', 'Guest Suite', 'Smart Home'],
      images: [
        { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop', isPrimary: true },
      ],
    },
  ];

  // Create properties with images and features
  for (const propData of propertiesData) {
    const { features, images, ...propertyData } = propData;
    
    await prisma.property.create({
      data: {
        ...propertyData,
        ownerId: demoLandlord.id,
        images: {
          create: images.map((img, index) => ({
            url: img.url,
            isPrimary: img.isPrimary,
            order: index,
          })),
        },
        features: {
          create: features.map(name => ({
            name,
            category: 'AMENITY',
          })),
        },
      },
    });
  }

  console.log('💾 Creating sample interactions...');

  // Get first property for interactions
  const firstProperty = await prisma.property.findFirst();

  if (firstProperty) {
    // Save a property
    await prisma.savedProperty.create({
      data: {
        userId: demoRenter.id,
        propertyId: firstProperty.id,
        notes: 'Love the location!',
      },
    });

    // Create an application
    await prisma.application.create({
      data: {
        userId: demoRenter.id,
        propertyId: firstProperty.id,
        status: 'PENDING',
        message: 'Hi, I am very interested in this property. I have a stable income and great references.',
        moveInDate: new Date('2026-02-01'),
        leaseTerm: 12,
      },
    });

    // Create a message thread
    await prisma.message.create({
      data: {
        senderId: demoRenter.id,
        receiverId: demoLandlord.id,
        propertyId: firstProperty.id,
        content: 'Hi! I saw your listing for the Modern Loft and I am very interested. Is it still available?',
      },
    });

    await prisma.message.create({
      data: {
        senderId: demoLandlord.id,
        receiverId: demoRenter.id,
        propertyId: firstProperty.id,
        content: 'Hello! Yes, the property is still available. Would you like to schedule a viewing?',
      },
    });

    // Schedule a viewing
    await prisma.viewingSchedule.create({
      data: {
        userId: demoRenter.id,
        propertyId: firstProperty.id,
        scheduledAt: new Date('2026-01-10T14:00:00'),
        type: 'IN_PERSON',
        status: 'CONFIRMED',
      },
    });

    // Create a notification
    await prisma.notification.create({
      data: {
        userId: demoRenter.id,
        type: 'APPLICATION_UPDATE',
        title: 'Application Received',
        message: 'Your application for Modern Loft in Downtown has been received.',
        link: `/property/${firstProperty.id}`,
      },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Demo Accounts:');
  console.log('  Renter:   renter@demo.com / password123');
  console.log('  Landlord: landlord@demo.com / password123');
  console.log('  Buyer:    buyer@demo.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
