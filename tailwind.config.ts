import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#A9BDD1', // Dusty Blue
        secondary: '#7A8864', // Olive
        accent: '#E5D5BC', // Champagne
        brand: {
          dusty: '#A9BDD1',
          olive: '#7A8864',
          stone: '#C8C0B5',
          champagne: '#E5D5BC',
          bisque: '#E5BCA9',
          ivory: '#FAF7F2',
        },
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
        neutral: '#6B7280',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
