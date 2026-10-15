# Noorullah Zamindar — Portfolio

Personal portfolio website of **Noorullah Zamindar**, AI Engineer & Data Scientist.
Built as a single-page site with a dedicated projects library.

**Live site:** https://noorullahzamindar-007.github.io/Portfolio/

## What's inside

- **Hero** — animated intro with rotating role titles, availability badge, and contact links
- **Specializations & Services** — AI agents, workflow automation, applied ML, training
- **Experience timeline** — UNDP, AMHTC, Ghazi Amanullah Khan University, io Global Services, freelance delivery
- **Education** — Rana University (Software Engineering), Alagappa University (BBA, in progress), Storai Institute (English diploma)
- **Skills** — expandable cards covering Python/data, ML/AI, automation, frameworks, and training
- **Featured projects** — filterable project cards (AI, automation, data, web, training) with tech tags and GitHub links
- **GitHub activity, certifications, proof & client highlights, contact** sections
- **Dedicated project pages** (`projects.html` + `projects/`) — one page per featured project
- Dark/light theme toggle, page loader, scroll progress bar, back-to-top button, scroll-reveal animations, responsive mobile menu

## Tech stack

- HTML5, CSS3 (custom properties, no framework), vanilla JavaScript
- [Font Awesome 6](https://fontawesome.com/) icons
- [Typed.js](https://github.com/mattboldt/typed.js/) for the rotating hero roles
- [ScrollReveal](https://scrollrevealjs.org/) for scroll animations
- Hosted on GitHub Pages

## Project structure

```
├── index.html          # Main single-page portfolio
├── projects.html       # Project library overview
├── projects/           # One dedicated page per featured project
├── images/             # Profile photos, certificate badges, project SVGs
├── styles.css          # Main stylesheet
├── project-pages.css   # Styles for projects.html and project detail pages
├── script.js           # Theme toggle, filters, accordions, animations, back-to-top
└── project-pages.js    # Scripts for the project pages
```

## Run locally

Any static file server works, e.g.:

```bash
cd Portfolio
python3 -m http.server 8000
# open http://localhost:8000
```

No build step and no dependencies to install.

## Contact

- GitHub: https://github.com/NoorullahZamindar-007
- LinkedIn: https://www.linkedin.com/in/noorullah-zamindar-4975a328a/
- Email: noorullahzamindar9@gmail.com
