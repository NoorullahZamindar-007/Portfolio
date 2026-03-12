document.addEventListener('DOMContentLoaded', () => {
  const images = document.querySelectorAll('.cover-image img, .project-card img');

  if (!images.length) {
    return;
  }

  const lightbox = document.createElement('div');
  lightbox.className = 'image-lightbox';
  lightbox.innerHTML = `
    <div class="image-lightbox-dialog">
      <button class="image-lightbox-close" type="button" aria-label="Close image preview">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <img src="" alt="Expanded project preview" />
    </div>
  `;

  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector('img');
  const closeButton = lightbox.querySelector('.image-lightbox-close');

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  images.forEach((image) => {
    image.addEventListener('click', () => {
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt || 'Expanded project preview';
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  closeButton.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeLightbox();
    }
  });
});
