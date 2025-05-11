const DetailView = {
    async render(container) {
        const params = new URLSearchParams(window.location.hash.split('?')[1]);
        const storyId = params.get('id');
        const token = localStorage.getItem('token');

        if (!token || !storyId) {
            container.innerHTML = '<p style="color:red;">Data tidak lengkap. Silakan login dan pilih cerita.</p>';
            return;
        }

        container.innerHTML = '<p>Memuat detail cerita...</p>';

        try {
            const res = await fetch(`https://story-api.dicoding.dev/v1/stories/${storyId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            const story = data.story;

            container.innerHTML = `
  <section class="detail-story">
    <button id="back-to-stories" class="back-btn">⬅️ Kembali ke Daftar Cerita</button>

    <div class="detail-content">
      <img src="${story.photoUrl}" alt="Foto oleh ${story.name}" class="detail-image" />
      <div class="detail-text">
        <h2>${story.name}</h2>
        <p><strong>Deskripsi:</strong> ${story.description}</p>
        <p><strong>Dibuat:</strong> ${new Date(story.createdAt).toLocaleString()}</p>
        <p><strong>Lokasi:</strong> ${story.lat ?? '–'}, ${story.lon ?? '–'}</p>
      </div>
    </div>

    <div id="map" style="height: 300px; margin-top: 1rem;"></div>
  </section>
`;


            document.getElementById('back-to-stories').addEventListener('click', () => {
                location.hash = '#/stories';
            });

            // 🌍 Inisialisasi peta dengan beberapa tile layer
            if (story.lat && story.lon) {
                const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                });

                const carto = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; CartoDB',
                });

                const maptilerKey = 'YOUR_MAPTILER_API_KEY'; // ← ganti dengan milikmu
                const dark = L.tileLayer(`https://api.maptiler.com/maps/darkmatter/{z}/{x}/{y}.png?key=${maptilerKey}`, {
                    attribution: '&copy; MapTiler',
                });

                const map = L.map('map', {
                    center: [story.lat, story.lon],
                    zoom: 13,
                    layers: [osm],
                });

                const baseLayers = {
                    'OpenStreetMap': osm,
                    'CartoDB Positron': carto,
                };

                L.control.layers(baseLayers).addTo(map);

                L.marker([story.lat, story.lon])
                    .addTo(map)
                    .bindPopup(`<b>${story.name}</b><br>${story.description}`)
                    .openPopup();
            }

        } catch (err) {
            container.innerHTML = `<p style="color:red;">Gagal memuat detail cerita: ${err.message}</p>`;
        }
    }
};

export default DetailView;
