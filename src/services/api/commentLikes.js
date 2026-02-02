import apiClient from './client';

export const toggleCommentLike = async (commentId, userId) => {
  try {
    const response = await apiClient.post(`/comment-likes/toggle`, {
      commentId,
      userId,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to toggle comment like:', error);
    throw error;
  }
};

export default function CommentLikesApiPage() {
  return null;
}
