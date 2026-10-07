/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      colors: {
        border: "#D7DEE4", // Soft Blue Gray
        input: "#D7DEE4",
        ring: "#10263D",
        background: "#F7F5F0", // Warm Ivory
        foreground: "#18212B", // Deep Charcoal
        primary: {
          DEFAULT: "#10263D", // Deep Ink Navy
          hover: "#1a3b5c",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#176B73", // Medical Teal
          hover: "#1f8791",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#B08D57", // Refined Muted Brass / Champagne
          hover: "#9a7b4c",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#DC2626", // Professional Clinical Red
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#D97706", // Refined Amber
          foreground: "#ffffff",
        },
        success: {
          DEFAULT: "#0F766E", // Deep Clinical Green
          foreground: "#ffffff",
        },
        info: {
          DEFAULT: "#2563EB", // Muted Medical Blue
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#EEF1F2", // Soft Stone
          foreground: "#5C6875", // Slate
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#18212B",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#18212B",
        },
      },
      borderRadius: {
        none: '0',
        sm: '0.25rem', // 4px
        DEFAULT: '0.375rem', // 6px
        md: '0.375rem', // 6px
        lg: '0.5rem', // 8px
        xl: '0.75rem', // 12px
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(16, 38, 61, 0.05), 0 0 0 1px rgba(215, 222, 228, 0.5)',
        DEFAULT: '0 4px 6px -1px rgba(16, 38, 61, 0.08), 0 2px 4px -1px rgba(16, 38, 61, 0.04), 0 0 0 1px rgba(215, 222, 228, 0.5)',
        md: '0 10px 15px -3px rgba(16, 38, 61, 0.1), 0 4px 6px -2px rgba(16, 38, 61, 0.05), 0 0 0 1px rgba(215, 222, 228, 0.5)',
        lg: '0 20px 25px -5px rgba(16, 38, 61, 0.15), 0 10px 10px -5px rgba(16, 38, 61, 0.04), 0 0 0 1px rgba(215, 222, 228, 0.5)',
        xl: '0 25px 50px -12px rgba(16, 38, 61, 0.25), 0 0 0 1px rgba(215, 222, 228, 0.5)',
        inner: 'inset 0 2px 4px 0 rgba(16, 38, 61, 0.06)',
      },
      transitionTimingFunction: {
        'tactile': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      }
    },
  },
  plugins: [],
}

