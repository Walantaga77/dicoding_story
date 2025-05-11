import { StoryDB } from '../utils/db.js';

const StoriesView = {
  currentPage: 1,
  pageSize: 10,

  async render(container) {
    const token = localStorage.getItem('token');

    if (!token) {
      container.innerHTML = '<p style="color:red;">Data tidak lengkap. Silakan login dan pilih cerita.</p>';
      return;
    }
    container.innerHTML = `
      <section>
        <h2>📚 Semua Postingan</h2>
        <div id="stories-container">Memuat cerita...</div>
        <div id="pagination-controls" style="margin-top: 1rem; display: flex; gap: 1rem;">
          <button id="prev-btn">⬅️ Sebelumnya</button>
          <button id="next-btn">Selanjutnya ➡️</button>
        </div>
        <div style="margin-top: 1rem;">
          <button button id="clear-cache-btn">🗑️ Hapus Cerita Tersimpan (Offline)</button>
        </div>
      </section>
    `;

    document.getElementById('clear-cache-btn').addEventListener('click', async () => {
      const confirmDelete = confirm('Yakin ingin menghapus semua data cerita tersimpan secara offline?');
      if (confirmDelete) {
        const { default: db } = await import('../utils/db.js');
        await db.clear('stories');
        alert('✅ Cache cerita berhasil dihapus!');
      }
    });


    document.getElementById('prev-btn').addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadStories();
      }
    });

    document.getElementById('next-btn').addEventListener('click', () => {
      this.currentPage++;
      this.loadStories();
    });

    this.loadStories();
  },

  async loadStories() {
    const storiesContainer = document.getElementById('stories-container');
    storiesContainer.innerHTML = 'Memuat...';

    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const res = await fetch(`https://story-api.dicoding.dev/v1/stories?page=${this.currentPage}&size=${this.pageSize}&location=0`, {
        headers,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // ✅ Simpan data ke IndexedDB
      await StoryDB.saveStories(data.listStory);
      this.displayStories(data.listStory);
    } catch (err) {
      console.warn('🌐 Offline, menggunakan cache lokal:', err.message);
      const localStories = await StoryDB.getAllStories();
      if (localStories.length > 0) {
        this.displayStories(localStories);
      } else {
        storiesContainer.innerHTML = '<p style="color: red;">Gagal memuat cerita dan tidak ada cache.</p>';
      }
    }
  },

  displayStories(stories) {
    const storiesContainer = document.getElementById('stories-container');
    storiesContainer.innerHTML = '';

    if (stories.length === 0) {
      storiesContainer.innerHTML = '<p>Tidak ada cerita ditemukan.</p>';
      return;
    }

    stories.forEach((story) => {
      const card = document.createElement('div');
      card.className = 'story-card';
      card.innerHTML = `
        <div class="story-card-content">
          <img src="${story.photoUrl}" alt="Foto oleh ${story.name}" class="story-image" />
          <div class="story-info">
            <h3>${story.name}</h3>
            <p>${story.description}</p>
            <small><em>${new Date(story.createdAt).toLocaleString()}</em></small>
            <a href="#/detail?id=${story.id}" class="detail-link">Lihat Detail ➜</a>
          </div>
        </div>
      `;
      storiesContainer.appendChild(card);
    });

    document.getElementById('prev-btn').disabled = this.currentPage === 1;
    document.getElementById('next-btn').disabled = stories.length < this.pageSize;
  }
};

export default StoriesView;
