import UploadPresenter from '../presenters/UploadPresenter.js';

const UploadView = {
  async render(container) {

    const token = localStorage.getItem('token');
    if (!token) {
      container.innerHTML = `
        <section>
          <p style="color: red;">🚫 Anda harus login terlebih dahulu untuk mengunggah cerita.</p>
          <a href="#/login">➡️ Klik di sini untuk login</a>
        </section>
      `;
      return;
    }

    container.innerHTML = `
      <section>
        <button id="back-button" class="back-btn">⬅️ Kembali ke Daftar Cerita</button>

        <h2>📤 Upload Cerita</h2>
        <form id="upload-form">
          <div>
            <label for="description">Deskripsi:</label>
            <textarea id="description" required></textarea>
          </div>

          <div>
            <label for="file-upload">Atau Upload dari File:</label>
            <input type="file" id="file-upload" accept="image/*" />
          </div>

          <div>
            <label for="camera">Ambil Gambar dari Kamera:</label>
            <video id="camera" autoplay playsinline width="320" height="240" style="border-radius: 8px;"></video>
            <br />
            <button type="button" id="take-picture">📸 Ambil Foto</button>
            <canvas id="snapshot" width="320" height="240" style="display:none;"></canvas>
          </div>

          <div>
            <label for="preview">Preview Gambar:</label>
            <img id="preview-image" src="" alt="Preview Gambar" style="max-width: 100%; height: auto; margin-top: 1rem; display:none;" />
            <button type="button" id="clear-photo" style="display:none; margin-top: 0.5rem;">❌ Hapus Gambar</button>
          </div>

          <div>
            <label for="location">Pilih Lokasi:</label>
            <div id="map" style="height: 300px; margin-bottom: 1rem;"></div>
            <input type="hidden" id="lat">
            <input type="hidden" id="lon">
          </div>

          <button type="submit">Kirim Cerita</button>
        </form>
        <div id="result"></div>
      </section>
    `;

    UploadPresenter.initMap('map');

    // Variabel global kamera dan preview
    const video = document.getElementById('camera');
    const canvas = document.getElementById('snapshot');
    const ctx = canvas.getContext('2d');
    const preview = document.getElementById('preview-image');
    const clearBtn = document.getElementById('clear-photo');
    let currentPhotoBlob = null;
    let cameraStream = null;

    // 🔧 Fungsi untuk mematikan kamera
    function stopCamera() {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
        video.srcObject = null;
      }
    }

    // 🎥 Aktifkan kamera
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          cameraStream = stream;
          video.srcObject = stream;
        })
        .catch(err => {
          console.error('Gagal akses kamera:', err);
        });
    }

    // 📸 Ambil gambar dari kamera
    document.getElementById('take-picture').addEventListener('click', () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        currentPhotoBlob = blob;
        const previewUrl = URL.createObjectURL(blob);
        preview.src = previewUrl;
        preview.style.display = 'block';
        clearBtn.style.display = 'inline-block';
      }, 'image/jpeg');
    });

    // 📂 Upload dari file
    document.getElementById('file-upload').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        currentPhotoBlob = file;
        const previewUrl = URL.createObjectURL(file);
        preview.src = previewUrl;
        preview.style.display = 'block';
        clearBtn.style.display = 'inline-block';
      }
    });

    // ❌ Hapus gambar
    clearBtn.addEventListener('click', () => {
      currentPhotoBlob = null;
      preview.src = '';
      preview.style.display = 'none';
      clearBtn.style.display = 'none';
      document.getElementById('file-upload').value = '';
    });

    // 🔙 Tombol kembali
    document.getElementById('back-button').addEventListener('click', () => {
      stopCamera(); // ✅ matikan kamera
      location.hash = '#/';
    });

    // 📤 Submit form
    const form = document.getElementById('upload-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const description = document.getElementById('description').value;
      const lat = document.getElementById('lat').value;
      const lon = document.getElementById('lon').value;
      const resultEl = document.getElementById('result');

      const photo = currentPhotoBlob;

      if (!photo) {
        resultEl.textContent = '❌ Silakan ambil gambar dari kamera atau unggah file.';
        return;
      }

      try {
        await UploadPresenter.uploadStory(description, photo, lat, lon);
        resultEl.textContent = '✅ Cerita berhasil diunggah!';
        form.reset();
        preview.src = '';
        preview.style.display = 'none';
        clearBtn.style.display = 'none';
        currentPhotoBlob = null;
        stopCamera(); // ✅ matikan kamera setelah upload
      } catch (err) {
        resultEl.textContent = '❌ ' + err.message;
      }
    });

    // 🚫 Pastikan kamera dimatikan saat berpindah halaman
    window.addEventListener('beforeunload', stopCamera);
    window.addEventListener('hashchange', stopCamera);
  }
};

export default UploadView;
