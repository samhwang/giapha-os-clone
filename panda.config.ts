import { defineConfig, defineRecipe } from '@pandacss/dev';

const buttonRecipe = defineRecipe({
  className: 'button',
  description: 'Button component variants',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 20px',
    borderRadius: '9999px',
    fontWeight: '500',
    fontSize: '14px',
    gap: '6px',
    transition: 'all 0.3s',
    cursor: 'pointer',
    border: '1px solid transparent',
  },
  variants: {
    visual: {
      primary: {
        background: 'linear-gradient(to right, #d97706, #b45309)',
        color: 'white',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        _hover: {
          background: 'linear-gradient(to right, #b45309, #92400e)',
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        },
      },
      secondary: {
        background: 'linear-gradient(to right, #57534e, #44403c)',
        color: 'white',
        _hover: {
          background: 'linear-gradient(to right, #44403c, #292524)',
          transform: 'translateY(-2px)',
        },
      },
      outline: {
        background: 'white',
        borderColor: 'stone.200',
        color: 'stone.600',
        _hover: {
          background: 'stone.50',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        },
      },
      ghost: {
        background: 'transparent',
        color: 'stone.600',
        _hover: {
          background: 'stone.100',
        },
      },
    },
  },
  defaultVariants: {
    visual: 'primary',
  },
});

const inputRecipe = defineRecipe({
  className: 'input',
  description: 'Form input component',
  base: {
    display: 'block',
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid stone.200',
    backgroundColor: 'white',
    color: 'stone.900',
    transition: 'all 0.2s',
    _focus: {
      outline: 'none',
      borderColor: 'amber.500',
      boxShadow: '0 0 0 3px rgb(217 119 6 / 0.1)',
    },
    _placeholder: {
      color: 'stone.400',
    },
  },
  variants: {
    state: {
      error: {
        borderColor: 'red.500',
        _focus: {
          borderColor: 'red.500',
          boxShadow: '0 0 0 3px rgb(239 68 68 / 0.1)',
        },
      },
    },
  },
});

const cardRecipe = defineRecipe({
  className: 'card',
  description: 'Card component',
  base: {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid stone.100',
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    overflow: 'hidden',
  },
});

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
    extend: {
      recipes: {
        button: buttonRecipe,
        input: inputRecipe,
        card: cardRecipe,
      },
    },
  },
});
