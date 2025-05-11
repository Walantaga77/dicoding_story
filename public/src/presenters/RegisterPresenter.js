import AuthModel from '../models/AuthModel.js';

const RegisterPresenter = {
    async register(name, email, password) {
        try {
            await AuthModel.register(name, email, password);
            alert('Register berhasil! Silakan login.');
            location.hash = '#/login';
        } catch (err) {
            alert(`Gagal register: ${err.message}`);
        }
    },
};

export default RegisterPresenter;
