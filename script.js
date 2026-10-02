document.addEventListener('DOMContentLoaded', () => {
  
  // Element Selectors
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
  const btnClose = document.querySelector('.btn-close');

  // 1. FITUR INPUT SEARCH
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

  // 2. FITUR DRAG BOTTOM SHEET + IKON SEMBUNYI & FIX DOT LOCATION
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

    // Helper untuk mengatur posisi bottom sheet & ikon melayang
    const setSheetPosition = (translateY) => {
      bottomSheet.style.transform = `translateY(${translateY}px)`;
      const openProgress = Math.max(0, Math.min(1, (MAX_TRANSLATE - translateY) / MAX_TRANSLATE));
      const iconDropOffset = openProgress * 150; 
      const iconOpacity = Math.max(0, 1 - openProgress * 1.6);

      if (bottomRightFabs) {
        bottomRightFabs.style.transform = `translateY(${iconDropOffset}px)`;
        bottomRightFabs.style.opacity = iconOpacity;
        bottomRightFabs.style.pointerEvents = openProgress > 0.5 ? 'none' : 'auto';
      }
      
      // Tetap pertahankan translate(-50%, -50%) agar posisi horizontal tidak bergeser
      if (locationDot) {
        locationDot.style.transform = `translate(-50%, -50%) translateY(${iconDropOffset}px)`;
        locationDot.style.opacity = iconOpacity;
      }
    };

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
      setSheetPosition(newTranslateY);
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
        setSheetPosition(MIN_TRANSLATE);
      } else {
        bottomSheet.classList.remove('expanded');
        setSheetPosition(MAX_TRANSLATE);
      }
    };

    dragHandleContainer.addEventListener('touchstart', onDragStart, { passive: true });
    window.addEventListener('touchmove', onDragMove, { passive: true });
    window.addEventListener('touchend', onDragEnd);

    dragHandleContainer.addEventListener('mousedown', onDragStart);
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);

    // Tombol Close pada Sheet Header
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        bottomSheet.classList.remove('expanded');
        bottomSheet.style.transition = 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease';
        setSheetPosition(MAX_TRANSLATE);
      });
    }

    // Update tinggi sheet saat ukuran layar di-resize
    window.addEventListener('resize', () => {
      const heights = getSheetHeights();
      MAX_TRANSLATE = heights.maxTranslate;
      if (!bottomSheet.classList.contains('expanded')) {
        setSheetPosition(MAX_TRANSLATE);
      }
    });

    // Cegah interupsi drag bottom-sheet saat scroll di dalam daftar toko
    const sheetContent = document.querySelector('.sheet-content');
    if (sheetContent) {
      sheetContent.addEventListener('touchstart', (e) => {
        e.stopPropagation();
      }, { passive: true });
    }
  }

  // 3. EFEK TOMBOL LOKASI SAYA (ANIMASI BOUNCE)
  if (btnMyLocation && locationDot) {
    btnMyLocation.addEventListener('click', () => {
      locationDot.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      locationDot.style.transform = 'translate(-50%, -50%) scale(1.3)';
      
      setTimeout(() => {
        locationDot.style.transform = 'translate(-50%, -50%) scale(1)';
      }, 300);
    });
  }

  // 4. CHIP KATEGORI (FILTER)
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  // 5. DRAG SCROLL MOUSE UNTUK PC/DESKTOP PADA ELEMEN HORIZONTAL
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
  document.querySelectorAll('.photo-gallery').forEach(gallery => makeHorizontalScrollable(gallery));
  document.querySelectorAll('.store-actions').forEach(actions => makeHorizontalScrollable(actions));

  // 6. BOTTOM NAVIGATION SWITCH
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // 7. PROTEKSI GAMBAR DARI TEKAN-TAHAN / DOWNLOAD / DRAG
  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
    }
  });

  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
    }
  });

});