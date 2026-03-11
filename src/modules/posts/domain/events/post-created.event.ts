export const PostCreatedEvent = 'post.created';

export type PostCreatedEventPayload = {
  postId: string;
  authorId: string;
};
