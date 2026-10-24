document.addEventListener('DOMContentLoaded', () => {
  const images = document.querySelectorAll('.cover-image img, .project-card img');

  if (!images.length) {
    return;
  }

  const lightbox = document.createElement('div');
  lightbox.className = 'image-lightbox';
  // Expose the preview as a modal dialog so assistive technologies
  // announce it correctly and know focus should stay inside it.
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Image preview');
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
  let lastOpenedImage = null;

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    // Return focus to the image that opened the preview.
    if (lastOpenedImage) {
      lastOpenedImage.focus();
      lastOpenedImage = null;
    }
  };

  const openLightbox = (image) => {
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt || 'Expanded project preview';
    lastOpenedImage = image;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    closeButton.focus();
  };

  images.forEach((image) => {
    // Clickable preview images must also work for keyboard users.
    image.setAttribute('tabindex', '0');
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', `Open enlarged view of ${image.alt || 'project image'}`);
    image.addEventListener('click', () => openLightbox(image));
    image.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(image);
      }
    });
  });

  closeButton.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (event) => {
    // Only act when the preview is open; an unconditional close would
    // clear body overflow and steal a no-op Escape on every page.
    if (event.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
});
