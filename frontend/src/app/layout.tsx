import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/shared/Providers';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Chatbot } from '@/components/shared/Chatbot';

export const metadata: Metadata = {
  title: 'DVYUG | Divine Essentials for Vedic Yield & Universal Goodness',
  description: 'DVYUG promotes healthy, sustainable, and spiritually aligned living through authentic organic, Ayurvedic, herbal, and Vedic products inspired by ancient Indian wisdom.',
  keywords: 'ayurveda, organic ghee, ashwagandha, herbal tea, spiritual essentials, puja thali, natural skincare, Vedic living, sustainable lifestyle',
  authors: [{ name: 'DVYUG Team' }],
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: 'DVYUG | Divine Essentials for Vedic Well-Being',
    description: 'Explore authentic organic, Ayurvedic, and Vedic products crafted with ancient wisdom for contemporary health.',
    url: 'http://localhost:3000',
    siteName: 'DVYUG',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1611070973770-b1a672610041?q=80&w=1200',
        width: 1200,
        height: 630,
        alt: 'DVYUG Vedic Wellness Products',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DVYUG | Divine Vedic Essentials',
    description: 'Authentic Ayurvedic and organic products inspired by ancient Vedic scriptures.',
    images: ['https://images.unsplash.com/photo-1611070973770-b1a672610041?q=80&w=1200'],
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col justify-between">
        <Providers>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <Chatbot />
        </Providers>
      </body>
    </html>
  );
}
