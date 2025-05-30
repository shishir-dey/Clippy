# Clippy <img src="assets/icon.png" alt="Clippy Icon" width="32" height="32">

[![pages-build-deployment](https://github.com/shishir-dey/Clippy/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/shishir-dey/Clippy/actions/workflows/pages/pages-build-deployment)

A minimal notepad for mobile and web, as a tribute to Microsoft's assistant Clippy.

## Features

- **Auto-saving**: Notes are automatically saved to browser's local storage
- **Rich Text Editor**: Format text with bold, italic, underline, headings, and lists
- **Responsive Design**: Works on both desktop and mobile browsers

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Deployment to GitHub Pages

The app is configured to deploy to GitHub Pages at [https://shishir-dey.github.io/Clippy](https://shishir-dey.github.io/Clippy).

To deploy:

1. Make sure the configuration is correct:

   - In `package.json`: `"homepage": "https://shishir-dey.github.io/Clippy"`
   - In `vite.config.js`: `base: '/Clippy/'`

2. Run the deploy command:

   ```bash
   npm run deploy
   ```

3. After deployment, your app will be available at [https://shishir-dey.github.io/Clippy](https://shishir-dey.github.io/Clippy)

## Technologies Used

- React
- TipTap rich text editor
- GitHub Pages for deployment
- Vite for building and bundling
