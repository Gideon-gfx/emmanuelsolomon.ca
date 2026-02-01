(() => {
    // 1. Check strict frequency (1 month)
    const ONE_MONTH = 30 * 24 * 60 * 60 * 1000;
    const lastSeen = localStorage.getItem('mailing_last_seen');
    const subscribedDate = localStorage.getItem('mailing_subscribed_date');
    const now = Date.now();

    // If subscribed recently (within 1 month), do not show
    if (subscribedDate && (now - Number(subscribedDate) < ONE_MONTH)) {
        return;
    }

    // If dismissed recently (e.g. 1 day cooldown?), optional. 
    // User said "untill like 1 month or there's an upcoming event"
    // We'll treat "subscribed" as the main blocker.
    // If they haven't subscribed, we show it? Maybe once per session?
    if (sessionStorage.getItem('mailing_popup_shown')) {
        return;
    }

    // 2. Inject CSS
    const css = `
    .mailing-popup-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.6);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.4s ease;
    }
    .mailing-popup-overlay.active {
        opacity: 1;
        visibility: visible;
    }
    .mailing-popup-content {
        background: #fff;
        width: 90%;
        max-width: 500px;
        border-radius: 15px;
        padding: 30px;
        position: relative;
        text-align: center;
        font-family: 'Playfair Display', serif;
        transform: translateY(20px);
        transition: transform 0.4s ease;
        box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .mailing-popup-overlay.active .mailing-popup-content {
        transform: translateY(0);
    }
    .mp-close {
        position: absolute;
        top: 15px; right: 15px;
        background: transparent;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #555;
    }
    .mp-title {
        font-size: 2rem;
        margin-bottom: 0.5rem;
        color: #d00000; /* Red Text */
    }
    .mp-text {
        color: #666;
        margin-bottom: 1.5rem;
        font-family: sans-serif;
        font-size: 0.95rem;
        line-height: 1.5;
    }
    .mp-input {
        width: 100%;
        padding: 12px;
        margin-bottom: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 1rem;
    }
    .mp-btn {
        background-color: #d00000; /* Red Button */
        color: #fff;
        border: none;
        border-radius: 5px;
        padding: 12px 30px;
        font-size: 1rem;
        cursor: pointer;
        width: 100%;
        transition: background 0.3s, opacity 0.3s;
    }
    .mp-btn:hover {
        background-color: #a00000;
        opacity: 0.9;
    }
    /* Small screen adjustments */
    @media (max-width: 600px) {
        .mp-title {
            font-size: 1.5rem;
        }
        .mp-text {
            font-size: 0.9rem;
            padding: 0 10px; /* Text break padding */
        }
    }
    .mp-success {
        display: none;
        color: #28a745;
    }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // 3. Inject HTML
    const html = `
    <div class="mailing-popup-overlay" id="mailingPopup">
        <div class="mailing-popup-content">
            <button class="mp-close" onclick="closeMailingPopup()">&times;</button>
            <div id="mp-form-container">
                <h2 class="mp-title">Stay Updated</h2>
                <p class="mp-text">Join the community to get the latest updates on Emmanuel's performances and initiatives.</p>
                <form id="mailingPopupForm">
                    <input type="text" class="mp-input" name="firstName" placeholder="First Name" required>
                    <input type="email" class="mp-input" name="email" placeholder="Email Address" required>
                    <button type="submit" class="mp-btn">Subscribe</button>
                </form>
            </div>
            <div id="mp-success-container" class="mp-success">
                <div style="font-size: 50px; margin-bottom: 10px;">✓</div>
                <h3>You've Subscribed!</h3>
                <p>You'll get updates about Emmanuel directly in your inbox.</p>
                <button class="mp-btn" onclick="closeMailingPopup()">Close</button>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    // 4. Logic
    const popup = document.getElementById('mailingPopup');
    
    window.closeMailingPopup = () => {
        popup.classList.remove('active');
        // Mark as shown for this session so we don't annoy users on reload
        sessionStorage.setItem('mailing_popup_shown', 'true');
    };

    // Show after 5 seconds
    setTimeout(() => {
        popup.classList.add('active');
    }, 5000);

    const form = document.getElementById('mailingPopupForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = {
            firstName: formData.get('firstName'),
            email: formData.get('email'),
            interests: ['General Updates'] 
        };

        try {
            const res = await fetch('/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                // Succeeded
                document.getElementById('mp-form-container').style.display = 'none';
                document.getElementById('mp-success-container').style.display = 'block';
                // Set long-term cookie/storage
                localStorage.setItem('mailing_subscribed_date', Date.now());
            } else {
                alert('Something went wrong. Please try again.');
            }
        } catch (err) {
            console.error(err);
            alert('Error connecting to server.');
        }
    });

})(); // IIFE
