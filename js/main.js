const Novastra = (function() {

  let cfg = {};
  let state = {
    halamanSekarang: 1,
    halamanMomen: 1,
    keywordSearch: '',
    muridPerHalaman: 15,
    lihatSemua: false
  };

  const DEFAULTS = {
    container: '#app',
    namaKelas: 'Kelas',
    tagline: 'One Class · One Memory · One Bond',
    heroImage: '',
    logoKelas: '',
    backgroundSection: '',
    musik: '',
    tentang: { judul: 'Tentang Kelas', deskripsi: '', stats: [] },
    waliKelas: { nama: '-', jabatan: '-', foto: '' },
    struktur: { ketua: null, wakil: null, sekretaris: [], bendahara: [] },
    siswa: [],
    momen: [],
    momenMax: 6,
    ekstensiMomen: 'jpg',
    instagram: '',
    muridPerHalamanHP: 6,
    muridPerHalamanDesktop: 15,
    slideshowInterval: 4000
  };

  function init(userConfig) {
    cfg = Object.assign({}, DEFAULTS, userConfig);

    if (cfg.momenMax > 0 && cfg.ekstensiMomen) {
      cfg.momen = [];
      for (let i = 1; i <= cfg.momenMax; i++) {
        cfg.momen.push({ file: `momen_${i}.${cfg.ekstensiMomen}` });
      }
    }

    state.muridPerHalaman = getMuridPerHalaman();
    renderAll();
    setupSearch();
    setupResize();
    initAOS();
  }

  const namaDepan = nama => nama.split(' ')[0];

  function namaPendek(nama) {
    const p = nama.trim().split(' ').filter(x => x.length > 0);
    if (p.length === 1) return p[0];
    if (p.length === 2) return p[0] + ' ' + p[1];
    return p.slice(0, 2).join(' ') + '.' + p[p.length - 1].charAt(0).toUpperCase();
  }

  const getMuridPerHalaman = () =>
    window.innerWidth <= 768 ? cfg.muridPerHalamanHP : cfg.muridPerHalamanDesktop;

  const isDesktop = () => window.innerWidth > 768;

  function initAOS() {
    if (typeof AOS === 'undefined') return;
    AOS.init({
      duration: 400,
      easing: 'ease-out',
      once: false,             // 🔥 animasi jalan terus
      mirror: true,            // 🔥 replay saat scroll balik
      offset: 60,
      disable: false           // 🔥 aktif di HP juga
    });
    setTimeout(() => AOS.refresh(), 200);
  }

  function renderAll() {
    const app = document.querySelector(cfg.container);
    if (!app) return;

    app.innerHTML = `
      ${renderHero()}
      <main class="main-content">
        ${renderTentang()}
        ${renderStruktur()}
        ${renderAnggotaSection()}
        ${renderMomenSection()}
        ${renderCTA()}
      </main>
      ${renderFooter()}
      ${renderLightbox()}
      ${renderMusicPlayer()}
    `;

    renderTentangSlideshow();
    renderAnggota();
    renderMomen();
    setSectionBackgrounds();
  }

  function renderHero() {
    const heroImg = cfg.heroImage
      ? `<img src="${cfg.heroImage}" alt="" class="hero-bg" onerror="this.style.display='none'">` : '';

    const logo = cfg.logoKelas
      ? `<img src="${cfg.logoKelas}" alt="" onerror="this.style.display='none'">`
      : `<span style="font-size:3rem;color:#1e3c72;">${cfg.namaKelas.charAt(0)}</span>`;

    return `
      <section class="hero">
        ${heroImg}
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <div class="hero-logo" data-aos="zoom-in" data-aos-duration="800">${logo}</div>
          <h1 data-aos="fade-up" data-aos-delay="150" data-aos-duration="800">${cfg.namaKelas}</h1>
          <p class="tagline" data-aos="fade-up" data-aos-delay="300" data-aos-duration="800">${cfg.tagline}</p>
        </div>
        <div class="scroll-indicator" onclick="document.getElementById('tentang').scrollIntoView({behavior:'smooth'})">⌄</div>
      </section>
    `;
  }

  function renderTentang() {
    const stats = (cfg.tentang.stats || []).map(s =>
      `<div class="stat-box"><h3>${s.angka}</h3><p>${s.label}</p></div>`
    ).join('');

    return `
      <section class="section tentang-section" id="tentang">
        <div class="tentang-slideshow" id="tentangSlideshow"></div>
        <div class="tentang-overlay"></div>
        <div class="tentang-content">
          <h2 class="section-heading tentang-heading" data-aos="fade-up">${cfg.tentang.judul}</h2>
          <p class="tentang-text" data-aos="fade-up" data-aos-delay="150">${cfg.tentang.deskripsi}</p>
          <div class="tentang-stats" data-aos="fade-up" data-aos-delay="250">${stats}</div>
        </div>
      </section>
    `;
  }

  function renderTentangSlideshow() {
    const el = document.getElementById('tentangSlideshow');
    if (!el || cfg.momen.length === 0) return;

    const momenTerbaru = cfg.momen.slice(-6);

    el.innerHTML = momenTerbaru.map((m, i) =>
      `<div class="tentang-slide ${i === 0 ? 'active' : ''}" style="background-image: url('img/${m.file}');"></div>`
    ).join('');

    let current = 0;
    const slides = el.querySelectorAll('.tentang-slide');

    setInterval(() => {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, cfg.slideshowInterval);
  }

  function strukturNode(item, extraClass = '') {
    if (!item) return '';
    const foto = `img/siswa/${item.username}.webp`;
    return `
      <div class="struktur-node ${extraClass}" data-aos="fade-up" data-aos-duration="400">
        <div class="struktur-foto-wrapper" onclick="Novastra.bukaFoto(event, '${foto}', '${item.nama}')">
          <div class="struktur-foto">
            <img src="${foto}" alt="" loading="lazy" onerror="this.style.display='none';">
          </div>
        </div>
        <div class="struktur-info">
          <span class="struktur-jabatan">${item.jabatan}</span>
          <h4 class="struktur-nama">${item.nama}</h4>
        </div>
      </div>
    `;
  }

  function renderStruktur() {
    const s = cfg.struktur;
    if (!s || (!s.ketua && !s.wakil)) return '';

    const wali = `
      <div class="struktur-node struktur-node-wali" data-aos="zoom-in" data-aos-duration="500">
        <div class="struktur-foto-wrapper" onclick="Novastra.bukaFoto(event, '${cfg.waliKelas.foto}', '${cfg.waliKelas.nama}')">
          <div class="struktur-foto">
            <img src="${cfg.waliKelas.foto}" alt="" onerror="this.style.display='none';">
          </div>
        </div>
        <div class="struktur-info">
          <span class="struktur-jabatan">WALI KELAS</span>
          <h4 class="struktur-nama">${cfg.waliKelas.nama}</h4>
        </div>
      </div>
    `;

    const sekretaris = (s.sekretaris || []).map(x => strukturNode(x)).join('');
    const bendahara = (s.bendahara || []).map(x => strukturNode(x)).join('');

    return `
      <section class="section" id="struktur">
        <h2 class="section-heading" data-aos="fade-up">Struktur Kelas</h2>
        <div class="divider" data-aos="fade-up" data-aos-delay="100"></div>

        <div class="struktur-chart" data-aos="fade-up" data-aos-delay="150">
          <div class="struktur-row struktur-row-top">${wali}</div>
          <div class="struktur-connector-v"></div>

          <div class="struktur-row struktur-row-mid">
            <div class="struktur-branch">
              ${strukturNode(s.ketua, 'struktur-node-ketua')}
              <div class="struktur-branch-line"></div>
            </div>
            <div class="struktur-branch">
              ${strukturNode(s.wakil, 'struktur-node-wakil')}
              <div class="struktur-branch-line"></div>
            </div>
          </div>

          <div class="struktur-connector-h"></div>

          <div class="struktur-row struktur-row-bot">
            <div class="struktur-group">
              <div class="struktur-group-label">SEKRETARIS</div>
              <div class="struktur-group-tree">
                <div class="struktur-tree-line-h"></div>
                <div class="struktur-tree-items">${sekretaris}</div>
              </div>
            </div>
            <div class="struktur-group">
              <div class="struktur-group-label">BENDAHARA</div>
              <div class="struktur-group-tree">
                <div class="struktur-tree-line-h"></div>
                <div class="struktur-tree-items">${bendahara}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderAnggotaSection() {
    return `
      <section class="section" id="anggota">
        <h2 class="section-heading" data-aos="fade-up">Anggota Kelas</h2>
        <div class="search-wrapper" data-aos="fade-up" data-aos-delay="100">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" id="searchInput" class="search-input" placeholder="Search..." autocomplete="off">
        </div>
        <div class="anggota-grid" id="anggotaGrid"></div>
        <div class="pagination" id="pagination"></div>
      </section>
    `;
  }

  function renderAnggota() {
    const grid = document.getElementById('anggotaGrid');
    if (!grid) return;

    let siswa = [...cfg.siswa].sort((a, b) =>
      namaDepan(a.nama).localeCompare(namaDepan(b.nama))
    );

    const kw = state.keywordSearch.trim().toLowerCase();
    if (kw !== '') {
      siswa = siswa.filter(s =>
        s.nama.toLowerCase().includes(kw) || s.username.toLowerCase().includes(kw)
      );
    }

    const pakaiPagination = kw === '';
    const totalHalaman = pakaiPagination ? Math.ceil(siswa.length / state.muridPerHalaman) : 1;

    let siswaHalaman;
    if (state.lihatSemua || !pakaiPagination) {
      siswaHalaman = siswa;
    } else {
      const start = (state.halamanSekarang - 1) * state.muridPerHalaman;
      siswaHalaman = siswa.slice(start, start + state.muridPerHalaman);
    }

    if (siswaHalaman.length === 0) {
      grid.innerHTML = `<div class="empty-result"><small>Student not found.</small></div>`;
      document.getElementById('pagination').innerHTML = '';
      return;
    }

    grid.innerHTML = siswaHalaman.map((s, i) => {
      const depan = namaPendek(s.nama);
      const foto = `img/siswa/${s.username}.webp`;
      const delay = (i % 6) * 50;

      return `
        <div class="anggota-card" data-aos="fade-up" data-aos-delay="${delay}" data-aos-duration="400">
          <div class="anggota-foto-wrapper" onclick="Novastra.bukaFoto(event, '${foto}', '${s.nama}')">
            <div class="anggota-foto">
              <img src="${foto}" alt="" loading="lazy" onerror="this.style.display='none';">
            </div>
          </div>
          <h4 class="anggota-nama">${depan}</h4>
          <p class="anggota-kelas">${cfg.namaKelas}</p>
          <a href="https://instagram.com/${s.instagram || s.username}" target="_blank"
            class="btn-follow-ig" onclick="event.stopPropagation()">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            Follow
          </a>
        </div>
      `;
    }).join('');

    const pagination = document.getElementById('pagination');

    if (state.lihatSemua) {
      pagination.innerHTML = '';
    } else if (isDesktop()) {
      pagination.innerHTML = `<button class="page-btn page-all" onclick="Novastra.lihatSemua()">Lihat Semua</button>`;
    } else if (pakaiPagination && totalHalaman > 1) {
      renderPagination(totalHalaman);
    } else {
      pagination.innerHTML = '';
    }

    if (typeof AOS !== 'undefined') AOS.refresh();
  }

  function renderPagination(totalHalaman) {
    const pagination = document.getElementById('pagination');
    if (!pagination || totalHalaman <= 1) {
      if (pagination) pagination.innerHTML = '';
      return;
    }

    let html = `<button class="page-btn page-nav" onclick="Novastra.gantiHalaman(${state.halamanSekarang - 1})"
      ${state.halamanSekarang === 1 ? 'disabled' : ''}>‹ Back</button>`;

    for (let i = 1; i <= totalHalaman; i++) {
      html += `<button class="page-btn ${i === state.halamanSekarang ? 'active' : ''}"
        onclick="Novastra.gantiHalaman(${i})">${i}</button>`;
    }

    html += `<button class="page-btn page-nav" onclick="Novastra.gantiHalaman(${state.halamanSekarang + 1})"
      ${state.halamanSekarang === totalHalaman ? 'disabled' : ''}>Next ›</button>`;

    pagination.innerHTML = html;
  }

  function gantiHalaman(nomor) {
    const total = Math.ceil(cfg.siswa.length / state.muridPerHalaman);
    if (nomor < 1 || nomor > total) return;

    state.halamanSekarang = nomor;
    state.lihatSemua = false;
    renderAnggota();
    document.getElementById('anggota').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function lihatSemua() {
    state.lihatSemua = true;
    renderAnggota();
  }

  function renderMomenSection() {
    return `
      <section class="section" id="momen">
        <h2 class="section-heading" data-aos="fade-up">Momen Bersama</h2>
        <div class="momen-grid" id="momenGrid"></div>
        <div class="pagination" id="momenPagination"></div>
      </section>
    `;
  }

  function renderMomen() {
    const grid = document.getElementById('momenGrid');
    if (!grid) return;

    const perHalaman = 6;
    const totalHalaman = Math.ceil(cfg.momen.length / perHalaman);

    const semuaMomen = [...cfg.momen].reverse();
    const start = (state.halamanMomen - 1) * perHalaman;
    const momenHalaman = semuaMomen.slice(start, start + perHalaman);

    grid.innerHTML = momenHalaman.map((m, i) => {
      const animasi = ['fade-up', 'zoom-in'][i % 2];
      const delay = (i % 6) * 60;
      return `
        <div class="momen-item" data-aos="${animasi}" data-aos-delay="${delay}" data-aos-duration="500"
          onclick="Novastra.bukaFoto(event, 'img/${m.file}', '')">
          <img src="img/${m.file}" alt="" loading="eager" onerror="this.style.display='none';">
        </div>
      `;
    }).join('');

    renderMomenPagination(totalHalaman);

    if (typeof AOS !== 'undefined') AOS.refresh();
  }

  function renderMomenPagination(totalHalaman) {
    const pag = document.getElementById('momenPagination');
    if (!pag) return;

    if (totalHalaman <= 1) {
      pag.innerHTML = '';
      return;
    }

    let html = `<button class="page-btn page-nav" onclick="Novastra.gantiHalamanMomen(${state.halamanMomen - 1})"
      ${state.halamanMomen === 1 ? 'disabled' : ''}>‹ Back</button>`;

    for (let i = 1; i <= totalHalaman; i++) {
      html += `<button class="page-btn ${i === state.halamanMomen ? 'active' : ''}"
        onclick="Novastra.gantiHalamanMomen(${i})">${i}</button>`;
    }

    html += `<button class="page-btn page-nav" onclick="Novastra.gantiHalamanMomen(${state.halamanMomen + 1})"
      ${state.halamanMomen === totalHalaman ? 'disabled' : ''}>Next ›</button>`;

    pag.innerHTML = html;
  }

  function gantiHalamanMomen(nomor) {
    const total = Math.ceil(cfg.momen.length / 6);
    if (nomor < 1 || nomor > total) return;

    state.halamanMomen = nomor;
    renderMomen();
    document.getElementById('momen').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderCTA() {
    return `
      <section class="section cta-section" id="about">
        <p class="cta-text" data-aos="fade-up">About?</p>
        <a href="https://instagram.com/${cfg.instagram}" target="_blank" class="btn-instagram"
          data-aos="zoom-in" data-aos-delay="150">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
          Instagram Kelas
        </a>
      </section>
    `;
  }

  const renderFooter = () => `<footer><p>© <strong>${cfg.namaKelas}</strong></p></footer>`;

  function renderLightbox() {
    return `
      <div class="lightbox" id="lightbox" onclick="Novastra.tutupFoto()">
        <span class="lightbox-close" onclick="Novastra.tutupFoto()">&times;</span>
        <img id="lightboxImg" src="" alt="" onclick="event.stopPropagation()">
        <p class="lightbox-caption" id="lightboxCaption"></p>
      </div>
    `;
  }

  function bukaFoto(event, src, namaLengkap) {
    if (event) event.stopPropagation();

    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const caption = document.getElementById('lightboxCaption');
    if (!lightbox || !img || !caption) return;

    img.src = src;
    img.alt = namaLengkap || '';

    if (namaLengkap && namaLengkap.trim() !== '') {
      caption.textContent = namaLengkap;
      caption.style.display = 'block';
    } else {
      caption.textContent = '';
      caption.style.display = 'none';
    }

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function tutupFoto() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderMusicPlayer() {
    if (!cfg.musik) return '';
    return `
      <audio id="bgMusic" loop><source src="${cfg.musik}" type="audio/mpeg"></audio>
      <button class="music-btn" id="musicBtn" onclick="Novastra.toggleMusic()" aria-label="Play music">
        <svg id="musicIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
          viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </button>
    `;
  }

  function toggleMusic() {
    const music = document.getElementById('bgMusic');
    const btn = document.getElementById('musicBtn');
    const icon = document.getElementById('musicIcon');
    if (!music || !btn || !icon) return;

    if (music.paused) {
      music.play();
      btn.classList.add('playing');
      icon.innerHTML = '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>';
    } else {
      music.pause();
      btn.classList.remove('playing');
      icon.innerHTML = '<path d="M8 5v14l11-7z"/>';
    }
  }

  function setSectionBackgrounds() {
    if (!cfg.backgroundSection) return;

    ['struktur', 'anggota', 'momen'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.backgroundImage = `url('${cfg.backgroundSection}')`;
    });

    const cta = document.querySelector('.cta-section');
    if (cta) cta.style.backgroundImage = `url('${cfg.backgroundSection}')`;
  }

  function setupSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;

    input.addEventListener('input', e => {
      state.keywordSearch = e.target.value;
      state.halamanSekarang = 1;
      state.lihatSemua = false;
      renderAnggota();
    });
  }

  function setupResize() {
    window.addEventListener('resize', () => {
      const baru = getMuridPerHalaman();
      if (baru !== state.muridPerHalaman) {
        state.muridPerHalaman = baru;
        state.halamanSekarang = 1;
        state.lihatSemua = false;
        renderAnggota();
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') tutupFoto();
    });
  }

  return {
    init,
    bukaFoto,
    tutupFoto,
    toggleMusic,
    gantiHalaman,
    gantiHalamanMomen,
    lihatSemua,
    renderAnggota,
    getConfig: () => cfg,
    getState: () => state
  };

})();