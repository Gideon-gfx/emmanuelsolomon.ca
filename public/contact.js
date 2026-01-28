function toggleMenu() {
document.getElementById("navLinks").classList.toggle("active");

// Toggle the Hamburger to X
const btn = document.getElementById('hamburgerBtn');
btn.classList.toggle('active');
}
    
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const status = document.getElementById('formStatus');
    const btn = this.querySelector('.submit-btn');
    const data = new FormData(event.target);

    btn.innerHTML = "Sending...";

    // This sends the data to Formspree
    fetch(event.target.action, {
        method: contactForm.method,
        body: data,
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            status.innerHTML = "✓ Success! Emmanuel will receive your message.";
            status.style.color = "#28a745";
            status.style.display = "block";
            contactForm.reset();
            btn.innerHTML = "Sent!";
        } else {
            status.innerHTML = "Oops! There was a problem sending your message.";
            status.style.color = "red";
            btn.innerHTML = "Error";
        }
    });
});