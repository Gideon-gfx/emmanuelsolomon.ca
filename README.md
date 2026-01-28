# Emmanuel's Website - Local Server

This project is a static site. To run a small local server with route handling (Express):

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

The server listens on port 3000 by default. Open http://localhost:3000 in your browser.

Routes provided:
- `/` or `/home` -> `home.html`
- `/about` -> `about.html` (if present)
- `/contact` -> `contact.html` (if present)
- `/scores` -> `score.html` or `index.html`

Static assets (CSS, images) are served from the project root.
