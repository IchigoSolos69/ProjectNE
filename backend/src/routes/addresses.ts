import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';

const router = Router();

// Apply auth middleware to all address routes
router.use(requireAuth);

// GET /api/addresses - Fetch user addresses
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
    return res.status(200).json(addresses);
  } catch (error) {
    console.error('Fetch addresses error:', error);
    return res.status(500).json({ error: 'Failed to retrieve addresses.' });
  }
});

// POST /api/addresses - Create a shipping address
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { label, fullName, phone, line1, line2, city, state, pincode, isDefault = false } = req.body;

    if (!fullName || !phone || !line1 || !city || !state || !pincode) {
      return res.status(400).json({ error: 'Missing required address fields.' });
    }

    // Run atomically: if default, unset current defaults, then insert
    const address = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      // Check if this is the first address, if so default it
      const count = await tx.address.count({ where: { userId } });
      const makeDefault = count === 0 ? true : isDefault;

      return tx.address.create({
        data: {
          userId,
          label,
          fullName,
          phone,
          line1,
          line2,
          city,
          state,
          pincode,
          isDefault: makeDefault,
        },
      });
    });

    return res.status(201).json(address);
  } catch (error) {
    console.error('Create address error:', error);
    return res.status(500).json({ error: 'Failed to save address.' });
  }
});

// PATCH /api/addresses/:id - Update shipping address
router.patch('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { label, fullName, phone, line1, line2, city, state, pincode, isDefault } = req.body;

    const existing = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Address record not found.' });
    }

    const address = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id },
        data: {
          label,
          fullName,
          phone,
          line1,
          line2,
          city,
          state,
          pincode,
          isDefault: isDefault !== undefined ? isDefault : existing.isDefault,
        },
      });
    });

    return res.status(200).json(address);
  } catch (error) {
    console.error('Update address error:', error);
    return res.status(500).json({ error: 'Failed to update address.' });
  }
});

// DELETE /api/addresses/:id - Delete shipping address
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Address record not found.' });
    }

    await prisma.address.delete({
      where: { id },
    });

    // If we deleted the default, set another address as default if exists
    if (existing.isDefault) {
      const another = await prisma.address.findFirst({
        where: { userId },
      });
      if (another) {
        await prisma.address.update({
          where: { id: another.id },
          data: { isDefault: true },
        });
      }
    }

    return res.status(200).json({ success: true, message: 'Address deleted successfully.' });
  } catch (error) {
    console.error('Delete address error:', error);
    return res.status(500).json({ error: 'Failed to delete address.' });
  }
});

export default router;
