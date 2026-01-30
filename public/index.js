function toggleMenu() {
        document.getElementById("navLinks").classList.toggle("active");

        // Toggle the Hamburger to X
        const btn = document.getElementById('hamburgerBtn');
        btn.classList.toggle('active');
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
});