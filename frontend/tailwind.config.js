/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface": "#fbf9f9", "outline-variant": "#e4beba", "on-tertiary": "#ffffff", "surface-container": "#efeded", "inverse-on-surface": "#f2f0f0", "on-secondary-fixed-variant": "#004786", "surface-variant": "#e3e2e2", "secondary-container": "#54a0fe", "on-primary-container": "#fff2f0", "background": "#fbf9f9", "on-tertiary-fixed-variant": "#005312", "surface-dim": "#dbdad9", "primary-container": "#d32f2f", "on-secondary-fixed": "#001c3a", "surface-container-high": "#e9e8e7", "secondary": "#005faf", "error": "#ba1a1a", "surface-tint": "#ba1a20", "error-container": "#ffdad6", "tertiary": "#11651d", "primary-fixed": "#ffdad6", "on-secondary-container": "#003567", "on-error-container": "#93000a", "on-primary": "#ffffff", "secondary-fixed-dim": "#a5c8ff", "secondary-fixed": "#d4e3ff", "primary-fixed-dim": "#ffb3ac", "on-secondary": "#ffffff", "inverse-primary": "#ffb3ac", "on-tertiary-container": "#d8ffd0", "surface-bright": "#fbf9f9", "on-error": "#ffffff", "on-primary-fixed": "#410003", "tertiary-container": "#307f34", "on-surface-variant": "#5b403d", "outline": "#8f6f6c", "on-background": "#1b1c1c", "on-tertiary-fixed": "#002204", "on-primary-fixed-variant": "#930010", "primary": "#af101a", "surface-container-lowest": "#ffffff", "surface-container-highest": "#e3e2e2", "tertiary-fixed-dim": "#88d982", "tertiary-fixed": "#a3f69c", "on-surface": "#1b1c1c", "inverse-surface": "#303031", "surface-container-low": "#f5f3f3"
      },
      borderRadius: { "DEFAULT": "1rem", "lg": "2rem", "xl": "3rem", "full": "9999px" },
      spacing: { "space-md": "1rem", "space-lg": "1.5rem", "gutter": "1rem", "space-xl": "2rem", "margin": "1rem", "space-xs": "0.25rem", "space-sm": "0.5rem" },
      fontFamily: {
        "headline-md": ["Inter"], "label-md": ["Inter"], "body-sm": ["Inter"], "body-md": ["Inter"], "label-sm": ["Inter"], "data-display": ["Inter"], "title-md": ["Inter"], "headline-lg": ["Inter"], "label-lg": ["Inter"], "title-lg": ["Inter"], "body-lg": ["Inter"], "headline-sm": ["Inter"]
      },
      fontSize: {
        "headline-md": ["24px", {"lineHeight": "30px", "letterSpacing": "-0.015em", "fontWeight": "600"}], "label-md": ["12px", {"lineHeight": "16px", "letterSpacing": "0.02em", "fontWeight": "600"}], "body-sm": ["12px", {"lineHeight": "16px", "fontWeight": "400"}], "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}], "label-sm": ["11px", {"lineHeight": "14px", "letterSpacing": "0.03em", "fontWeight": "500"}], "data-display": ["36px", {"lineHeight": "40px", "letterSpacing": "-0.03em", "fontWeight": "700"}], "title-md": ["16px", {"lineHeight": "22px", "fontWeight": "600"}], "headline-lg": ["30px", {"lineHeight": "36px", "letterSpacing": "-0.02em", "fontWeight": "700"}], "label-lg": ["14px", {"lineHeight": "18px", "letterSpacing": "0.01em", "fontWeight": "600"}], "title-lg": ["18px", {"lineHeight": "24px", "fontWeight": "600"}], "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}], "headline-sm": ["20px", {"lineHeight": "26px", "letterSpacing": "-0.01em", "fontWeight": "600"}]
      }
    }
  },
  plugins: [],
}