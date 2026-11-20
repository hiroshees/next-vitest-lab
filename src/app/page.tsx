import { CommentSection } from '@/components/CommentSection/CommentSection';
import { Pagination } from '@/components/Pagination/Pagination';

export default function Home() {
  return (
    <main>
      <CommentSection />
      <Pagination totalPages={5} />
    </main>
  );
}
