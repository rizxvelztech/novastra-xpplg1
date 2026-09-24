const Novastra = (function() {

    let cfg = {};
    let state = {
        halamanSekarang: 1,
        keywordSearch: '',
        muridPerHalaman: 6
    };

    function init(userConfig) {
        cfg = Object.assign({
            container: '#app',
            namaKelas: 'Kelas',
            tagline: 'One Class · One Memory · One Bond',
            heroImage: '',
            logoKelas: '',
            backgroundSection: '',
            musik: '',
            tentang: { judul: 'Tentang Kelas', deskripsi: '', stats: [] },
            waliKelas: { nama: '-', jabatan: '-', foto: '' },
            siswa: [],
            momen: [],
            instagram: '',
            muridPerHalamanHP: 6,
            slideshowInterval: 4000
        }, userConfig);

        state.muridPerHalaman = getMuridPerHalaman();

        renderAll();
        setupSearch();
        setupResize();
        initAOS();
    }

    function namaDepan(nama) {
        return nama.split(' ')[0];
    }

    function getMuridPerHalaman() {
        return window.innerWidth <= 768 ? cfg.muridPerHalamanHP : 9999;
    }

    function initAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 400,
                easing: 'ease-out',
                once: true,
                offset: 40,
                mirror: false
            });
            setTimeout(() => AOS.refresh(), 200);
        }
    }

    function renderAll() {
        const app = document.querySelector(cfg.container);
        if (!app) return;

        app.innerHTML = `
            ${renderHero()}
            <main class="main-content">
                ${renderTentang()}
                ${renderWali()}
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
            ? `<img src="${cfg.heroImage}" alt="Hero" class="hero-bg" onerror="this.style.display='none'">`
            : '';
        const logo = cfg.logoKelas
            ? `<img src="${cfg.logoKelas}" alt="Logo" onerror="this.style.display='none'">`
            : `<span style="font-size:3rem;color:#1e3c72;">${cfg.namaKelas.charAt(0)}</span>`;

        return `
            <section class="hero">
                ${heroImg}
                <div class="hero-overlay"></div>
                <div class="hero-content">
                    <div class="hero-logo" data-aos="zoom-in" data-aos-duration="1000">
                        ${logo}
                    </div>
                    <h1 data-aos="fade-up" data-aos-delay="200" data-aos-duration="1000">
                        ${cfg.namaKelas}
                    </h1>
                    <p class="tagline" data-aos="fade-up" data-aos-delay="400" data-aos-duration="1000">
                        ${cfg.tagline}
                    </p>
                </div>
                <div class="scroll-indicator" onclick="document.getElementById('tentang').scrollIntoView({behavior:'smooth'})">⌄</div>
            </section>
        `;
    }

    function renderTentang() {
        const stats = (cfg.tentang.stats || []).map(s => `
            <div class="stat-box">
                <h3>${s.angka}</h3>
                <p>${s.label}</p>
            </div>
        `).join('');

        return `
            <section class="section tentang-section" id="tentang">
                <div class="tentang-slideshow" id="tentangSlideshow"></div>
                <div class="tentang-overlay"></div>
                <div class="tentang-content">
                    <h2 class="section-heading tentang-heading" data-aos="fade-up">
                        ${cfg.tentang.judul}
                    </h2>
                    <p class="tentang-text" data-aos="fade-up" data-aos-delay="200">
                        ${cfg.tentang.deskripsi}
                    </p>
                    <div class="tentang-stats" data-aos="fade-up" data-aos-delay="300">
                        ${stats}
                    </div>
                </div>
            </section>
        `;
    }

    function renderTentangSlideshow() {
        const el = document.getElementById('tentangSlideshow');
        if (!el || cfg.momen.length === 0) return;

        el.innerHTML = cfg.momen.map((m, i) => `
            <div class="tentang-slide ${i === 0 ? 'active' : ''}"
                 style="background-image: url('img/${m.file}');"></div>
        `).join('');

        let current = 0;
        const slides = el.querySelectorAll('.tentang-slide');

        setInterval(() => {
            slides[current].classList.remove('active');
            current = (current + 1) % slides.length;
            slides[current].classList.add('active');
        }, cfg.slideshowInterval);
    }

    function renderWali() {
        return `
            <section class="section" id="wali">
                <h2 class="section-heading" data-aos="fade-up">Wali Kelas</h2>
                <div class="divider" data-aos="fade-up" data-aos-delay="100"></div>
                <div class="wali-card" data-aos="zoom-in" data-aos-delay="200">
                    <div class="wali-foto-wrapper"
                         onclick="Novastra.bukaFoto(event, '${cfg.waliKelas.foto}', '${cfg.waliKelas.nama}')">
                        <div class="wali-foto">
                            <img src="${cfg.waliKelas.foto}" alt="Wali Kelas"
                                 onerror="this.parentElement.innerHTML=''; this.parentElement.onclick=null;">
                        </div>
                    </div>
                    <h3>${cfg.waliKelas.nama}</h3>
                    <p class="wali-jabatan">${cfg.waliKelas.jabatan}</p>
                </div>
            </section>
        `;
    }

    function renderAnggotaSection() {
        return `
            <section class="section" id="anggota">
                <h2 class="section-heading" data-aos="fade-up">Anggota Kelas</h2>
                <div class="search-wrapper" data-aos="fade-up" data-aos-delay="150">
                    <svg class="search-icon" xmlns="http://www.w3.org/2000/svg"
                         width="18" height="18" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" id="searchInput" class="search-input"
                           placeholder="Cari nama murid..." autocomplete="off">
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

        if (state.keywordSearch.trim() !== '') {
            const kw = state.keywordSearch.toLowerCase();
            siswa = siswa.filter(s =>
                s.nama.toLowerCase().includes(kw) ||
                s.username.toLowerCase().includes(kw)
            );
        }

        const pakaiPagination = state.keywordSearch.trim() === '';
        const totalHalaman = pakaiPagination
            ? Math.ceil(siswa.length / state.muridPerHalaman)
            : 1;

        let siswaHalaman;
        if (pakaiPagination) {
            const start = (state.halamanSekarang - 1) * state.muridPerHalaman;
            siswaHalaman = siswa.slice(start, start + state.muridPerHalaman);
        } else {
            siswaHalaman = siswa;
        }

        if (siswaHalaman.length === 0) {
            grid.innerHTML = `<div class="empty-result"><small>Student not found.</small></div>`;
            document.getElementById('pagination').innerHTML = '';
            return;
        }

        grid.innerHTML = siswaHalaman.map((s, i) => {
            const depan = namaDepan(s.nama);
            const fotoPath = `img/siswa/${s.username}.jpg`;
            const delay = (i % 8) * 30;

            return `
                <div class="anggota-card"
                     data-aos="fade-up"
                     data-aos-delay="${delay}"
                     data-aos-duration="500">
                    <div class="anggota-foto-wrapper"
                         onclick="Novastra.bukaFoto(event, '${fotoPath}', '${s.nama}')">
                        <div class="anggota-foto">
                            <img src="${fotoPath}" alt="${depan}" loading="lazy"
                                 onerror="this.style.display='none'; this.parentElement.innerHTML=''; this.parentElement.onclick=null;">
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

        if (pakaiPagination) {
            renderPagination(totalHalaman);
        } else {
            document.getElementById('pagination').innerHTML = '';
        }

        setTimeout(() => AOS.refresh(), 100);
    }

    function renderPagination(totalHalaman) {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        if (totalHalaman <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let html = '';
        html += `<button class="page-btn page-nav" onclick="Novastra.gantiHalaman(${state.halamanSekarang - 1})"
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
        const totalHalaman = Math.ceil(cfg.siswa.length / state.muridPerHalaman);
        if (nomor < 1 || nomor > totalHalaman) return;

        state.halamanSekarang = nomor;
        renderAnggota();
        document.getElementById('anggota').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderMomenSection() {
        return `
            <section class="section" id="momen">
                <h2 class="section-heading" data-aos="fade-up">Momen Bersama</h2>
                <div class="momen-grid" id="momenGrid"></div>
            </section>
        `;
    }

    function renderMomen() {
        const grid = document.getElementById('momenGrid');
        if (!grid) return;

        grid.innerHTML = cfg.momen.map((m, i) => {
            const animasi = ['fade-up', 'zoom-in'][i % 2];
            const delay = (i % 6) * 80;

            return `
                <div class="momen-item"
                     data-aos="${animasi}"
                     data-aos-delay="${delay}"
                     data-aos-duration="800"
                     onclick="Novastra.bukaFoto(event, 'img/${m.file}', '')">
                    <img src="img/${m.file}" alt="Momen" loading="lazy"
                         onerror="this.style.display='none';">
                </div>
            `;
        }).join('');
    }

    function renderCTA() {
        return `
            <section class="section cta-section">
                <p class="cta-text" data-aos="fade-up">About?</p>
                <a href="https://instagram.com/${cfg.instagram}" target="_blank"
                   class="btn-instagram"
                   data-aos="zoom-in" data-aos-delay="200">
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

    function renderFooter() {
        return `
            <footer>
                <p>© <strong>${cfg.namaKelas}</strong></p>
            </footer>
        `;
    }

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
            <audio id="bgMusic" loop>
                <source src="${cfg.musik}" type="audio/mpeg">
            </audio>
            <button class="music-btn" id="musicBtn" onclick="Novastra.toggleMusic()" aria-label="Play music">
                <svg id="musicIcon" xmlns="http://www.w3.org/2000/svg"
                     width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                </svg>
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
        ['wali', 'anggota', 'momen'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.backgroundImage = `url('${cfg.backgroundSection}')`;
        });
        const cta = document.querySelector('.cta-section');
        if (cta) cta.style.backgroundImage = `url('${cfg.backgroundSection}')`;
    }

    function setupSearch() {
        const input = document.getElementById('searchInput');
        if (!input) return;

        input.addEventListener('input', (e) => {
            state.keywordSearch = e.target.value;
            state.halamanSekarang = 1;
            renderAnggota();
        });
    }

    function setupResize() {
        window.addEventListener('resize', () => {
            const baru = getMuridPerHalaman();
            if (baru !== state.muridPerHalaman) {
                state.muridPerHalaman = baru;
                state.halamanSekarang = 1;
                renderAnggota();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') tutupFoto();
        });
    }

    return {
        init,
        bukaFoto,
        tutupFoto,
        toggleMusic,
        gantiHalaman,
        renderAnggota,
        getConfig: () => cfg,
        getState: () => state
    };

})();