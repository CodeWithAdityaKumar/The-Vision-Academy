/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,jsx}',
      './components/**/*.{js,jsx}',
      './app/**/*.{js,jsx}',
    ],
    darkMode: 'class',
    theme: {
      extend: {
        animation: {
          'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        },
      },
    },
    plugins: [
    //   require('@tailwindcss/line-clamp'),
    ],
  }