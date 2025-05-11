const UploadPresenter = {
    map: null,
    marker: null,

    initMap(mapId) {
        const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
        });

        const carto = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CartoDB',
        });

        const maptilerKey = 'YOUR_MAPTILER_API_KEY'; // ← ganti dengan key kamu
        const maptilerDark = L.tileLayer(`https://api.maptiler.com/maps/darkmatter/{z}/{x}/{y}.png?key=${maptilerKey}`, {
            attribution: '&copy; MapTiler',
        });

        this.map = L.map(mapId, {
            center: [-6.2, 106.8],
            zoom: 5,
            layers: [osm], // default
        });

        const baseLayers = {
            'OpenStreetMap': osm,
            'CartoDB Positron': carto,
            'MapTiler Dark': maptilerDark,
        };

        L.control.layers(baseLayers).addTo(this.map);

        this.map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            if (this.marker) {
                this.marker.setLatLng([lat, lng]);
            } else {
                this.marker = L.marker([lat, lng]).addTo(this.map);
            }

            document.getElementById('lat').value = lat;
            document.getElementById('lon').value = lng;
        });
    },

    async uploadStory(description, photo, lat, lon) {
        const formData = new FormData();
        formData.append('description', description);
        formData.append('photo', photo);
        if (lat) formData.append('lat', lat);
        if (lon) formData.append('lon', lon);

        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token tidak ditemukan. Harap login ulang.');

        const res = await fetch('https://story-api.dicoding.dev/v1/stories', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData,
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        return result;
    },

    async uploadGuestStory(description, photo, lat, lon) {
        const formData = new FormData();
        formData.append('description', description);
        formData.append('photo', photo);
        if (lat) formData.append('lat', lat);
        if (lon) formData.append('lon', lon);

        const res = await fetch('https://story-api.dicoding.dev/v1/stories/guest', {
            method: 'POST',
            body: formData,
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        return result;
    }

};

export default UploadPresenter;
