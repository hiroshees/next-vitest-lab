import { CommentSection } from '@/components/CommentSection/CommentSection';
import { Pagination } from '@/components/Pagination/Pagination';
import { Suspense } from 'react';

export default function Home() {
  return (
    <main>
      <Suspense>
        <CommentSection />
        <Pagination totalPages={5} />
      </Suspense>
    </main>
  );
}
