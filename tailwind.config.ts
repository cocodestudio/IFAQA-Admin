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
        'ifaqa-plum': '#0B2D22',        // Deep Imperial Forest Emerald
        'ifaqa-blackberry': '#165A45',  // Vibrant Botanical Spruce
        'ifaqa-mauve': '#C5A059',       // Royal Antique Burnished Gold
        'ifaqa-sand': '#DFBA73',        // Champagne Gold Hairline
        'ifaqa-cashmere': '#F5F0E6',    // Warm Silk Parchment
        'ifaqa-linen': '#FAF8F5',       // Luminous Alabaster Pearl
        ifaqa: {
          plum: '#0B2D22',
          blackberry: '#165A45',
          mauve: '#C5A059',
          sand: '#DFBA73',
          cashmere: '#F5F0E6',
          linen: '#FAF8F5',
        },
      },
      backgroundImage: {
        'gradient-mauve-reserve': 'linear-gradient(135deg, #165A45 0%, #0B2D22 100%)',
        'gradient-steel-night': 'linear-gradient(145deg, #0E3B2D 0%, #061811 100%)',
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
