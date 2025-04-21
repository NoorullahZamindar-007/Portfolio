document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for Active Link Highlighting
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('header nav a');

    // Nav Observer
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => link.classList.remove('active'));
                const id = entry.target.getAttribute('id');
                const activeLink = document.querySelector(`header nav a[href="#${id}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }, { threshold: 0.5 });

    sections.forEach(section => navObserver.observe(section));

    // Animation Observer
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                const element = entry.target;
                const animationType = element.dataset.animate || 'fade-up';
                
                // Reset transition before animation
                element.style.transition = 'none';
                element.style.animation = `${animationType} 1s ease-out forwards`;
                
                // Cleanup after animation
                element.addEventListener('animationend', () => {
                    element.style.transition = ''; // Restore original transition
                }, { once: true });

                animationObserver.unobserve(element);
            }
        });
    }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

    // Animation setup
    document.querySelectorAll('section:not(#home), [data-animate]').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        animationObserver.observe(el);
    });

    document.querySelectorAll('[data-animate-child]').forEach((child, index) => {
        child.style.opacity = '0';
        child.style.transform = 'translateY(20px)';
        child.style.animationDelay = `${index * 0.2}s`;
        animationObserver.observe(child);
    });

    const sr = ScrollReveal({
        reset: false,
        distance: '15px',
        duration: 1000,
        delay: 200,
        viewFactor: 0.3,
        mobile: true,
        cleanup: true
    })
      
      sr.reveal('.left', { origin: 'left' })
      sr.reveal('.right', { origin: 'right' })


    const typed = new Typed('#rotating-role', {
        strings: [
            "Data Scientist",
            "AI Enthusiast", 
            "Machine Learning Engineer",
            "Deep Learning Researcher"
        ],
        typeSpeed: 100,
        backSpeed: 100,
        backDelay: 1000,
        loop: true,
    });

    // Mobile Menu Toggle
    const menuIcon = document.querySelector('#menu-icon');
    const navbar = document.querySelector('.navbar');

    menuIcon.onclick = () => {
        menuIcon.classList.toggle('fa-times');
        navbar.classList.toggle('active');
    };

    // Close menu when clicking nav links
    document.querySelectorAll('.navbar a').forEach(navLink => {
        navLink.addEventListener('click', () => {
            menuIcon.classList.remove('fa-times');
            navbar.classList.remove('active');
        });
    });

    // Close menu on scroll
    window.onscroll = () => {
        menuIcon.classList.remove('fa-times');
        navbar.classList.remove('active');
    };
});