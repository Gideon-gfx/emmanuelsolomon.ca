
function toggleMenu() {
    document.getElementById("navLinks").classList.toggle("active");

    // Toggle the Hamburger to X
    const btn = document.getElementById('hamburgerBtn');
    btn.classList.toggle('active');
}
