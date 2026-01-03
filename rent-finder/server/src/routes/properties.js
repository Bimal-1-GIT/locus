import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, query, validationResult } from 'express-validator';
import { authenticate, optionalAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/properties - List properties with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      type,
      listingType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      city,
      features,
      petFriendly,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {
      status: 'ACTIVE',
    };

    if (type) where.type = type;
    if (listingType) where.listingType = listingType;
    if (city) where.city = { contains: city };
    if (petFriendly === 'true') where.petFriendly = true;

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (bedrooms) {
      if (bedrooms === '0') {
        where.bedrooms = 0;
      } else if (bedrooms === '4+') {
        where.bedrooms = { gte: 4 };
      } else {
        where.bedrooms = parseInt(bedrooms);
      }
    }

    if (bathrooms) {
      where.bathrooms = { gte: parseFloat(bathrooms) };
    }

    // Search in title, description, address
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } },
        { city: { contains: search } },
      ];
    }

    // Feature filter
    if (features) {
      const featureList = features.split(',');
      where.features = {
        some: {
          name: { in: featureList },
        },
      };
    }

    // Determine sort
    const orderBy = {};
    if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'auraScore') {
      orderBy.auraScoreOverall = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          images: { orderBy: { order: 'asc' } },
          features: true,
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              landlordProfile: {
                select: { isVerified: true, isSuperhost: true },
              },
            },
          },
          _count: {
            select: { savedBy: true },
          },
        },
        orderBy,
        skip,
        take,
      }),
      prisma.property.count({ where }),
    ]);

    // If user is authenticated, check which properties are saved
    let savedPropertyIds = [];
    if (req.user) {
      const saved = await prisma.savedProperty.findMany({
        where: {
          userId: req.user.id,
          propertyId: { in: properties.map(p => p.id) },
        },
        select: { propertyId: true },
      });
      savedPropertyIds = saved.map(s => s.propertyId);
    }

    const propertiesWithSaved = properties.map(p => ({
      ...p,
      isSaved: savedPropertyIds.includes(p.id),
    }));

    res.json({
      properties: propertiesWithSaved,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Failed to get properties' });
  }
});

// GET /api/properties/featured - Get featured properties
router.get('/featured', optionalAuth, async (req, res) => {
  try {
    const { listingType, limit = 8 } = req.query;

    const where = {
      status: 'ACTIVE',
      auraScoreOverall: { gte: 85 },
    };

    if (listingType) where.listingType = listingType;

    const properties = await prisma.property.findMany({
      where,
      include: {
        images: { orderBy: { order: 'asc' } },
        features: { take: 5 },
      },
      orderBy: { auraScoreOverall: 'desc' },
      take: parseInt(limit),
    });

    res.json({ properties });
  } catch (error) {
    console.error('Get featured error:', error);
    res.status(500).json({ error: 'Failed to get featured properties' });
  }
});

// GET /api/properties/:id - Get single property
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: {
        images: { orderBy: { order: 'asc' } },
        features: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            createdAt: true,
            landlordProfile: {
              select: {
                companyName: true,
                bio: true,
                totalProperties: true,
                responseRate: true,
                avgResponseTime: true,
                isVerified: true,
                isSuperhost: true,
              },
            },
          },
        },
        reviews: {
          include: {
            user: {
              select: { firstName: true, lastName: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { reviews: true, savedBy: true },
        },
      },
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Increment view count
    await prisma.property.update({
      where: { id: req.params.id },
      data: { viewCount: { increment: 1 } },
    });

    // Check if saved by current user
    let isSaved = false;
    if (req.user) {
      const saved = await prisma.savedProperty.findUnique({
        where: {
          userId_propertyId: {
            userId: req.user.id,
            propertyId: property.id,
          },
        },
      });
      isSaved = !!saved;
    }

    res.json({ property: { ...property, isSaved } });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Failed to get property' });
  }
});

// POST /api/properties - Create property (landlords only)
router.post('/', authenticate, requireRole('LANDLORD', 'SELLER', 'AGENT', 'ADMIN'), [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('type').isIn(['APARTMENT', 'HOUSE', 'CONDO', 'TOWNHOUSE', 'STUDIO', 'LOFT', 'PENTHOUSE', 'VILLA', 'DUPLEX', 'OTHER']),
  body('listingType').isIn(['RENT', 'SALE', 'BOTH']),
  body('price').isFloat({ min: 0 }),
  body('address').trim().notEmpty(),
  body('city').trim().notEmpty(),
  body('state').trim().notEmpty(),
  body('zipCode').trim().notEmpty(),
  body('bedrooms').isInt({ min: 0 }),
  body('bathrooms').isFloat({ min: 0 }),
  body('sqft').isInt({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      type,
      listingType,
      price,
      priceType,
      deposit,
      address,
      unit,
      city,
      state,
      zipCode,
      latitude,
      longitude,
      bedrooms,
      bathrooms,
      sqft,
      yearBuilt,
      lotSize,
      parking,
      availableFrom,
      leaseTerm,
      petFriendly,
      petDeposit,
      smokingAllowed,
      features,
      images,
    } = req.body;

    const property = await prisma.property.create({
      data: {
        ownerId: req.user.id,
        title,
        description,
        type,
        listingType,
        price,
        priceType: priceType || (listingType === 'RENT' ? 'MONTHLY' : 'TOTAL'),
        deposit,
        address,
        unit,
        city,
        state,
        zipCode,
        latitude,
        longitude,
        bedrooms,
        bathrooms,
        sqft,
        yearBuilt,
        lotSize,
        parking,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        leaseTerm,
        petFriendly: petFriendly || false,
        petDeposit,
        smokingAllowed: smokingAllowed || false,
        features: features ? {
          create: features.map(f => ({
            name: f.name || f,
            category: f.category || 'AMENITY',
          })),
        } : undefined,
        images: images ? {
          create: images.map((img, index) => ({
            url: img.url || img,
            caption: img.caption,
            isPrimary: index === 0,
            order: index,
          })),
        } : undefined,
      },
      include: {
        images: true,
        features: true,
      },
    });

    // Update landlord's total properties count
    await prisma.landlordProfile.update({
      where: { userId: req.user.id },
      data: { totalProperties: { increment: 1 } },
    });

    res.status(201).json({ property });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// PUT /api/properties/:id - Update property
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Check ownership
    const existing = await prisma.property.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (existing.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const {
      title,
      description,
      price,
      status,
      availableFrom,
      features,
      images,
      ...otherFields
    } = req.body;

    // Update property
    const property = await prisma.property.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(price && { price }),
        ...(status && { status }),
        ...(availableFrom && { availableFrom: new Date(availableFrom) }),
        ...otherFields,
      },
      include: {
        images: true,
        features: true,
      },
    });

    res.json({ property });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// DELETE /api/properties/:id - Delete property
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const existing = await prisma.property.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (existing.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.property.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Property deleted' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

// GET /api/properties/:id/similar - Get similar properties
router.get('/:id/similar', async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const similar = await prisma.property.findMany({
      where: {
        id: { not: property.id },
        status: 'ACTIVE',
        listingType: property.listingType,
        city: property.city,
        price: {
          gte: property.price * 0.7,
          lte: property.price * 1.3,
        },
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
      },
      take: 4,
    });

    res.json({ similar });
  } catch (error) {
    console.error('Get similar error:', error);
    res.status(500).json({ error: 'Failed to get similar properties' });
  }
});

export default router;
