module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Adjust the paths according to your project structure
  ],
  theme: {
    extend: {
      colors: {
        eggshell: '#F0EAD6', // Add your custom eggshell color here
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['lemonade'], // Add the themes you want to use
  },
};