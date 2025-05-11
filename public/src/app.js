import routes from './router/routes.js';

function renderWithTransition(callback) {
    if (document.startViewTransition) {
        document.startViewTransition(callback);
    } else {
        callback();
    }
}

function route() {
    const app = document.getElementById('app');
    let hash = window.location.hash || '#/';
    const path = hash.split('?')[0];

    const token = localStorage.getItem('token');
    const protectedRoutes = ['#/upload', '#/detail', '#/notifications'];

    if (!token && protectedRoutes.some(route => path.startsWith(route))) {
        location.hash = '#/login';
        return;
    }

    const View = routes[path] || routes['#/login'];

    renderWithTransition(() => {
        app.innerHTML = '';
        View.render(app);
        console.log('✅ View rendered with transition');
        updateNavVisibility();
    });
}

function updateNavVisibility() {
    const isLoggedIn = !!localStorage.getItem('token');

    document.querySelectorAll('.nav-auth').forEach(el => {
        el.style.display = isLoggedIn ? 'inline' : 'none';
    });

    document.querySelectorAll('.nav-guest').forEach(el => {
        el.style.display = isLoggedIn ? 'none' : 'inline';
    });
}

function setupSkipLink() {
    document.querySelector('.skip-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        const main = document.getElementById('main-content');
        if (main) main.focus();
    });
}

// Logout global
window.logout = function () {
    if (confirm('Yakin ingin logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('name');
        updateNavVisibility();
        location.hash = '#/login';
    }
};

// Push Notification Subscription
async function subscribePushNotification() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('🔕 Push notification tidak didukung di browser ini.');
        return;
    }

    try {
        // 🔧 Sesuaikan path berdasarkan lokasi file saat ini (src ➜ ../sw.js)
        const reg = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker terdaftar:', reg);

        const subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
                'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'
            ),
        });

        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        console.log('✅ Push Notification berhasil disubscribe:', result);
    } catch (err) {
        console.error('❌ Gagal register push notification:', err.message);
    }
}

// Helper konversi VAPID key
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}

// Inisialisasi
window.addEventListener('DOMContentLoaded', () => {
    updateNavVisibility();
    route();
    setupSkipLink();
});

window.addEventListener('hashchange', route);

// Ekspor fungsi jika dibutuhkan di tempat lain
window.subscribePushNotification = subscribePushNotification;
