'use client';

import { useState } from 'react';
import { CommentForm } from '@/components/CommentForm/CommentForm';

export function CommentSection() {
  const [comments, setComments] = useState<string[]>([]);

  return (
    <section aria-label="コメント">
      <CommentForm
        onSubmit={(comment) => setComments((prev) => [...prev, comment])}
      />
      <ul aria-label="コメント一覧">
        {comments.map((comment, i) => (
          <li key={i}>{comment}</li>
        ))}
      </ul>
    </section>
  );
}
