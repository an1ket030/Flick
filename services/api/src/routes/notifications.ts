import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { sendPushNotification } from '../services/firebase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/notifications/register
// Store token for the user
router.post('/register', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { token, platform } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!token) return res.status(400).json({ error: 'Token is required' });

    // Store in Supabase
    const { error } = await supabaseAdmin
      .from('push_tokens')
      .upsert({ 
        user_id: userId, 
        token: token,
        platform: platform || 'unknown',
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id, token' });

    if (error) throw error;

    res.json({ message: 'Push token registered successfully' });
  } catch (error: any) {
    console.error('Failed to register push token:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/notifications/test-time-capsule
// Send a mock Time Capsule notification to the current user
router.post('/test-time-capsule', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Look up user's tokens
    const { data: tokens, error } = await supabaseAdmin
      .from('push_tokens')
      .select('token')
      .eq('user_id', userId);

    if (error) throw error;
    if (!tokens || tokens.length === 0) {
      return res.status(400).json({ error: 'No push tokens found for user' });
    }

    // Dispatch to all of their recorded devices
    let successCount = 0;
    for (const record of tokens) {
      const ok = await sendPushNotification(
        record.token,
        '⏳ Your Time Capsule is ready',
        'We found a masterpiece from the year you came of age. Unseal it now.',
        { type: 'time_capsule', url: 'flick://home/time-capsule' }
      );
      if (ok) successCount++;
    }

    res.json({ message: `Sent test push to ${successCount}/${tokens.length} devices.` });
  } catch (error: any) {
    console.error('Failed to dispatch test notification:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
