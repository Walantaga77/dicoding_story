import UploadPresenter from '../presenters/UploadPresenter.js';

const GuestUploadView = {
  async render(container) {

    const storyId = params.get('id');
    const token = localStorage.getItem('token');

    if (!token || !storyId) {
      container.innerHTML = '<p style="color:red;">Data tidak lengkap. Silakan login dan pilih cerita.</p>';
      return;
    }
    container.innerHTML = `
      <section>
        <button id="back-button" class="back-btn">⬅️ Kembali ke Beranda</button>

        <h2>📤 Upload Cerita sebagai Tamu</h2>
        <form id="upload-form">
          <div>
            <label for="description">Deskripsi:</label>
            <textarea id="description" required></textarea>
          </div>

          <div>
            <label for="file-upload">Unggah dari File (maks 1MB):</label>
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
            <label for="location">Pilih Lokasi (opsional):</label>
            <div id="map" style="height: 300px; margin-bottom: 1rem;"></div>
            <input type="hidden" id="lat" />
            <input type="hidden" id="lon" />
          </div>

          <button type="submit">Kirim Cerita</button>
        </form>

        <div id="result"></div>
      </section>
    `;

    UploadPresenter.initMap('map');

    // Variabel kamera dan blob
    const video = document.getElementById('camera');
    const canvas = document.getElementById('snapshot');
    const ctx = canvas.getContext('2d');
    const preview = document.getElementById('preview-image');
    const clearBtn = document.getElementById('clear-photo');
    let currentPhotoBlob = null;
    let cameraStream = null;

    // Fungsi matikan kamera
    function stopCamera() {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
        video.srcObject = null;
      }
    }

    // Aktifkan kamera
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

    // Ambil foto dari kamera
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

    // Pilih dari file
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

    // Tombol hapus gambar
    clearBtn.addEventListener('click', () => {
      currentPhotoBlob = null;
      preview.src = '';
      preview.style.display = 'none';
      clearBtn.style.display = 'none';
      document.getElementById('file-upload').value = '';
    });

    // Tombol kembali
    document.getElementById('back-button').addEventListener('click', () => {
      stopCamera(); // ✅ matikan kamera saat kembali
      location.hash = '#/';
    });

    // Submit form
    const form = document.getElementById('upload-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const description = document.getElementById('description').value;
      const lat = document.getElementById('lat').value;
      const lon = document.getElementById('lon').value;
      const resultEl = document.getElementById('result');

      const photo = currentPhotoBlob;
      if (!photo) {
        resultEl.textContent = '❌ Silakan ambil gambar atau unggah dari file.';
        return;
      }

      if (photo.size > 1 * 1024 * 1024) {
        resultEl.textContent = '❌ Ukuran gambar maksimal 1MB.';
        return;
      }

      try {
        await UploadPresenter.uploadGuestStory(description, photo, lat, lon);
        resultEl.textContent = '✅ Cerita berhasil diunggah sebagai tamu!';
        alert('✅ Cerita berhasil diunggah sebagai tamu!'); // ← ✅ Tambahkan ini

        form.reset();
        preview.src = '';
        preview.style.display = 'none';
        clearBtn.style.display = 'none';
        currentPhotoBlob = null;
        stopCamera();
      } catch (err) {
        resultEl.textContent = '❌ ' + err.message;
      }

    });

    // Tambahan: kamera berhenti saat berpindah halaman
    window.addEventListener('beforeunload', stopCamera);
    window.addEventListener('hashchange', stopCamera);
  }
};

export default GuestUploadView;
