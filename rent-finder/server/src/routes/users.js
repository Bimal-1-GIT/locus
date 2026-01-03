import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/users/profile - Get current user's full profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        tenantProfile: true,
        landlordProfile: true,
        savedProperties: {
          include: {
            property: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
          take: 10,
          orderBy: { savedAt: 'desc' },
        },
        _count: {
          select: {
            savedProperties: true,
            applications: true,
            properties: true,
            sentMessages: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { passwordHash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// PUT /api/users/profile - Update profile
router.put('/profile', authenticate, [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('phone').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, phone, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(avatar !== undefined && { avatar }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
      },
    });

    res.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// PUT /api/users/tenant-profile - Update tenant profile
router.put('/tenant-profile', authenticate, async (req, res) => {
  try {
    const { occupation, employer, annualIncome, creditScore, hasPets, petDetails, moveInDate, preferredLeaseTerm } = req.body;

    const profile = await prisma.tenantProfile.upsert({
      where: { userId: req.user.id },
      update: {
        occupation,
        employer,
        annualIncome,
        creditScore,
        hasPets,
        petDetails,
        moveInDate: moveInDate ? new Date(moveInDate) : null,
        preferredLeaseTerm,
      },
      create: {
        userId: req.user.id,
        occupation,
        employer,
        annualIncome,
        creditScore,
        hasPets,
        petDetails,
        moveInDate: moveInDate ? new Date(moveInDate) : null,
        preferredLeaseTerm,
      },
    });

    res.json({ profile });
  } catch (error) {
    console.error('Update tenant profile error:', error);
    res.status(500).json({ error: 'Failed to update tenant profile' });
  }
});

// PUT /api/users/landlord-profile - Update landlord profile
router.put('/landlord-profile', authenticate, async (req, res) => {
  try {
    const { companyName, businessLicense, yearsExperience, bio } = req.body;

    const profile = await prisma.landlordProfile.upsert({
      where: { userId: req.user.id },
      update: {
        companyName,
        businessLicense,
        yearsExperience,
        bio,
      },
      create: {
        userId: req.user.id,
        companyName,
        businessLicense,
        yearsExperience,
        bio,
      },
    });

    res.json({ profile });
  } catch (error) {
    console.error('Update landlord profile error:', error);
    res.status(500).json({ error: 'Failed to update landlord profile' });
  }
});

// GET /api/users/saved - Get saved properties
router.get('/saved', authenticate, async (req, res) => {
  try {
    const saved = await prisma.savedProperty.findMany({
      where: { userId: req.user.id },
      include: {
        property: {
          include: {
            images: true,
            features: true,
            owner: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { savedAt: 'desc' },
    });

    res.json({ saved });
  } catch (error) {
    console.error('Get saved properties error:', error);
    res.status(500).json({ error: 'Failed to get saved properties' });
  }
});

// POST /api/users/saved/:propertyId - Save a property
router.post('/saved/:propertyId', authenticate, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { notes } = req.body;

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check if already saved
    const existing = await prisma.savedProperty.findUnique({
      where: {
        userId_propertyId: {
          userId: req.user.id,
          propertyId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Property already saved' });
    }

    const saved = await prisma.savedProperty.create({
      data: {
        userId: req.user.id,
        propertyId,
        notes,
      },
      include: {
        property: {
          include: { images: { where: { isPrimary: true }, take: 1 } },
        },
      },
    });

    // Update property save count
    await prisma.property.update({
      where: { id: propertyId },
      data: { saveCount: { increment: 1 } },
    });

    res.status(201).json({ saved });
  } catch (error) {
    console.error('Save property error:', error);
    res.status(500).json({ error: 'Failed to save property' });
  }
});

// DELETE /api/users/saved/:propertyId - Unsave a property
router.delete('/saved/:propertyId', authenticate, async (req, res) => {
  try {
    const { propertyId } = req.params;

    await prisma.savedProperty.delete({
      where: {
        userId_propertyId: {
          userId: req.user.id,
          propertyId,
        },
      },
    });

    // Update property save count
    await prisma.property.update({
      where: { id: propertyId },
      data: { saveCount: { decrement: 1 } },
    });

    res.json({ message: 'Property unsaved' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Saved property not found' });
    }
    console.error('Unsave property error:', error);
    res.status(500).json({ error: 'Failed to unsave property' });
  }
});

// GET /api/users/notifications - Get user notifications
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// PUT /api/users/notifications/:id/read - Mark notification as read
router.put('/notifications/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { 
        id: req.params.id,
        userId: req.user.id,
      },
      data: { isRead: true },
    });

    res.json({ notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

export default router;
