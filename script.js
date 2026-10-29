document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('is-loading');

    // Honor the OS reduced-motion setting: skip the scroll-reveal animations
    // and show content immediately instead of animating it in.
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Intersection Observer for Active Link Highlighting
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('header nav a');
    const loader = document.querySelector('#page-loader');
    const scrollProgress = document.querySelector('#scroll-progress');
    const backToTop = document.querySelector('#back-to-top');
    const themeToggle = document.querySelector('#theme-toggle');
    // localStorage throws in browsers with storage blocked (e.g. some
    // private modes); a theme read must never break the whole page script.
    let storedTheme = null;
    try {
        storedTheme = localStorage.getItem('portfolio-theme');
    } catch (e) {
        storedTheme = null;
    }

    if (storedTheme === 'light') {
        document.body.classList.add('light-theme');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
    }

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

    // Animation setup (skipped for reduced-motion users so sections are
    // readable immediately instead of animating in).
    if (!prefersReducedMotion) {
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
    }

    // Third-party CDN libraries may be blocked (ad blockers, offline dev);
    // initialize them only when present so the rest of the UI script keeps working.
    const rotatingRoleEl = document.querySelector('#rotating-role');
    if (typeof ScrollReveal !== 'undefined' && !prefersReducedMotion) {
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
    }

    if (typeof Typed !== 'undefined' && rotatingRoleEl) {
        const typed = new Typed('#rotating-role', {
            strings: [
                "AI Engineer",
                "Data Scientist",
                "ML Trainer",
                "Automation Specialist"
            ],
            typeSpeed: 100,
            backSpeed: 100,
            backDelay: 1000,
            loop: true,
        });
    } else if (rotatingRoleEl && !rotatingRoleEl.textContent.trim()) {
        // Static fallback when typed.js cannot load.
        rotatingRoleEl.textContent = "AI Engineer";
    }

    const skillCards = document.querySelectorAll('[data-skill-card]');
    const projectCards = document.querySelectorAll('[data-project-card]');
    const projectFilters = document.querySelectorAll('[data-project-filter]');

    const animateSkillTags = (card) => {
        const tags = card.querySelectorAll('.skill-tags span');

        tags.forEach((tag, index) => {
            tag.style.setProperty('--tag-delay', `${index * 0.06}s`);
            tag.style.animation = 'none';
            tag.offsetHeight;
            tag.style.animation = '';
        });
    };

    const setSkillState = (card, expanded) => {
        const toggle = card.querySelector('.skill-toggle');
        // A card without its toggle must not throw here and take down
        // the whole page script (e.g. markup drift in a future edit).
        if (!toggle) return;
        card.classList.toggle('active', expanded);
        toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');

        if (expanded) {
            animateSkillTags(card);
        }
    };

    skillCards.forEach((card) => {
        const toggle = card.querySelector('.skill-toggle');
        if (!toggle) return;

        toggle.addEventListener('click', () => {
            const isActive = card.classList.contains('active');

            skillCards.forEach((item) => setSkillState(item, false));
            setSkillState(card, !isActive);
        });
    });

    const initiallyActiveCard = document.querySelector('[data-skill-card].active');
    if (initiallyActiveCard) {
        animateSkillTags(initiallyActiveCard);
    }

    const animateProjectTags = (card) => {
        const tags = card.querySelectorAll('.project-tags span');

        tags.forEach((tag, index) => {
            tag.style.setProperty('--project-tag-delay', `${index * 0.06}s`);
            tag.style.animation = 'none';
            tag.offsetHeight;
            tag.style.animation = '';
        });
    };

    const setProjectState = (card, expanded) => {
        const toggle = card.querySelector('.project-toggle');
        // Same guard as skill cards: a missing toggle must never break
        // the filter handler, which calls this for every project card.
        if (!toggle) return;
        card.classList.toggle('active', expanded);
        toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');

        if (expanded) {
            animateProjectTags(card);
        }
    };

    projectCards.forEach((card) => {
        const toggle = card.querySelector('.project-toggle');
        if (!toggle) return;

        toggle.addEventListener('click', () => {
            const isActive = card.classList.contains('active');

            projectCards.forEach((item) => setProjectState(item, false));
            setProjectState(card, !isActive);
        });
    });

    const initiallyActiveProject = document.querySelector('[data-project-card].active');
    if (initiallyActiveProject) {
        animateProjectTags(initiallyActiveProject);
    }

    projectFilters.forEach((filter) => {
        filter.addEventListener('click', () => {
            const selected = filter.dataset.projectFilter;

            projectFilters.forEach((item) => item.classList.remove('active'));
            filter.classList.add('active');

            let firstVisibleProject = null;

            projectCards.forEach((card) => {
                const categories = (card.dataset.projectCategory || '').split(' ');
                const matches = selected === 'all' || categories.includes(selected);

                card.classList.toggle('is-hidden', !matches);
                setProjectState(card, false);

                if (matches && !firstVisibleProject) {
                    firstVisibleProject = card;
                }
            });

            if (firstVisibleProject) {
                setProjectState(firstVisibleProject, true);
            }
        });
    });

    window.addEventListener('load', () => {
        if (loader) {
            loader.classList.add('hidden');
        }
        document.body.classList.remove('is-loading');
    });

    setTimeout(() => {
        if (loader) {
            loader.classList.add('hidden');
        }
        document.body.classList.remove('is-loading');
    }, 1200);

    // Mobile Menu Toggle (the hamburger is a real <button>, so it works with
    // keyboard and screen readers; aria-expanded always mirrors the open state).
    const menuIcon = document.querySelector('#menu-icon');
    const navbar = document.querySelector('.navbar');
    const menuIconGlyph = menuIcon ? menuIcon.querySelector('i') : null;

    const setMenuOpen = (open) => {
        if (navbar) navbar.classList.toggle('active', open);
        if (menuIconGlyph) menuIconGlyph.classList.toggle('fa-times', open);
        if (menuIcon) menuIcon.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    if (menuIcon && navbar) {
        menuIcon.addEventListener('click', () => {
            setMenuOpen(!navbar.classList.contains('active'));
        });

        // Close menu when clicking nav links
        navbar.querySelectorAll('a').forEach(navLink => {
            navLink.addEventListener('click', () => setMenuOpen(false));
        });
    }

    // Close menu on scroll. addEventListener (not window.onscroll) so
    // this handler composes with any other scroll listener instead of
    // silently replacing it — or being replaced by it.
    const handleScroll = () => {
        setMenuOpen(false);

        if (scrollProgress) {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            scrollProgress.style.width = `${progress}%`;
        }

        if (backToTop) {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            backToTop.classList.toggle('visible', scrollTop > 600);
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            // Jump instantly for reduced-motion users instead of animating.
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-theme');
            try {
                localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
            } catch (e) {
                // Storage blocked: the theme still toggles for this visit,
                // it just won't persist to the next one.
            }
            themeToggle.innerHTML = isLight
                ? '<i class="fa-solid fa-moon"></i>'
                : '<i class="fa-solid fa-sun"></i>';
        });
    }

    handleScroll();
});
