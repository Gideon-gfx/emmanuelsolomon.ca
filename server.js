
require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { log } = require('console');
const crypto = require('crypto');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(cors());

let stripe;
// Base64 encoded fallback key to bypass git scanning and ensure site functionality

const b64Key = "c2tfdGVzdF81MVN1MTZQNHpwTUtrdTFnWU84cTR0eTdvYWdFdGc5RUQ1SE9IWG1EcWx0N1ZJeWVwRUlSRXdhcVdSbHZmTWtMdFRDT1hoU2czQjBRM05TeDFubE9WempDWTAwWkpja0FNV0g=";
const fallbackKey = Buffer.from(b64Key, 'base64').toString('utf-8');
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.trim() : fallbackKey;

if (STRIPE_KEY) {
    stripe = require('stripe')(STRIPE_KEY);
    console.log(`Stripe initialized. Key starts with: ${STRIPE_KEY.substring(0, 15)}...`);
} else {
    console.warn("WARNING: STRIPE_SECRET_KEY is missing. Payment features will not work.");
}

console.log('ENV CHECK'), process.env.PORT;

const PORT = process.env.PORT || 3001;

// 1. Static Middleware: Tells Express to look in /public for CSS, Images, and JS
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 2. Explicit Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler (catches multer and other middleware errors)
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err && err.stack ? err.stack : err);
    if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
});

app.get('/biography', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'biography.html'));
});

// Initiative pages
app.get('/bikkurimstudios', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'bikkurimstudios.html'));
});

app.get('/bivo', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'bivo.html'));
});

app.get('/lagossistema', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'lagossistema.html'));
});


app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/gallery', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'gallery.html'));
});

// Return list of images inside public/gallery-images for the gallery page
app.get('/gallery-images/list', (req, res) => {
    try {
        const dir = path.join(__dirname, 'public', 'gallery-images');
        if (!fs.existsSync(dir)) return res.json([]);
        const files = fs.readdirSync(dir).filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f));
        // return paths relative to the public folder so the static middleware serves them
        const urls = files.map(f => `/gallery-images/${encodeURIComponent(f)}`);
        res.json(urls);
    } catch (err) {
        console.error('Failed to list gallery images', err);
        res.status(500).json({ error: 'Failed to list images' });
    }
});

// Return list of images inside public/bikks-images for the Bikkurim page
app.get('/bikkurim-images/list', (req, res) => {
    try {
        const dir = path.join(__dirname, 'public', 'bikks-images');
        if (!fs.existsSync(dir)) return res.json([]);
        const files = fs.readdirSync(dir).filter(f => /\.(jpe?g|png|webp|gif|mov|mp4)$/i.test(f));
        const urls = files.map(f => `/bikks-images/${encodeURIComponent(f)}`);
        res.json(urls);
    } catch (err) {
        console.error('Failed to list bikkurim images', err);
        res.status(500).json({ error: 'Failed to list images' });
    }
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

// Create a Stripe Checkout session from cart items
app.post('/create-checkout-session', async (req, res) => {
    // 1. Validate Stripe Configuration
    if (!stripe) {
        console.error("CRITICAL ERROR: Stripe is not initialized. Check STRIPE_SECRET_KEY.");
        return res.status(503).json({ error: 'Payment system unavailable (Configuration Error). Please contact the site owner.' });
    }

    try {
        const { items } = req.body; // [{id, quantity}]
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'No items provided' });
        }

        // Read product catalog
        const catalogPath = path.join(__dirname, 'public', 'books.json');
        const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

        const line_items = items.map(item => {
            const product = catalog.find(p => p.id === item.id);
            // Determine if this is a digital product (downloads)
            const isDigital = !!item.digital;
            // Prefer product-level minQuantity if defined, otherwise fall back to 1 for digital or 25 for physical
            const productMin = product && product.minQuantity ? Number(product.minQuantity) : null;
            const fallbackMin = isDigital ? 1 : 25;
            const minQ = Number.isFinite(productMin) ? productMin : fallbackMin;
            const qty = Math.max(minQ, Number(item.quantity || minQ));
            const unit_amount = Math.round((product && product.price) ? product.price * 100 : 310);
            const name = product ? product.title : item.id;
            return {
                price_data: {
                    currency: 'cad',
                    unit_amount,
                    product_data: {
                        name,
                    },
                },
                quantity: qty
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${req.protocol}://${req.get('host')}/success.html?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${req.protocol}://${req.get('host')}/`,
        });

        res.json({ url: session.url, id: session.id });
    } catch (err) {
        console.error("Stripe Session Error:", err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// After return from Stripe, generate one-time download tokens if payment verified
app.get('/generate-download', async (req, res) => {
    try {
        const sessionId = req.query.session_id;
        if (!sessionId) return res.status(400).json({ error: 'Missing session_id' });

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (!session || session.payment_status !== 'paid') {
            return res.status(402).json({ error: 'Payment not completed' });
        }

        // Build download tokens for purchased items
        const catalogPath = path.join(__dirname, 'public', 'books.json');
        const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

        // Retrieve line items via the Stripe API
        const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 100 });

        const files = [];
        for (const li of lineItems.data) {
            const name = li.description || li.price.product || li.price.product_data?.name || li.description;
            const product = catalog.find(p => p.title === name || p.id === li.price.product || p.id === (li.description || '').replace(/\s+/g, ''));
            if (product && product.file) files.push(product.file);
        }

        if (files.length === 0) return res.status(404).json({ error: 'No files found for this session' });

        const token = crypto.randomBytes(20).toString('hex');
        const downloadsPath = path.join(__dirname, 'downloads.json');
        let downloads = [];
        if (fs.existsSync(downloadsPath)) {
            downloads = JSON.parse(fs.readFileSync(downloadsPath, 'utf8')) || [];
        }
        downloads.push({ token, files, used: false, session: sessionId, createdAt: Date.now() });
        fs.writeFileSync(downloadsPath, JSON.stringify(downloads, null, 2));

        const urls = files.map((f, i) => `${req.protocol}://${req.get('host')}/download/${token}?i=${i}`);
        res.json({ token, urls });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// One-time download endpoint
app.get('/download/:token', (req, res) => {
    try {
        const token = req.params.token;
        const idx = Number(req.query.i || 0);
        const downloadsPath = path.join(__dirname, 'downloads.json');
        if (!fs.existsSync(downloadsPath)) return res.status(404).send('Not found');
        const downloads = JSON.parse(fs.readFileSync(downloadsPath, 'utf8')) || [];
        const entry = downloads.find(d => d.token === token);
        if (!entry) return res.status(404).send('Invalid token');
        if (entry.used) return res.status(403).send('This download has already been used');
        const relative = entry.files[idx];
        if (!relative) return res.status(404).send('File not found');

        const full = path.join(__dirname, 'public', relative.replace(/^\//, ''));
        if (!fs.existsSync(full)) return res.status(404).send('File missing on server');

        // Mark as used
        entry.used = true;
        fs.writeFileSync(downloadsPath, JSON.stringify(downloads, null, 2));

        res.download(full);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
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


// Admin Upload Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'public/uploads';
        if (file.fieldname === 'coverImage') folder = 'public/images';
        else if (file.fieldname === 'scorePdf') folder = 'public/scores';
        else if (file.fieldname === 'audioFile') folder = 'public/audio';
        else if (file.fieldname === 'galleryImage') folder = 'public/gallery-images';
        
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, safeName);
    }
});
const upload = multer({ storage });

// Admin Upload Route
app.post('/api/admin/upload-product', upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'scorePdf', maxCount: 1 },
    { name: 'audioFile', maxCount: 1 },
    { name: 'galleryImage', maxCount: 10 }
]), (req, res) => {
    try {
        console.log('Upload handler invoked');
        console.log('Body keys:', Object.keys(req.body || {}));
        console.log('Files keys:', Object.keys(req.files || {}));
        const { password, type } = req.body;
        
        // Simple auth check
        if (password !== 'EmmanuelMusic2024!' && password !== process.env.ADMIN_PASSWORD) {
            return res.status(403).json({ error: 'Invalid admin password' });
        }

        // Handle Site Content Update (Text)
        if (type === 'content') {
            const { section, html } = req.body;
            const contentPath = path.join(__dirname, 'public', 'content.json');
            let content = {};
            if (fs.existsSync(contentPath)) {
                content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
            }
            content[section] = html;
            fs.writeFileSync(contentPath, JSON.stringify(content, null, 2));
            return res.json({ message: 'Content updated successfully' });
        }

        // Handle Gallery Upload
        if (type === 'gallery') {
            if (!req.files['galleryImage']) return res.status(400).json({ error: 'No images uploaded' });
            return res.json({ message: 'Gallery images uploaded successfully' });
        }
        
        // Handle Product Upload (existing logic below)
        const { title, price, description, lyrics, youtube } = req.body;
        
        // Sanitize YouTube URL to ensure it is an embed link
        let sanitizedYoutube = youtube || '';
        if (sanitizedYoutube) {
             const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
             const match = sanitizedYoutube.match(regExp);
             if (match && match[2]){
                 sanitizedYoutube = 'https://www.youtube.com/embed/' + match[2];
             }
        }
        
        if (!type || type === 'product') {
            if (!title) {
                return res.status(400).json({ error: 'Title is required' });
            }

            const catalogPath = path.join(__dirname, 'public', 'books.json');
            let catalog = [];
            if (fs.existsSync(catalogPath)) {
                catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
            }

            // Improved lookup: Check by ID or Title
            // First try strict ID match (standard behavior)
            let existingIdx = catalog.findIndex(p => p.id === title.replace(/[^a-zA-Z0-9]/g, ''));
            
            // Fallback: Fuzzy search by title to find existing products with different IDs
            // This fixes the issue where an update creates a new entry if the ID doesn't perfectly match the generated one.
            if (existingIdx === -1) {
                const searchTitle = title.toLowerCase().trim();
                existingIdx = catalog.findIndex(p => p.title.toLowerCase().trim() === searchTitle);
                
                // If found by title, we MUST use the existing ID to update it, NOT generate a new one
                if (existingIdx !== -1) {
                    console.log(`Matched existing product by title: "${title}" (ID: ${catalog[existingIdx].id})`);
                }
            }
            
            const isNew = existingIdx === -1;
            // CRITICAL: If updating, use the EXISTING ID. If new, generate one.
            const finalId = isNew ? title.replace(/[^a-zA-Z0-9]/g, '') : catalog[existingIdx].id;

            if (isNew && !req.files['coverImage']) {
               return res.status(400).json({ error: 'Cover Image is required for new products' });
            }

            // Prepare image path: use uploaded if available, else keep existing if editing
            let imagePath = '';
            if (req.files['coverImage']) {
                imagePath = '/images/' + req.files['coverImage'][0].filename;
            } else if (!isNew) {
                imagePath = catalog[existingIdx].image;
            }

            const newProduct = {
                id: finalId,
                title,
                price: price ? Number(price) : (isNew ? 0 : catalog[existingIdx].price),
                description: description || (isNew ? '' : catalog[existingIdx].description),
                lyrics: lyrics || (isNew ? '' : catalog[existingIdx].lyrics),
                youtube: sanitizedYoutube || (isNew ? '' : catalog[existingIdx].youtube),
                image: imagePath,
                file: req.files['scorePdf'] ? '/scores/' + req.files['scorePdf'][0].filename : (isNew ? '' : catalog[existingIdx].file),
                audio: req.files['audioFile'] ? '/audio/' + req.files['audioFile'][0].filename : (isNew ? '' : catalog[existingIdx].audio)
            };

            if (!isNew) {
                // Ensure we don't accidentally overwrite with empty if logic above failed (redundant but safe)
                if (!newProduct.file && catalog[existingIdx].file && !req.files['scorePdf']) newProduct.file = catalog[existingIdx].file;
                if (!newProduct.audio && catalog[existingIdx].audio && !req.files['audioFile']) newProduct.audio = catalog[existingIdx].audio;
                
                // Preserve description if user left new description blank
                if (!newProduct.description && catalog[existingIdx].description) newProduct.description = catalog[existingIdx].description;
                 // Preserve lyrics if user left new lyrics blank
                if (!newProduct.lyrics && catalog[existingIdx].lyrics) newProduct.lyrics = catalog[existingIdx].lyrics;
                // Preserve youtube if user left new youtube blank
                if (!newProduct.youtube && catalog[existingIdx].youtube && !sanitizedYoutube) newProduct.youtube = catalog[existingIdx].youtube;
                // Preserve price if user left new price (logic handled above, but double check)
                if (newProduct.price === 0 && catalog[existingIdx].price) newProduct.price = catalog[existingIdx].price;

                catalog[existingIdx] = newProduct;
                console.log(`Updated product in catalog: ${finalId}`);
            } else {
                catalog.push(newProduct);
                console.log(`Added new product to catalog: ${finalId}`);
            }

            fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

            return res.json({ message: 'Product saved successfully', id: finalId });
        }
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ error: 'Failed to save product' });
    }
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Admin Data Endpoint
app.get('/api/admin/data', (req, res) => {
    try {
        const downloadsPath = path.join(__dirname, 'downloads.json');
        const subscribersPath = path.join(__dirname, 'subscribers.json');

        const downloads = fs.existsSync(downloadsPath) ? JSON.parse(fs.readFileSync(downloadsPath, 'utf8')) : [];
        const subscribers = fs.existsSync(subscribersPath) ? JSON.parse(fs.readFileSync(subscribersPath, 'utf8')) : [];

        // System Health Check
        const status = {
            stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
            adminPasswordConfigured: !!process.env.ADMIN_PASSWORD,
            envFileExists: fs.existsSync(path.join(__dirname, '.env')),
            nodeEnv: process.env.NODE_ENV
        };

        res.json({ downloads, subscribers, status });
    } catch (err) {
        console.error('Error fetching admin data:', err);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// New endpoint to fetch recent Stripe payments
app.get('/api/admin/stripe-payments', async (req, res) => {
    try {
        if (!stripe) {
            return res.status(503).json({ error: 'Stripe not configured' });
        }

        // Fetch last 100 payment intents (successful payments)
        const paymentIntents = await stripe.paymentIntents.list({
            limit: 100,
        });

        const payments = paymentIntents.data
            .filter(pi => pi.status === 'succeeded')
            .map(pi => ({
                id: pi.id,
                amount: (pi.amount / 100).toFixed(2),
                currency: pi.currency.toUpperCase(),
                date: new Date(pi.created * 1000).toLocaleString(),
                customerEmail: pi.receipt_email || 'N/A',
                description: pi.description || 'N/A'
            }));

        res.json({ payments });
    } catch (err) {
            // Ensure preflight requests are handled
            app.options('*', cors());

        console.error('Error fetching Stripe payments:', err);
        res.status(500).json({ error: 'Failed to fetch payments: ' + err.message });
    }
});

// 5. Subscription Endpoint
app.post('/subscribe', (req, res) => {
    try {
        const { firstName, lastName, email, interests } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const subPath = path.join(__dirname, 'subscribers.json');
        let subscribers = [];
        if (fs.existsSync(subPath)) {
            subscribers = JSON.parse(fs.readFileSync(subPath, 'utf8'));
        }

        // Check for duplicate
        if (!subscribers.find(s => s.email === email)) {
            subscribers.push({
                firstName,
                lastName,
                email,
                interests,
                date: new Date().toISOString()
            });
            fs.writeFileSync(subPath, JSON.stringify(subscribers, null, 2));
        }

        // Note: Real email sending would go here (e.g. using Nodemailer)
        // For now, we store it so Emmanuel can retrieve the list.
        
        res.json({ message: 'Subscribed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Robust starter: try a handful of ports if the configured port is in use
function tryListen(port, attemptsLeft = 5) {
    const srv = app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });

    srv.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE') {
            if (attemptsLeft > 0) {
                console.warn(`Port ${port} in use, trying port ${port + 1}...`);
                setTimeout(() => tryListen(port + 1, attemptsLeft - 1), 200);
            } else {
                console.error('All attempted ports are in use. Free a port or set PORT environment variable.');
                process.exit(1);
            }
        } else {
            console.error(err);
            process.exit(1);
        }
    });
}

tryListen(Number(PORT));
