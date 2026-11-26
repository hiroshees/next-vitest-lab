import type { Book } from '@/features/books/validateBook';

export const sampleBooks: Book[] = [
  {
    id: '3',
    title: 'はじめてのTypeScript',
    author: '山田太郎',
    genre: '技術書',
    publishedYear: 2023,
    memo: '',
  },
  {
    id: '2',
    title: 'チームで進める仕事術',
    author: '佐藤花子',
    genre: 'ビジネス',
    publishedYear: 2021,
    memo: '読書会で使用',
  },
  {
    id: '1',
    title: '配色の基本',
    author: '鈴木一郎',
    genre: 'デザイン',
    publishedYear: 2019,
    memo: '',
  },
];
