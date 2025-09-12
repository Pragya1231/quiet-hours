// pages/_app.tsx
import '../pages/globals.css'; // <-- import your global CSS here
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
