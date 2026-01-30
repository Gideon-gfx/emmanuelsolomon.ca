require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { log } = require('console');

console.log('ENV CHECK'), process.env.PORT;

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Static Middleware: Tells Express to look in /public for CSS, Images, and JS
app.use(express.static(path.join(__dirname, 'public')));

// 2. Explicit Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/biography', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'biography.html'));
});


app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/gallery', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'gallery.html'));
});

// Use path.resolve to handle the spaces in "Emmanuel's website" better
const publicPath = path.resolve(__dirname, 'public');

app.get('/scores', (req, res) => {
    const file = path.join(publicPath, 'scores.html');
    res.sendFile(file, (err) => {
        if (err) {
            console.error("Error: Could not find scores.html in the public folder.");
            res.status(404).send("The scores page is missing from the public folder!");
        }
    });
});

app.get('/recordings', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'recordings.html'));
})

app.get('/testimonial', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'testimonial.html'));
});

app.get('/testimonials', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'testimonial.html'));
});

app.get('/research', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'research.html'));
});

app.get('/collaborate', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'collaborate.html'));
});


app.get('/recordings', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'recordings.html'));
});

app.get('/mailing', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'mailing.html'));
});

app.get('/terms', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'terms.html'));
});

app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'privacy.html'));
});

// 3. Helper function to check if a file exists before sending
function sendIfExists(res, relativePath) {
    const fullPath = path.join(__dirname, 'public', relativePath);
    if (fs.existsSync(fullPath)) {
        res.sendFile(fullPath); 
        return true;
    }
    return false;
}

// 4. Fallback/Catch-all: This handles typed URLs like /home or /about without .html
app.get('*', (req, res) => {
    const tryPath = req.path.replace(/^\/+/, '');
    
    // Try serving the exact path
    if (tryPath && sendIfExists(res, tryPath)) return;
    
    // Try adding .html automatically
    if (!tryPath.endsWith('.html') && sendIfExists(res, tryPath + '.html')) return;
    
    // If nothing else works, go to home instead of an error page
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Try stopping other servers or set PORT environment variable.`);
        process.exit(1);
    }
    throw err;
});
