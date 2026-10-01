document.addEventListener('DOMContentLoaded', () => {
  
  // =============================================================
  // 1. ELEMEN SELEKTOR
  // =============================================================
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

  // =============================================================
  // 2. FITUR INPUT TELUSURI (SEARCH BAR)
  // =============================================================
  if (searchInput) {
    // A. Deteksi Ketikan untuk Tampilkan / Sembunyikan Tombol "X"
    searchInput.addEventListener('input', () => {
      if (btnClearSearch) {
        if (searchInput.value.length > 0) {
          btnClearSearch.style.display = 'block';
        } else {
          btnClearSearch.style.display = 'none';
        }
      }
    });

    // B. Tekan Enter untuk Eksekusi Pencarian
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query !== '') {
          alert(`Mencari lokasi: "${query}"`);
          searchInput.blur(); // Hilangkan fokus keyboard
        }
      }
    });
  }

  // C. Tombol "X" untuk Hapus Teks Pencarian
  if (btnClearSearch && searchInput) {
    btnClearSearch.addEventListener('click', () => {
      searchInput.value = '';
      btnClearSearch.style.display = 'none';
      searchInput.focus();
    });
  }

  // =============================================================
  // 3. FITUR DRAG BOTTOM SHEET + IKON SEMBUNYI SAAT DITARIK
  // =============================================================
  if (dragHandleContainer && bottomSheet) {
    let startY = 0;
    let isDragging = false;

    // Hitung jarak geser otomatis berdasarkan tinggi elemen CSS
    const getSheetHeights = () => {
      const sheetHeight = bottomSheet.offsetHeight || 520;
      const headerHeight = dragHandleContainer.offsetHeight || 60;
      const maxTranslate = sheetHeight - headerHeight; // Jarak tertutup (~460px)
      return { sheetHeight, headerHeight, maxTranslate };
    };

    let { maxTranslate: MAX_TRANSLATE } = getSheetHeights();
    let initialTranslateY = MAX_TRANSLATE;
    let currentTranslateY = MAX_TRANSLATE;

    const MIN_TRANSLATE = 0; // Terbuka penuh

    // Awal Mula Drag / Sentuhan
    const onDragStart = (e) => {
      isDragging = true;
      startY = e.touches ? e.touches[0].clientY : e.clientY;
      
      const heights = getSheetHeights();
      MAX_TRANSLATE = heights.maxTranslate;

      // Matikan transisi animasi sementara agar gerakan 1:1 real-time
      bottomSheet.style.transition = 'none';
      if (bottomRightFabs) bottomRightFabs.style.transition = 'none';
      if (locationDot) locationDot.style.transition = 'none';

      if (bottomSheet.classList.contains('expanded')) {
        initialTranslateY = MIN_TRANSLATE;
      } else {
        initialTranslateY = MAX_TRANSLATE;
      }
    };

    // Saat Ditarik / Digeser
    const onDragMove = (e) => {
      if (!isDragging) return;

      // KUNCI: Mencegah scroll / refresh bawaan browser HP
      if (e.cancelable) e.preventDefault();

      const currentY = e.touches ? e.touches[0].clientY : e.clientY;
      const deltaY = currentY - startY;

      let newTranslateY = initialTranslateY + deltaY;

      // Batasi area geser
      if (newTranslateY < MIN_TRANSLATE) newTranslateY = MIN_TRANSLATE;
      if (newTranslateY > MAX_TRANSLATE) newTranslateY = MAX_TRANSLATE;

      currentTranslateY = newTranslateY;

      // Hitung presentase keterbukaan (0 = Tertutup, 1 = Terbuka Penuh)
      const openProgress = (MAX_TRANSLATE - newTranslateY) / MAX_TRANSLATE;

      // Ikon meluncur TURUN ke bawah & memudar saat ditarik naik
      const iconDropOffset = openProgress * 150; 
      const iconOpacity = Math.max(0, 1 - openProgress * 1.6);

      // Perbarui posisi Bottom Sheet
      bottomSheet.style.transform = `translateY(${newTranslateY}px)`;

      // Perbarui posisi Ikon (Meluncur Turun & Memudar)
      if (bottomRightFabs) {
        bottomRightFabs.style.transform = `translateY(${iconDropOffset}px)`;
        bottomRightFabs.style.opacity = iconOpacity;
      }
      if (locationDot) {
        locationDot.style.transform = `translateY(${iconDropOffset}px)`;
        locationDot.style.opacity = iconOpacity;
      }
    };

    // Saat Drag Dilepas (Snap Effect)
    const onDragEnd = () => {
      if (!isDragging) return;
      isDragging = false;

      // Nyalakan kembali transisi CSS agar pergerakan mulus
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
        // Drawer Terbuka Penuh -> Ikon Turun Sembunyi
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
        // Drawer Tertutup -> Ikon Kembali Naik & Muncul
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

    // Listener Touch Event (HANYA PADA HEADER/HANDLENYA)
    dragHandleContainer.addEventListener('touchstart', onDragStart, { passive: false });
    window.addEventListener('touchmove', onDragMove, { passive: false });
    window.addEventListener('touchend', onDragEnd);

    // Listener Mouse Event (PC/Laptop)
    dragHandleContainer.addEventListener('mousedown', onDragStart);
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
  }

  // =============================================================
  // 4. TOMBOL LOKASI SAYA (EFEK MEMANTUL)
  // =============================================================
  if (btnMyLocation && locationDot) {
    btnMyLocation.addEventListener('click', () => {
      locationDot.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      locationDot.style.transform = 'translateY(0px) scale(1.4)';
      
      setTimeout(() => {
        locationDot.style.transform = 'translateY(0px) scale(1)';
      }, 300);
    });
  }

  // =============================================================
  // 5. CHIP KATEGORI (UBAH AKTIF & GESER MOUSE)
  // =============================================================
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  // =============================================================
  // 6. FITUR MOUSE DRAG SCROLL UNTUK SEMUA ELEMEN HORIZONTAL
  // (Category Scroll, Photo Gallery, & Store Actions)
  // =============================================================
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
      const walk = (x - startX) * 2; // Kecepatan scroll
      container.scrollLeft = scrollLeft - walk;
    });
  };

  // Terapkan ke Category Scroll
  makeHorizontalScrollable(categoryScroll);

  // Terapkan ke semua Galeri Foto & Tombol Aksi Toko
  document.querySelectorAll('.photo-gallery').forEach(gallery => {
    makeHorizontalScrollable(gallery);
  });

  document.querySelectorAll('.store-actions').forEach(actions => {
    makeHorizontalScrollable(actions);
  });

  // =============================================================
  // 7. BOTTOM NAV SWITCH TAB
  // =============================================================
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

});
function generateStarHTML(rating) {
  const fullStars = Math.floor(rating); // Ambil angka bulat (misal 4.5 -> 4)
  const hasHalfStar = (rating % 1) >= 0.5; // Cek apakah ada sisa 0.5 ke atas
  let html = '';

  // Tambah Bintang Full
  for (let i = 0; i < fullStars; i++) {
    html += `<img src="assets/star-full.png" alt="star" class="star-icon">`;
  }

  // Tambah Bintang Setengah jika ada
  if (hasHalfStar) {
    html += `<img src="assets/star-half.png" alt="star" class="star-icon">`;
  }

  return html;
}

// Contoh Penggunaan:
// document.querySelector('.stars-img').innerHTML = generateStarHTML(4.5);