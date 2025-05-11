import AuthModel from '../models/AuthModel.js';

const LoginPresenter = {
    async login(email, password) {
        try {
            await AuthModel.login(email, password); // Token disimpan di AuthModel
            alert('✅ Login berhasil!');

            await this.subscribePushNotification(); // ✅ Push notification
            // location.hash = '#/';
        } catch (err) {
            alert(`❌ Login gagal: ${err.message}`);
        }
    },

    async subscribePushNotification() {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('🔕 Browser tidak mendukung push notification');
            return;
        }

        try {
            const reg = await navigator.serviceWorker.register('/sw.js');

            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(
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
            console.log('✅ Push berhasil disubscribe:', result);
            location.hash = '#/';
        } catch (error) {
            console.error('❌ Gagal subscribe push notification:', error.message);
            location.hash = '#/';
        }
    },

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = atob(base64);
        return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
    }
};

export default LoginPresenter;
