import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ifaqa-plum': '#3E3239',         // Deep Charcoal Plum
        'ifaqa-blackberry': '#6B5560',   // Muted Blackberry
        'ifaqa-mauve': '#9E8189',        // Dusty Mauve
        'ifaqa-sand': '#C7A9A3',         // Desert Sand / Blush
        'ifaqa-cashmere': '#E8D2C4',     // Pale Cashmere
        'ifaqa-linen': '#F7EFE7',        // Linen Pearl
      },
      backgroundImage: {
        'gradient-mauve-reserve': 'linear-gradient(135deg, #B2949D 0%, #6B5F6F 100%)',
        'gradient-steel-night': 'linear-gradient(145deg, #88A2BF 0%, #141318 100%)',
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
