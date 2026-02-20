import { supabase } from '@/lib/supabase';
import apiClient from './client';

/**
 * Fetch notifications for a user (legacy - direct Supabase)
 */
export const getNotifications = async (userId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('Notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    return [];
  }
};

/**
 * Fetch notifications with actor data pre-joined (new optimized endpoint)
 */
export const getNotificationsWithActors = async () => {
  try {
    const response = await apiClient.get('/notifications');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching notifications with actors:', error);
    return [];
  }
};

/**
 * Mark all notifications as read via backend API
 */
export const markAllNotificationsAsReadApi = async () => {
  try {
    await apiClient.put('/notifications/mark-read');
    return true;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return false;
  }
};

/**
 * Delete all notifications for a user (called when viewing notifications)
 */
export const deleteAllNotifications = async (userId) => {
  try {
    const { error } = await supabase
      .from('Notifications')
      .delete()
      .eq('recipient_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const { error } = await supabase
      .from('Notifications')
      .update({ is_read: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Create a notification for a like action
 */
export const createLikeNotification = async (recipientId, actorId, postId) => {
  // Don't notify yourself
  if (recipientId === actorId) return null;

  try {
    const { data, error } = await supabase
      .from('Notifications')
      .insert({
        recipient_id: recipientId,
        actor_id: actorId,
        type: 'like',
        post_id: postId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    return null;
  }
};

/**
 * Create a notification for a comment action
 */
export const createCommentNotification = async (recipientId, actorId, postId, commentId) => {
  // Don't notify yourself
  if (recipientId === actorId) return null;

  try {
    const { data, error } = await supabase
      .from('Notifications')
      .insert({
        recipient_id: recipientId,
        actor_id: actorId,
        type: 'comment',
        post_id: postId,
        comment_id: commentId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    return null;
  }
};

/**
 * Create a notification for a follow action
 */
export const createFollowNotification = async (recipientId, actorId) => {
  // Don't notify yourself
  if (recipientId === actorId) return null;

  try {
    const { data, error } = await supabase
      .from('Notifications')
      .insert({
        recipient_id: recipientId,
        actor_id: actorId,
        type: 'follow',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    return null;
  }
};

/**
 * Create a notification for a tag action
 */
export const createTagNotification = async (recipientId, actorId, postId) => {
  // Don't notify yourself
  if (recipientId === actorId) return null;

  try {
    const { data, error } = await supabase
      .from('Notifications')
      .insert({
        recipient_id: recipientId,
        actor_id: actorId,
        type: 'tag',
        post_id: postId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    return null;
  }
};

/**
 * Delete a like notification (when unliking)
 */
export const deleteLikeNotification = async (actorId, postId) => {
  try {
    const { error } = await supabase
      .from('Notifications')
      .delete()
      .eq('actor_id', actorId)
      .eq('post_id', postId)
      .eq('type', 'like');

    if (error) throw error;
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Delete a comment notification (when deleting a comment)
 */
export const deleteCommentNotification = async (actorId, postId, commentId) => {
  try {
    const { error } = await supabase
      .from('Notifications')
      .delete()
      .eq('actor_id', actorId)
      .eq('post_id', postId)
      .eq('comment_id', commentId)
      .eq('type', 'comment');

    if (error) throw error;
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Create a notification for a comment like action
 */
export const createCommentLikeNotification = async (recipientId, actorId, postId, commentId) => {
  if (recipientId === actorId) return null;

  try {
    const { data, error } = await supabase
      .from('Notifications')
      .insert({
        recipient_id: recipientId,
        actor_id: actorId,
        type: 'comment_like',
        post_id: postId,
        comment_id: commentId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    return null;
  }
};

/**
 * Delete a comment like notification (when unliking a comment)
 */
export const deleteCommentLikeNotification = async (actorId, commentId) => {
  try {
    const { error } = await supabase
      .from('Notifications')
      .delete()
      .eq('actor_id', actorId)
      .eq('comment_id', commentId)
      .eq('type', 'comment_like');

    if (error) throw error;
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Delete a follow notification (when unfollowing)
 */
export const deleteFollowNotification = async (actorId, recipientId) => {
  try {
    const { error } = await supabase
      .from('Notifications')
      .delete()
      .eq('actor_id', actorId)
      .eq('recipient_id', recipientId)
      .eq('type', 'follow');

    if (error) throw error;
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Create a notification for a reply action
 */
export const createReplyNotification = async (recipientId, actorId, postId, commentId, parentCommentId) => {
  // Don't notify yourself
  if (recipientId === actorId) return null;

  try {
    const { data, error } = await supabase
      .from('Notifications')
      .insert({
        recipient_id: recipientId,
        actor_id: actorId,
        type: 'reply',
        post_id: postId,
        comment_id: commentId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    return null;
  }
};

/**
 * Delete a reply notification (when deleting a reply)
 */
export const deleteReplyNotification = async (actorId, commentId) => {
  try {
    const { error } = await supabase
      .from('Notifications')
      .delete()
      .eq('actor_id', actorId)
      .eq('comment_id', commentId)
      .eq('type', 'reply');

    if (error) throw error;
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Create a notification for a follow request
 */
export const createFollowRequestNotification = async (recipientId, actorId) => {
  // Don't notify yourself
  if (recipientId === actorId) return null;

  try {
    const { data, error } = await supabase
      .from('Notifications')
      .insert({
        recipient_id: recipientId,
        actor_id: actorId,
        type: 'follow_request',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    return null;
  }
};

/**
 * Delete a follow request notification (when cancelling request)
 */
export const deleteFollowRequestNotification = async (actorId, recipientId) => {
  try {
    const { error } = await supabase
      .from('Notifications')
      .delete()
      .eq('actor_id', actorId)
      .eq('recipient_id', recipientId)
      .eq('type', 'follow_request');

    if (error) throw error;
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Create a notification for a nudge action
 * Note: This is primarily handled by the backend, but provided for consistency
 */
export const createNudgeNotification = async (recipientId, actorId, message) => {
  // Don't notify yourself
  if (recipientId === actorId) return null;

  try {
    const { data, error } = await supabase
      .from('Notifications')
      .insert({
        recipient_id: recipientId,
        actor_id: actorId,
        type: 'nudge',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    return null;
  }
};

/**
 * Delete a notification by ID
 */
export const deleteNotificationById = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('Notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
};

export default function NotificationsApiPage() {
  return null;
}
