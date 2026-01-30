function toggleMenu() {
    document.getElementById("navLinks").classList.toggle("active");

    // Toggle the Hamburger to X
    const btn = document.getElementById('hamburgerBtn');
    btn.classList.toggle('active');
}

function toggleShortBio() {
    const shortBio = document.getElementById('shortBio');
    const button = document.querySelector('.toggle-short-bio');
    
    // Toggle display
    if (shortBio.style.display === 'none') {
        shortBio.style.display = 'block';
        button.classList.add('active');
        button.querySelector('.toggle-text').textContent = 'Hide Short Version';
    } else {
        shortBio.style.display = 'none';
        button.classList.remove('active');
        button.querySelector('.toggle-text').textContent = 'Read Short Version (150 Words)';
    }
}
