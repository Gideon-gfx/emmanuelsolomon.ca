function toggleMenu() {
    const nav = document.getElementById("navLinks");
    const btn = document.getElementById('hamburgerBtn');
    if(!nav || !btn) return;
    nav.classList.toggle("active");
    // Toggle the Hamburger to X
    btn.classList.toggle('active');
    // Prevent body scroll when menu open on mobile
    document.body.classList.toggle('menu-open', nav.classList.contains('active'));
}

// Scroll Animation Handler
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('scroll-animate');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all scroll animation elements on page load
document.addEventListener('DOMContentLoaded', function() {
    const scrollElements = document.querySelectorAll('.scroll-fade, .scroll-fade-up');
    scrollElements.forEach(element => {
        observer.observe(element);
    });
    // Ensure a centered 'Designed by' credit exists in any footer (.red4)
    document.querySelectorAll('.red4').forEach(f => {
        if (!f.querySelector('.designer')) {
            const p = document.createElement('p');
            p.className = 'designer';
            p.innerHTML = 'Designed by <a title="Designer" rel="noopener" href="/">GIDEON</a>';
            f.appendChild(p);
        }
    });
    // Close mobile menu when pressing Escape
    document.addEventListener('keydown', function(e){
        if(e.key === 'Escape'){
            const nav = document.getElementById('navLinks');
            const btn = document.getElementById('hamburgerBtn');
            if(nav && nav.classList.contains('active')){
                nav.classList.remove('active');
                if(btn) btn.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        }
    });
    // Close mobile menu when a nav link is clicked (mobile)
    const navLinksContainer = document.getElementById('navLinks');
    if (navLinksContainer) {
        navLinksContainer.addEventListener('click', function(e){
            // Only close if it's an anchor tag AND NOT a dropdown toggle
            if(e.target && e.target.tagName === 'A' && !e.target.classList.contains('dropdown-toggle')){
                const nav = document.getElementById('navLinks');
                const btn = document.getElementById('hamburgerBtn');
                if(nav && nav.classList.contains('active')){
                    nav.classList.remove('active');
                    if(btn) btn.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            }
        });
    }
});