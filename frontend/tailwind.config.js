/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background colors
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',

        // Text colors
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',

        // Border colors
        'border-primary': 'var(--border-primary)',
        'border-secondary': 'var(--border-secondary)',

        // Accent colors
        'accent': 'var(--accent-primary)',
        'accent-secondary': 'var(--accent-secondary)',
        'accent-light': 'var(--accent-light)',

        // Component colors
        'card-bg': 'var(--card-bg)',
        'card-border': 'var(--card-border)',
        'input-bg': 'var(--input-bg)',
        'input-border': 'var(--input-border)',
        'modal-bg': 'var(--modal-bg)',
        'hover-bg': 'var(--hover-bg)',
        'active-bg': 'var(--active-bg)',
      },
      backgroundColor: {
        'primary': 'var(--bg-primary)',
        'secondary': 'var(--bg-secondary)',
        'tertiary': 'var(--bg-tertiary)',
      },
      textColor: {
        'primary': 'var(--text-primary)',
        'secondary': 'var(--text-secondary)',
        'tertiary': 'var(--text-tertiary)',
      },
      borderColor: {
        'primary': 'var(--border-primary)',
        'secondary': 'var(--border-secondary)',
      },
      boxShadow: {
        'card': 'var(--card-shadow)',
      },
      shimmer: {
        "animation": {
          shimmer: "shimmer 2s linear infinite"
        },
        "keyframes": {
          shimmer: {
            from: {
              "backgroundPosition": "0 0"
            },
            to: {
              "backgroundPosition": "-200% 0"
            }
          }
        }
      }
    },
  },
  plugins: [],
}

// tailwind.config.js code
