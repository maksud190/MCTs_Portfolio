export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // darktMode: 'class', // ✅ This is IMPORTANT
  theme: {
    extend: {
      fontFamily: {
        // ✅ Add Poppins as default sans font
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
