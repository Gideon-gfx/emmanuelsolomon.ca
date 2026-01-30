// Cookie Management Functions
const CookieManager = {
    // Set a cookie
    set: function(name, value, days = 365) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Strict;Secure";
    },

    // Get a cookie value
    get: function(name) {
        const cookieName = name + "=";
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.indexOf(cookieName) === 0) {
                return cookie.substring(cookieName.length, cookie.length);
            }
        }
        return null;
    },

    // Delete a cookie
    delete: function(name) {
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    },

    // Check if cookies are accepted
    hasConsent: function() {
        const consent = this.get('cookieConsent');
        return consent === 'accepted' || consent === 'declined';
    },

    // Accept cookies
    acceptCookies: function() {
        this.set('cookieConsent', 'accepted', 365);
        this.hideBanner();
    },

    // Decline cookies (only essential)
    declineCookies: function() {
        this.set('cookieConsent', 'declined', 365);
        this.hideBanner();
    },

    // Hide the cookie banner
    hideBanner: function() {
        const banner = document.getElementById('cookieConsentBanner');
        if (banner) {
            banner.style.opacity = '0';
            setTimeout(() => {
                banner.style.display = 'none';
            }, 300);
        }
    },

    // Show the cookie banner
    showBanner: function() {
        const banner = document.getElementById('cookieConsentBanner');
        if (banner) {
            banner.style.display = 'block';
            setTimeout(() => {
                banner.style.opacity = '1';
            }, 10);
        }
    },

    // Initialize cookie consent
    init: function() {
        const consent = this.get('cookieConsent');
        // Only show banner if no consent decision has been made
        if (consent !== 'accepted' && consent !== 'declined') {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.showBanner());
            } else {
                this.showBanner();
            }
        }
    }
};

// Create and inject the cookie banner HTML
function createCookieBanner() {
    const bannerHTML = `
    <div id="cookieConsentBanner" class="cookie-banner">
        <div class="cookie-content">
            <div class="cookie-text">
                <h4>🍪 We use cookies</h4>
                <p>We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                By clicking "Accept All", you consent to our use of cookies. 
                <a href="/privacy" class="cookie-link">Read our Privacy Policy</a></p>
            </div>
            <div class="cookie-buttons">
                <button onclick="CookieManager.declineCookies()" class="cookie-btn cookie-btn-decline">Decline</button>
                <button onclick="CookieManager.acceptCookies()" class="cookie-btn cookie-btn-accept">Accept All</button>
            </div>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', bannerHTML);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    createCookieBanner();
    CookieManager.init();
});
