document.addEventListener('DOMContentLoaded', () => {
  
  // 1. ELEMEN SELEKTOR
  const bottomSheet = document.getElementById('bottomSheet');
  const dragHandleContainer = document.getElementById('dragHandle');
  const btnMyLocation = document.getElementById('btnMyLocation');
  const locationDot = document.querySelector('.my-location-dot');
  const bottomRightFabs = document.querySelector('.bottom-right-fabs');
  const categoryScroll = document.getElementById('categoryScroll');
  const chips = document.querySelectorAll('.chip');
  const navItems = document.querySelectorAll('.nav-item');
  const searchInput = document.getElementById('searchInput');
  const btnClearSearch = document.getElementById('btnClearSearch');

  // 2. FITUR INPUT TELUSURI (SEARCH BAR)
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      if (btnClearSearch) {
        btnClearSearch.style.display = searchInput.value.length > 0 ? 'block' : 'none';
      }
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query !== '') {
          alert(`Mencari lokasi: "${query}"`);
          searchInput.blur();
        }
      }
    });
  }

  if (btnClearSearch && searchInput) {
    btnClearSearch.addEventListener('click', () => {
      searchInput.value = '';
      btnClearSearch.style.display = 'none';
      searchInput.focus();
    });
  }

// 3. FITUR DRAG BOTTOM SHEET + IKON SEMBUNYI SAAT DITARIK
  if (dragHandleContainer && bottomSheet) {
    let startY = 0;
    let isDragging = false;

    const getSheetHeights = () => {
      const sheetHeight = bottomSheet.offsetHeight || 520;
      const headerHeight = dragHandleContainer.offsetHeight || 60;
      const maxTranslate = sheetHeight - headerHeight;
      return { sheetHeight, headerHeight, maxTranslate };
    };

    let { maxTranslate: MAX_TRANSLATE } = getSheetHeights();
    let initialTranslateY = MAX_TRANSLATE;
    let currentTranslateY = MAX_TRANSLATE;
    const MIN_TRANSLATE = 0;

    const onDragStart = (e) => {
      isDragging = true;
      startY = e.touches ? e.touches[0].clientY : e.clientY;
      
      const heights = getSheetHeights();
      MAX_TRANSLATE = heights.maxTranslate;

      bottomSheet.style.transition = 'none';
      if (bottomRightFabs) bottomRightFabs.style.transition = 'none';
      if (locationDot) locationDot.style.transition = 'none';

      initialTranslateY = bottomSheet.classList.contains('expanded') ? MIN_TRANSLATE : MAX_TRANSLATE;
    };

    const onDragMove = (e) => {
      if (!isDragging) return;

      const currentY = e.touches ? e.touches[0].clientY : e.clientY;
      const deltaY = currentY - startY;

      let newTranslateY = initialTranslateY + deltaY;

      if (newTranslateY < MIN_TRANSLATE) newTranslateY = MIN_TRANSLATE;
      if (newTranslateY > MAX_TRANSLATE) newTranslateY = MAX_TRANSLATE;

      currentTranslateY = newTranslateY;

      const openProgress = (MAX_TRANSLATE - newTranslateY) / MAX_TRANSLATE;
      const iconDropOffset = openProgress * 150; 
      const iconOpacity = Math.max(0, 1 - openProgress * 1.6);

      bottomSheet.style.transform = `translateY(${newTranslateY}px)`;

      if (bottomRightFabs) {
        bottomRightFabs.style.transform = `translateY(${iconDropOffset}px)`;
        bottomRightFabs.style.opacity = iconOpacity;
      }
      if (locationDot) {
        locationDot.style.transform = `translateY(${iconDropOffset}px)`;
        locationDot.style.opacity = iconOpacity;
      }
    };

    const onDragEnd = () => {
      if (!isDragging) return;
      isDragging = false;

      const transitionStyle = 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease';
      bottomSheet.style.transition = transitionStyle;
      if (bottomRightFabs) bottomRightFabs.style.transition = transitionStyle;
      if (locationDot) locationDot.style.transition = transitionStyle;

      const deltaY = currentTranslateY - initialTranslateY;
      let shouldExpand = false;

      if (initialTranslateY === MAX_TRANSLATE && deltaY < -40) {
        shouldExpand = true;
      } else if (initialTranslateY === MIN_TRANSLATE && deltaY > 40) {
        shouldExpand = false;
      } else {
        shouldExpand = (initialTranslateY === MIN_TRANSLATE);
      }

      if (shouldExpand) {
        bottomSheet.classList.add('expanded');
        bottomSheet.style.transform = `translateY(${MIN_TRANSLATE}px)`;
        
        if (bottomRightFabs) {
          bottomRightFabs.style.transform = `translateY(150px)`;
          bottomRightFabs.style.opacity = '0';
          bottomRightFabs.style.pointerEvents = 'none';
        }
        if (locationDot) {
          locationDot.style.transform = `translateY(150px)`;
          locationDot.style.opacity = '0';
        }
      } else {
        bottomSheet.classList.remove('expanded');
        bottomSheet.style.transform = `translateY(${MAX_TRANSLATE}px)`;

        if (bottomRightFabs) {
          bottomRightFabs.style.transform = `translateY(0px)`;
          bottomRightFabs.style.opacity = '1';
          bottomRightFabs.style.pointerEvents = 'auto';
        }
        if (locationDot) {
          locationDot.style.transform = `translateY(0px)`;
          locationDot.style.opacity = '1';
        }
      }
    };

    dragHandleContainer.addEventListener('touchstart', onDragStart, { passive: true });
    window.addEventListener('touchmove', onDragMove, { passive: true });
    window.addEventListener('touchend', onDragEnd);

    dragHandleContainer.addEventListener('mousedown', onDragStart);
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);

    // Izinkan scroll vertikal normal di dalam sheet tanpa mengabaikan gesture child
      const sheetContent = document.querySelector('.sheet-content');
      if (sheetContent) {
  sheetContent.addEventListener('touchstart', (e) => {
        // Biarkan browser menangani touch native di foto/tombol
      }, { passive: true });
    }
  }

  // 4. TOMBOL LOKASI SAYA (EFEK MEMANTUL)
  if (btnMyLocation && locationDot) {
    btnMyLocation.addEventListener('click', () => {
      locationDot.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      locationDot.style.transform = 'translateY(0px) scale(1.4)';
      
      setTimeout(() => {
        locationDot.style.transform = 'translateY(0px) scale(1)';
      }, 300);
    });
  }

  // 5. CHIP KATEGORI (UBAH AKTIF)
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  // 6. FITUR MOUSE DRAG SCROLL
  const makeHorizontalScrollable = (container) => {
    if (!container) return;
    let isDown = false;
    let startX;
    let scrollLeft;

    container.addEventListener('mousedown', (e) => {
      isDown = true;
      container.style.cursor = 'grabbing';
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', () => {
      isDown = false;
      container.style.cursor = 'grab';
    });

    container.addEventListener('mouseup', () => {
      isDown = false;
      container.style.cursor = 'grab';
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    });
  };

  makeHorizontalScrollable(categoryScroll);

  document.querySelectorAll('.photo-gallery').forEach(gallery => {
    makeHorizontalScrollable(gallery);
  });

  document.querySelectorAll('.store-actions').forEach(actions => {
    makeHorizontalScrollable(actions);
  });

  // 7. BOTTOM NAV SWITCH TAB
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

});

// Helper Fungsi Generasi Bintang Gambar Dinamis (Jika Render dari JS)
function generateStarHTML(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = (rating % 1) >= 0.5;
  let html = '';

  for (let i = 0; i < fullStars; i++) {
    html += `<img src="images/star_full.png" alt="star" class="star-icon">`;
  }

  if (hasHalfStar) {
    html += `<img src="images/star_half.png" alt="star" class="star-icon">`;
  }

  return html;
}