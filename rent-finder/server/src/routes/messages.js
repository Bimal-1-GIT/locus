import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/messages/conversations - Get all conversations
router.get('/conversations', authenticate, async (req, res) => {
  try {
    // Get all unique conversations
    const sentMessages = await prisma.message.findMany({
      where: { senderId: req.user.id },
      select: { receiverId: true, propertyId: true },
      distinct: ['receiverId', 'propertyId'],
    });

    const receivedMessages = await prisma.message.findMany({
      where: { receiverId: req.user.id },
      select: { senderId: true, propertyId: true },
      distinct: ['senderId', 'propertyId'],
    });

    // Combine and deduplicate conversations
    const conversationSet = new Set();
    const conversationKeys = [];

    [...sentMessages, ...receivedMessages].forEach(msg => {
      const otherUserId = msg.senderId || msg.receiverId;
      const key = `${otherUserId}-${msg.propertyId || 'null'}`;
      if (!conversationSet.has(key)) {
        conversationSet.add(key);
        conversationKeys.push({ otherUserId, propertyId: msg.propertyId });
      }
    });

    // Get conversation details
    const conversations = await Promise.all(
      conversationKeys.map(async ({ otherUserId, propertyId }) => {
        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
            landlordProfile: {
              select: { isVerified: true },
            },
          },
        });

        const property = propertyId ? await prisma.property.findUnique({
          where: { id: propertyId },
          select: { id: true, title: true },
        }) : null;

        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: req.user.id, receiverId: otherUserId, propertyId },
              { senderId: otherUserId, receiverId: req.user.id, propertyId },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });

        const unreadCount = await prisma.message.count({
          where: {
            senderId: otherUserId,
            receiverId: req.user.id,
            propertyId,
            isRead: false,
          },
        });

        return {
          otherUser,
          property,
          lastMessage,
          unreadCount,
        };
      })
    );

    // Sort by last message date
    conversations.sort((a, b) => {
      const dateA = a.lastMessage?.createdAt || new Date(0);
      const dateB = b.lastMessage?.createdAt || new Date(0);
      return new Date(dateB) - new Date(dateA);
    });

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// GET /api/messages/:userId - Get messages with a specific user
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { propertyId, page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      OR: [
        { senderId: req.user.id, receiverId: userId },
        { senderId: userId, receiverId: req.user.id },
      ],
    };

    if (propertyId) {
      where.propertyId = propertyId;
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          property: {
            select: { id: true, title: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.message.count({ where }),
    ]);

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: userId,
        receiverId: req.user.id,
        isRead: false,
        ...(propertyId && { propertyId }),
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// POST /api/messages - Send a message
router.post('/', authenticate, [
  body('receiverId').notEmpty(),
  body('content').trim().notEmpty(),
  body('propertyId').optional(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { receiverId, content, propertyId } = req.body;

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Can't message yourself
    if (receiverId === req.user.id) {
      return res.status(400).json({ error: 'Cannot message yourself' });
    }

    // If propertyId provided, verify it exists
    if (propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }
    }

    const message = await prisma.message.create({
      data: {
        senderId: req.user.id,
        receiverId,
        propertyId,
        content,
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        property: {
          select: { id: true, title: true },
        },
      },
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'MESSAGE',
        title: 'New Message',
        message: `${req.user.firstName} ${req.user.lastName} sent you a message`,
        link: `/messages`,
      },
    });

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// GET /api/messages/unread/count - Get unread message count
router.get('/unread/count', authenticate, async (req, res) => {
  try {
    const count = await prisma.message.count({
      where: {
        receiverId: req.user.id,
        isRead: false,
      },
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// PUT /api/messages/:id/read - Mark single message as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const message = await prisma.message.findUnique({
      where: { id: req.params.id },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.message.update({
      where: { id: req.params.id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json({ message: updated });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

export default router;
