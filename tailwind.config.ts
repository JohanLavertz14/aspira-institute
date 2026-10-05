import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // สีหลักของสถาบัน: ชมพูโทนอุ่น ลดความแดงลงจากเดิม
        brand: {
          50: '#fff5f6',
          100: '#ffe9ed',
          200: '#ffd2db',
          300: '#ffacbf',
          400: '#ff7d9d',
          500: '#fa557f',
          600: '#ec3566',
          700: '#c92553',
          800: '#a62046',
          900: '#8a1e3f',
        },
        // สีรอง: ส้มอมพีช ใช้คู่กับชมพูเพื่อให้ภาพรวมอบอุ่นขึ้น
        accent: {
          50: '#fff7ed',
          100: '#ffedd4',
          200: '#fed7aa',
          300: '#fdb874',
          400: '#fb9243',
          500: '#f97316',
          600: '#e85d04',
          700: '#c2470a',
          800: '#9a390f',
          900: '#7c3010',
        },
        ink: {
          DEFAULT: '#1b1418',
          soft: '#6b6168',
          line: '#f0e8ea',
        },
      },
      fontFamily: {
        sans: ['var(--font-noto-thai)', 'Sarabun', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(27,20,24,0.04), 0 8px 24px rgba(27,20,24,0.05)',
        lift: '0 2px 6px rgba(27,20,24,0.05), 0 18px 44px rgba(236,53,102,0.12)',
        glow: '0 8px 28px -8px rgba(236,53,102,0.45)',
        'glow-accent': '0 8px 28px -8px rgba(249,115,22,0.45)',
      },
      borderRadius: {
        xl2: '1.25rem',
        '4xl': '2rem',
      },
      backgroundImage: {
        // ไล่สีชมพูไปส้ม ใช้กับปุ่มหลัก หัวข้อเด่น และพื้นหลังบางส่วน
        'brand-gradient': 'linear-gradient(100deg, #ec3566 0%, #fa557f 45%, #f97316 100%)',
        'brand-gradient-soft': 'linear-gradient(140deg, #fff5f6 0%, #fff7ed 55%, #ffffff 100%)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(0, -18px, 0) scale(1.04)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        float: 'float 9s ease-in-out infinite',
        marquee: 'marquee 32s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
