import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx}'],

  // Files to exclude
  exclude: [],

  // JSX framework
  jsxFramework: 'react',

  // The output directory for your css system
  outdir: 'styled-system',

  // Theme customization - add tokens that don't exist in Panda defaults
  theme: {
    tokens: {
      fonts: {
        sans: { value: '"Inter Variable", ui-sans-serif, system-ui, sans-serif' },
        serif: { value: '"Playfair Display Variable", Georgia, serif' },
      },
    },
  },
});
