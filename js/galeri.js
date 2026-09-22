const daftarMomen = [
    { file: 'momen_1.jpg' },
    { file: 'momen_2.jpg' },
    { file: 'momen_3.jpg' },
    { file: 'momen_4.jpg' },
];

function renderMomen() {
    const grid = document.getElementById('momenGrid');
    if (!grid) return;

    grid.innerHTML = daftarMomen.map((m, i) => {
        const animasi = ['fade-up', 'zoom-in'][i % 2];
        const delay = (i % 6) * 80;

        return `
            <div class="momen-item"
                 data-aos="${animasi}"
                 data-aos-delay="${delay}"
                 data-aos-duration="800"
                 onclick="bukaFoto(event, 'img/${m.file}', '')">
                <img src="img/${m.file}" alt="Momen"
                     onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22><rect fill=%22%23eee%22 width=%22400%22 height=%22300%22/><text x=%22200%22 y=%22155%22 font-size=%2218%22 fill=%22%23999%22 text-anchor=%22middle%22>Foto tidak tersedia</text></svg>'">
            </div>
        `;
    }).join('');
}