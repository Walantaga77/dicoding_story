import RegisterPresenter from '../presenters/RegisterPresenter.js';

const RegisterView = {
  render(container) {
    container.innerHTML = `
      <section class="auth-box">
        <h2>Register</h2>
        <form id="register-form">
          <div class="form-group">
            <label for="name">👤 Nama Lengkap:</label>
            <input type="text" id="name" name="name" required />
          </div>
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit" class="auth-btn">Register</button>
        </form>
        <p class="auth-toggle">Sudah punya akun? <a href="#/login">Login di sini</a></p>
      </section>
    `;

    const form = container.querySelector('#register-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.value;
      const email = form.email.value;
      const password = form.password.value;
      RegisterPresenter.register(name, email, password);
    });
  },
};

export default RegisterView;
