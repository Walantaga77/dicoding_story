const UploadModel = {
    async upload(formData) {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token tidak ditemukan.');

        const res = await fetch('https://story-api.dicoding.dev/v1/stories', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        return data;
    }
};

export default UploadModel;
