function renderAnggota() {
    const grid = document.getElementById('anggotaGrid');
    if (!grid) return;

    const siswa = [...appData.siswa].sort((a, b) =>
        namaDepan(a.nama).localeCompare(namaDepan(b.nama))
    );

    grid.innerHTML = siswa.map((s, i) => {
        const depan = namaDepan(s.nama);
        const inisial = depan.charAt(0).toUpperCase();
        const fotoPath = `img/siswa/${s.username}.jpg`;
        const delay = (i % 8) * 60;

        return `
            <div class="anggota-card"
                 data-aos="fade-up"
                 data-aos-delay="${delay}"
                 data-aos-duration="700">
                <img class="anggota-card-bg aktif" src="${fotoPath}" alt=""
                     onerror="this.classList.remove('aktif'); this.style.display='none';">

                <div class="anggota-foto-wrapper" onclick="bukaFoto(event, '${fotoPath}', '${s.nama}')">
                    <div class="anggota-foto">
                        <img src="${fotoPath}" alt="${depan}"
                             onerror="this.parentElement.innerHTML='${inisial}'; this.parentElement.onclick=null;">
                    </div>
                </div>
                <h4 class="anggota-nama">${depan}</h4>
                <p class="anggota-kelas">${s.kelas}</p>
                <a href="https://instagram.com/${s.instagram || s.username}" target="_blank"
                   class="btn-follow-ig" onclick="event.stopPropagation()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    Follow
                </a>
            </div>
        `;
    }).join('');
}

function bukaFoto(event, src, namaLengkap) {
    event.stopPropagation();
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const caption = document.getElementById('lightboxCaption');

    img.src = src;
    img.alt = namaLengkap;

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
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function toggleMusic() {
    const music = document.getElementById('bgMusic');
    const btn = document.getElementById('musicBtn');
    const icon = document.getElementById('musicIcon');

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

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') tutupFoto();
});

document.addEventListener('DOMContentLoaded', () => {
    renderAnggota();
    renderMomen();
    AOS.init({
        duration: 800,
        easing: 'ease-out',
        once: true,
        offset: 80,
        mirror: false
    });
    setTimeout(() => AOS.refresh(), 200);
});
