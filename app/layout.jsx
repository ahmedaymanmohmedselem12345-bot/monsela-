import '@fontsource/tajawal/arabic-400.css';
import '@fontsource/tajawal/arabic-700.css';
import '@fontsource/tajawal/latin-400.css';
import '@fontsource/aref-ruqaa/arabic-700.css';
import '@fontsource/cinzel/latin-600.css';
import './globals.css';

export const metadata = {
  title: 'MonSela | عطور فاخرة تليق بذوقك',
  description: 'اكتشف عطور وزيوت عطرية وبخور وإكسسوارات مختارة بعناية من MonSela.',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.svg' },
};

export const viewport = { themeColor: '#101D2B', viewportFit: 'cover' };

export default function Layout({ children }) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
