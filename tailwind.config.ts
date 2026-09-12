import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // โทนสีหลักของสถาบัน: ชมพู
        brand: {
          50: '#fff1f5',
          100: '#ffe4ec',
          200: '#fecdd9',
          300: '#fda4bd',
          400: '#fb7199',
          500: '#f43f74',
          600: '#e11d56',
          700: '#be1247',
          800: '#9f1241',
          900: '#88133d',
        },
        ink: {
          DEFAULT: '#1c1420',
          soft: '#5b5560',
          line: '#efe7ec',
        },
      },
      fontFamily: {
        sans: ['var(--font-noto-thai)', 'Sarabun', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(28,20,32,0.04), 0 8px 24px rgba(28,20,32,0.06)',
        lift: '0 2px 4px rgba(28,20,32,0.05), 0 16px 40px rgba(225,29,86,0.10)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
