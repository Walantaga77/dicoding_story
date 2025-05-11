const BASE_URL = 'https://story-api.dicoding.dev/v1';

const AuthModel = {
    async login(email, password) {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        localStorage.setItem('token', data.loginResult.token);
        return data.loginResult;
    },

    async register(name, email, password) {
        const res = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        return data;
    },
};

export default AuthModel;
