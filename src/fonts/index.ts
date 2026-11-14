import localFont from 'next/font/local';

export const learningCurve = localFont({
  src: [
    {
      path: './learningcurve_ot-webfont.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-learning-curve',
  display: 'swap',
  fallback: ['cursive', 'sans-serif'],
});
