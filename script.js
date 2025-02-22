// Simpan sesi log masuk dalam localStorage
let loggedInUser = localStorage.getItem('user_id');

// Log masuk
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const user_id = document.getElementById('user_id').value;
    const password = document.getElementById('password').value;
    const loginError = document.getElementById('loginError');

    if (user_id === 'admin' && password === 'pass123') {
        localStorage.setItem('user_id', 'admin');
        window.location.href = 'dashboard.html';
    } else {
        loginError.textContent = 'ID Pengguna atau Kata Laluan salah.';
    }
});

// Muat pelajar di dashboard
function loadPelajar() {
    fetch('data/pelajar.json')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#pelajarTable tbody');
            tbody.innerHTML = '';
            data.forEach((pelajar, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${pelajar.nama}</td>
                    <td>${pelajar.no_kp}</td>
                    <td>${pelajar.a_giliran || '-'}</td>
                    <td>${pelajar.kelas}</td>
                    <td>${pelajar.jantina === 'L' ? 'Lelaki' : 'Perempuan'}</td>
                    <td><input type="number" class="form-control ujian" data-id="${pelajar.id}" value="${pelajar.ujian}" min="0" max="30" step="0.1"></td>
                    <td><input type="number" class="form-control amali_larian" data-id="${pelajar.id}" value="${pelajar.amali_larian}" min="0" max="25" step="0.1"></td>
                    <td><input type="number" class="form-control amali_lontaran" data-id="${pelajar.id}" value="${pelajar.amali_lontaran}" min="0" max="25" step="0.1"></td>
                    <td>${pelajar.hp3}</td>
                    <td><input type="number" class="form-control penyediaan_trek" data-id="${pelajar.id}" value="${pelajar.penyediaan_trek}" min="0" max="10" step="0.1"></td>
                    <td><input type="number" class="form-control penyediaan_sektor" data-id="${pelajar.id}" value="${pelajar.penyediaan_sektor}" min="0" max="10" step="0.1"></td>
                    <td>${pelajar.hp7}</td>
                    <td>${pelajar.jumlah}</td>
                    <td>${pelajar.gred}</td>
                `;
                tbody.appendChild(row);
            });

            // Tambah event listener untuk pengeditan markah
            document.querySelectorAll('.ujian, .amali_larian, .amali_lontaran, .penyediaan_trek, .penyediaan_sektor').forEach(input => {
                input.addEventListener('change', (e) => {
                    const id = e.target.dataset.id;
                    const field = e.target.className.split(' ')[0];
                    const value = parseFloat(e.target.value) || 0;

                    updateMarkah(id, field, value);
                });
            });
        })
        .catch(error => console.error('Ralat memuatkan data:', error));
}

// Kemaskini markah dan hitung semula
function updateMarkah(id, field, value) {
    fetch('data/pelajar.json')
        .then(response => response.json())
        .then(data => {
            const pelajar = data.find(p => p.id == id);
            if (pelajar) {
                pelajar[field] = value;
                pelajar.hp3 = (pelajar.amali_larian || 0) + (pelajar.amali_lontaran || 0);
                pelajar.hp7 = (pelajar.penyediaan_trek || 0) + (pelajar.penyediaan_sektor || 0);
                pelajar.jumlah = (pelajar.ujian || 0) + pelajar.hp3 + pelajar.hp7;
                pelajar.gred = getGred(pelajar.jumlah);

                // Simpan semula ke JSON (dalam aplikasi statik, kita hanya simpan di localStorage untuk simulasi)
                localStorage.setItem('pelajarData', JSON.stringify(data));
                saveToJson(data); // Simpan ke fail JSON (jika anda mahu menyimpan secara manual)
                loadPelajar(); // Muat semula data untuk paparan terkini
            }
        })
        .catch(error => console.error('Ralat mengemaskini data:', error));
}

// Fungsi untuk menetapkan gred
function getGred(markah) {
    if (markah >= 90) return 'A+';
    if (markah >= 80) return 'A';
    if (markah >= 75) return 'A-';
    if (markah >= 70) return 'B+';
    if (markah >= 65) return 'B';
    if (markah >= 60) return 'B-';
    if (markah >= 55) return 'C+';
    if (markah >= 50) return 'C';
    if (markah >= 40) return 'C-';
    if (markah >= 30) return 'D+';
    if (markah >= 20) return 'D';
    return 'F';
}

// Simpan ke fail JSON (untuk simulasi, kita gunakan localStorage)
function saveToJson(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pelajar.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Log keluar
function logout() {
    localStorage.removeItem('user_id');
    window.location.href = 'index.html';
}

// Muat pelajar apabila dashboard dimuat
if (document.querySelector('#pelajarTable')) {
    if (!loggedInUser) {
        window.location.href = 'index.html';
    } else {
        loadPelajar();
    }
}
