import { ContactForm } from '@/features/contact/ContactForm';
import { submitContact } from '@/features/contact/actions';

export const metadata = {
  title: 'お問い合わせ',
};

export default function ContactPage() {
  return (
    <main>
      <h1>お問い合わせ</h1>
      <ContactForm action={submitContact} />
    </main>
  );
}
