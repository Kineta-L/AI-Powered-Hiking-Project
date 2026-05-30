import { Router, Request, Response } from 'express';
import { Webhook } from 'svix';
import { prisma } from '../server';

export const authRouter = Router();

// POST /api/auth/webhook — Clerk user sync
authRouter.post('/webhook', async (req: Request, res: Response) => {
  try {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return res.status(500).json({ error: 'Clerk webhook secret not configured' });
    }

    const svixId = req.header('svix-id');
    const svixTimestamp = req.header('svix-timestamp');
    const svixSignature = req.header('svix-signature');
    const rawBody = (req as Request & { rawBody?: string }).rawBody;

    if (!svixId || !svixTimestamp || !svixSignature || !rawBody) {
      return res.status(400).json({ error: 'Missing webhook signature headers' });
    }

    let event: any;
    try {
      event = new Webhook(webhookSecret).verify(rawBody, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });
    } catch {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const { type, data } = event;

    if (type === 'user.created' || type === 'user.updated') {
      const { id: clerkId, username, image_url: avatar } = data;

      await prisma.user.upsert({
        where: { clerkId },
        update: { username, avatar },
        create: { clerkId, username, avatar },
      });
    }

    if (type === 'user.deleted') {
      const { id: clerkId } = data;
      await prisma.user.deleteMany({ where: { clerkId } });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// GET /api/auth/me?clerkId=xxx — get or create user
authRouter.get('/me', async (req: Request, res: Response) => {
  try {
    const { clerkId } = req.query;
    if (!clerkId) return res.status(400).json({ error: 'clerkId required' });

    let user = await prisma.user.findUnique({ where: { clerkId: String(clerkId) } });
    if (!user) {
      user = await prisma.user.create({ data: { clerkId: String(clerkId) } });
    }
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// POST /api/auth/favorites — toggle favorite
authRouter.post('/favorites', async (req: Request, res: Response) => {
  try {
    const { userId, trailId } = req.body;

    const existing = await prisma.favorite.findUnique({
      where: { userId_trailId: { userId, trailId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      res.json({ favorited: false });
    } else {
      await prisma.favorite.create({ data: { userId, trailId } });
      res.json({ favorited: true });
    }
  } catch {
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

// GET /api/auth/favorites?userId=xxx
authRouter.get('/favorites', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const favorites = await prisma.favorite.findMany({
      where: { userId: String(userId) },
      include: { trail: { include: { _count: { select: { reviews: true, favorites: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(favorites);
  } catch {
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});
