import { Router, Request, Response } from 'express';
import { prisma } from '../server';

export const reviewsRouter = Router();

// POST /api/reviews
reviewsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { trailId, userId, rating, content } = req.body;

    const review = await prisma.review.create({
      data: { trailId, userId, rating, content },
      include: { user: { select: { id: true, username: true, avatar: true } } },
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// GET /api/reviews?trailId=xxx
reviewsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { trailId } = req.query;
    const reviews = await prisma.review.findMany({
      where: trailId ? { trailId: String(trailId) } : {},
      include: { user: { select: { id: true, username: true, avatar: true } }, trail: { select: { id: true, titleZh: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(reviews);
  } catch {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});
