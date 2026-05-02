import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// ============================================================
// GET /api/social/friends
// List all accepted friends for the logged-in user
// ============================================================
router.get('/friends', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    
    // friendships matches (user_id_a, user_id_b). user_id_a < user_id_b
    // We select where status = 'accepted' and (user_id_a = userId OR user_id_b = userId)
    const { data: friendships, error } = await supabaseAdmin
      .from('friendships')
      .select(`
        id, created_at, accepted_at,
        user_id_a, user_id_b,
        visibility_a, visibility_b,
        profile_a:user_id_a (id, username, display_name, avatar_url),
        profile_b:user_id_b (id, username, display_name, avatar_url)
      `)
      .eq('status', 'accepted')
      .or(`user_id_a.eq.${userId},user_id_b.eq.${userId}`);

    if (error) throw error;

    // Format the response so the "friend" object is top-level
    const friends = friendships.map(f => {
      const isUserA = f.user_id_a === userId;
      const friendProfile = isUserA ? f.profile_b : f.profile_a;
      
      // We see THEIR visibility settings toward US.
      // E.g., if we are user A, we read visibility_b. 
      const theirVisibility = isUserA ? f.visibility_b : f.visibility_a;
      
      // Our settings toward THEM
      const myVisibility = isUserA ? f.visibility_a : f.visibility_b;

      return {
        friendship_id: f.id,
        friend: friendProfile,
        my_permissions_for_them: myVisibility,
        their_permissions_for_me: theirVisibility,
        accepted_at: f.accepted_at
      };
    });

    res.json({ data: friends, error: null });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/social/requests
// List all pending friend requests (inbound & outbound)
// ============================================================
router.get('/requests', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const { data: requests, error } = await supabaseAdmin
      .from('friendships')
      .select(`
        id, initiated_by, status, created_at,
        profile_a:user_id_a (id, username, display_name, avatar_url),
        profile_b:user_id_b (id, username, display_name, avatar_url)
      `)
      .eq('status', 'pending')
      .or(`user_id_a.eq.${userId},user_id_b.eq.${userId}`);

    if (error) throw error;

    const formattedRequests = requests.map(r => {
      const isUserA = r.profile_a.id === userId;
      const otherProfile = isUserA ? r.profile_b : r.profile_a;
      const direction = r.initiated_by === userId ? 'outbound' : 'inbound';

      return {
        friendship_id: r.id,
        direction,
        profile: otherProfile,
        created_at: r.created_at
      };
    });

    res.json({ data: formattedRequests, error: null });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/social/request
// Send a friend request by target username
// ============================================================
const requestSchema = z.object({
  username: z.string().min(1)
});

router.post('/request', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const parsed = requestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { message: 'Invalid payload' } });
      return;
    }

    const { username } = parsed.data;

    // Lookup target user
    const { data: targetProfile, error: targetError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .ilike('username', username)
      .single();

    if (targetError || !targetProfile) {
      res.status(404).json({ error: { message: 'User not found' } });
      return;
    }

    if (targetProfile.id === userId) {
      res.status(400).json({ error: { message: 'Cannot add yourself' } });
      return;
    }

    // Determine user_a and user_b constraint (uuid sort)
    const [userA, userB] = userId < targetProfile.id 
      ? [userId, targetProfile.id] 
      : [targetProfile.id, userId];

    // Check if friendship already exists
    const { data: existing, error: existError } = await supabaseAdmin
      .from('friendships')
      .select('status, initiated_by')
      .eq('user_id_a', userA)
      .eq('user_id_b', userB)
      .maybeSingle();

    if (existError) throw existError;

    if (existing) {
      if (existing.status === 'accepted') {
        res.status(400).json({ error: { message: 'Already friends' } });
        return;
      }
      if (existing.status === 'pending') {
        if (existing.initiated_by === userId) {
          res.status(400).json({ error: { message: 'Request already sent' } });
          return;
        } else {
          // They sent us a request, let's accept it instead!
          const { data: accepted, error: acceptError } = await supabaseAdmin
            .from('friendships')
            .update({ status: 'accepted', accepted_at: new Date().toISOString() })
            .eq('user_id_a', userA)
            .eq('user_id_b', userB)
            .select()
            .single();

          if (acceptError) throw acceptError;
          res.json({ data: { message: 'Friend request accepted', friendship: accepted }, error: null });
          return;
        }
      }
      if (existing.status === 'blocked') {
        res.status(403).json({ error: { message: 'Action prohibited' } });
        return;
      }
    }

    // Insert new pending request
    const { data: newRequest, error: insertError } = await supabaseAdmin
      .from('friendships')
      .insert({
        user_id_a: userA,
        user_id_b: userB,
        status: 'pending',
        initiated_by: userId
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Optional: Dispatch a mobile Push Notification to the target here
    // import { sendPushNotification } from '../services/firebase' ...

    res.json({ data: newRequest, error: null });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/social/request/:id/accept
// Accept an incoming friend request
// ============================================================
router.post('/request/:id/accept', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const friendshipId = req.params.id;

    // Verify it's bound for us and is pending
    const { data: reqData, error: reqError } = await supabaseAdmin
      .from('friendships')
      .select('*')
      .eq('id', friendshipId)
      .single();

    if (reqError || !reqData) {
      res.status(404).json({ error: { message: 'Friend request not found' } });
      return;
    }

    if (reqData.status !== 'pending') {
      res.status(400).json({ error: { message: 'Request is not pending' } });
      return;
    }

    // We must be one of the users, and NOT the initiator
    if (reqData.initiated_by === userId) {
      res.status(400).json({ error: { message: 'Cannot accept own request' } });
      return;
    }
    if (reqData.user_id_a !== userId && reqData.user_id_b !== userId) {
      res.status(403).json({ error: { message: 'Forbidden' } });
      return;
    }

    const { data: accepted, error: updateError } = await supabaseAdmin
      .from('friendships')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', friendshipId)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({ data: accepted, error: null });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// DELETE /api/social/friends/:id
// Remove a friend, or cancel/decline a pending request
// ============================================================
router.delete('/friends/:id', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const friendshipId = req.params.id;

    const { data: reqData, error: reqError } = await supabaseAdmin
      .from('friendships')
      .select('*')
      .eq('id', friendshipId)
      .single();

    if (reqError || !reqData) {
      res.status(404).json({ error: { message: 'Friendship not found' } });
      return;
    }

    // Verify we are part of this friendship
    if (reqData.user_id_a !== userId && reqData.user_id_b !== userId) {
      res.status(403).json({ error: { message: 'Forbidden' } });
      return;
    }

    const { error: delError } = await supabaseAdmin
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (delError) throw delError;

    res.json({ data: { success: true }, error: null });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PATCH /api/social/friends/:id/privacy
// Update granular per-friend privacy settings
// ============================================================
const privacySchema = z.object({
  ratings: z.boolean().optional(),
  watchlist: z.boolean().optional(),
  recent_watches: z.boolean().optional(),
  collections: z.boolean().optional()
});

router.patch('/friends/:id/privacy', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const friendshipId = req.params.id;
    
    const parsed = privacySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { message: 'Invalid payload' } });
      return;
    }

    const { data: reqData, error: reqError } = await supabaseAdmin
      .from('friendships')
      .select('*')
      .eq('id', friendshipId)
      .single();

    if (reqError || !reqData) {
      res.status(404).json({ error: { message: 'Friendship not found' } });
      return;
    }

    const isUserA = reqData.user_id_a === userId;
    const isUserB = reqData.user_id_b === userId;

    if (!isUserA && !isUserB) {
      res.status(403).json({ error: { message: 'Forbidden' } });
      return;
    }

    // Merge old visibility with patched payload
    const columnToUpdate = isUserA ? 'visibility_a' : 'visibility_b';
    const oldVisibility = isUserA ? reqData.visibility_a : reqData.visibility_b;
    const newVisibility = { ...oldVisibility, ...parsed.data };

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('friendships')
      .update({ [columnToUpdate]: newVisibility })
      .eq('id', friendshipId)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({ data: updated, error: null });
  } catch (err) {
    next(err);
  }
});

export default router;
