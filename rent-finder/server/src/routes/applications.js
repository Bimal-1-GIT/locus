import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/applications - Get user's applications
router.get('/', authenticate, async (req, res) => {
  try {
    const { status } = req.query;

    const where = { userId: req.user.id };
    if (status) where.status = status;

    const applications = await prisma.application.findMany({
      where,
      include: {
        property: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            owner: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    res.json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to get applications' });
  }
});

// GET /api/applications/received - Get applications for landlord's properties
router.get('/received', authenticate, async (req, res) => {
  try {
    const { status, propertyId } = req.query;

    const where = {
      property: { ownerId: req.user.id },
    };
    if (status) where.status = status;
    if (propertyId) where.propertyId = propertyId;

    const applications = await prisma.application.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            tenantProfile: true,
          },
        },
        property: {
          select: { id: true, title: true, address: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    res.json({ applications });
  } catch (error) {
    console.error('Get received applications error:', error);
    res.status(500).json({ error: 'Failed to get applications' });
  }
});

// POST /api/applications - Submit application
router.post('/', authenticate, [
  body('propertyId').notEmpty(),
  body('message').optional().trim(),
  body('moveInDate').optional().isISO8601(),
  body('leaseTerm').optional().isInt({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { propertyId, message, moveInDate, leaseTerm, offeredPrice, isPreApproved, financingType } = req.body;

    // Check if property exists and is available
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { owner: true },
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (property.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Property is not available' });
    }

    // Can't apply to own property
    if (property.ownerId === req.user.id) {
      return res.status(400).json({ error: 'Cannot apply to your own property' });
    }

    // Check for existing application
    const existing = await prisma.application.findUnique({
      where: {
        userId_propertyId: {
          userId: req.user.id,
          propertyId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'You already have an application for this property' });
    }

    const application = await prisma.application.create({
      data: {
        userId: req.user.id,
        propertyId,
        message,
        moveInDate: moveInDate ? new Date(moveInDate) : null,
        leaseTerm,
        offeredPrice,
        isPreApproved,
        financingType,
      },
      include: {
        property: {
          include: { images: { where: { isPrimary: true }, take: 1 } },
        },
      },
    });

    // Update property inquiry count
    await prisma.property.update({
      where: { id: propertyId },
      data: { inquiryCount: { increment: 1 } },
    });

    // Create notification for property owner
    await prisma.notification.create({
      data: {
        userId: property.ownerId,
        type: 'APPLICATION_UPDATE',
        title: 'New Application Received',
        message: `${req.user.firstName} ${req.user.lastName} applied for "${property.title}"`,
        link: `/applications?propertyId=${propertyId}`,
      },
    });

    res.status(201).json({ application });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// PUT /api/applications/:id/status - Update application status (landlord)
router.put('/:id/status', authenticate, [
  body('status').isIn(['REVIEWING', 'APPROVED', 'REJECTED']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;

    // Get application with property
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { property: true },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check if user owns the property
    if (application.property.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedApplication = await prisma.application.update({
      where: { id: req.params.id },
      data: {
        status,
        reviewedAt: status === 'REVIEWING' ? new Date() : application.reviewedAt,
        respondedAt: ['APPROVED', 'REJECTED'].includes(status) ? new Date() : application.respondedAt,
      },
    });

    // Notify applicant
    await prisma.notification.create({
      data: {
        userId: application.userId,
        type: 'APPLICATION_UPDATE',
        title: `Application ${status.toLowerCase()}`,
        message: `Your application for "${application.property.title}" has been ${status.toLowerCase()}.`,
        link: `/applications`,
      },
    });

    res.json({ application: updatedApplication });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// DELETE /api/applications/:id - Withdraw application
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!['PENDING', 'REVIEWING'].includes(application.status)) {
      return res.status(400).json({ error: 'Cannot withdraw this application' });
    }

    await prisma.application.update({
      where: { id: req.params.id },
      data: { status: 'WITHDRAWN' },
    });

    res.json({ message: 'Application withdrawn' });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({ error: 'Failed to withdraw application' });
  }
});

// POST /api/applications/:id/schedule-viewing
router.post('/:propertyId/schedule-viewing', authenticate, [
  body('scheduledAt').isISO8601(),
  body('type').optional().isIn(['IN_PERSON', 'VIDEO_CALL', 'SELF_GUIDED']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { propertyId } = req.params;
    const { scheduledAt, type, notes } = req.body;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const viewing = await prisma.viewingSchedule.create({
      data: {
        userId: req.user.id,
        propertyId,
        scheduledAt: new Date(scheduledAt),
        type: type || 'IN_PERSON',
        notes,
      },
    });

    // Notify property owner
    await prisma.notification.create({
      data: {
        userId: property.ownerId,
        type: 'VIEWING_REMINDER',
        title: 'Viewing Requested',
        message: `${req.user.firstName} wants to view "${property.title}"`,
        link: `/property/${propertyId}`,
      },
    });

    res.status(201).json({ viewing });
  } catch (error) {
    console.error('Schedule viewing error:', error);
    res.status(500).json({ error: 'Failed to schedule viewing' });
  }
});

export default router;
