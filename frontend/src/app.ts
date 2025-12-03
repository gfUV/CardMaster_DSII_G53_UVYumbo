import { api, type User } from './api';

class App {
  private token: string | null = localStorage.getItem('token');
  private user: User | null = null;

  constructor() {
    this.init();
  }

  private init() {
    this.render();
    if (this.token) {
      this.loadProfile();
    }
  }

  private render() {
    const app = document.querySelector<HTMLDivElement>('#app')!;
    app.innerHTML = `
      <header>
        <h1>CardMaster</h1>
        <p>Tu gestor de cuentas de usuario</p>
      </header>
      <nav>
        <button id="home">Inicio</button>
        ${!this.token ? '<button id="login">Iniciar Sesión</button><button id="register">Registrarse</button>' : '<button id="profile">Perfil</button><button id="logout">Cerrar Sesión</button>'}
      </nav>
      <main id="content"></main>
    `;
    this.bindEvents();
    this.showHome();
  }

  private bindEvents() {
    document.getElementById('home')?.addEventListener('click', () => this.showHome());
    document.getElementById('login')?.addEventListener('click', () => this.showLogin());
    document.getElementById('register')?.addEventListener('click', () => this.showRegister());
    document.getElementById('profile')?.addEventListener('click', () => this.showProfile());
    document.getElementById('logout')?.addEventListener('click', () => this.logout());
  }

  private showHome() {
    const content = document.getElementById('content')!;
    content.innerHTML = `
      <section class="welcome">
        <h2>Bienvenido</h2>
        <p>Gestiona tu cuenta de usuario de manera segura y fácil.</p>
        <p>¡Explora las funciones disponibles!</p>
      </section>
    `;
  }

  private showLogin() {
    const content = document.getElementById('content')!;
    content.innerHTML = `
      <section class="auth-section">
        <h2>Iniciar Sesión</h2>
        <form id="loginForm">
          <input type="email" id="loginEmail" placeholder="Correo electrónico" required>
          <input type="password" id="loginPassword" placeholder="Contraseña" required>
          <button type="submit">Iniciar Sesión</button>
        </form>
        <div id="loginMessage" class="message"></div>
      </section>
    `;
    document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
  }

  private showRegister() {
    const content = document.getElementById('content')!;
    content.innerHTML = `
      <section class="auth-section">
        <h2>Registrarse</h2>
        <form id="registerForm">
          <input type="text" id="regUsername" placeholder="Nombre de usuario" required>
          <input type="email" id="regEmail" placeholder="Correo electrónico" required>
          <input type="password" id="regPassword" placeholder="Contraseña" required>
          <input type="password" id="regConfirmPassword" placeholder="Rectificar contraseña" required>
          <input type="date" id="regDateOfBirth" placeholder="Fecha de nacimiento">
          <button type="submit">Registrarse</button>
        </form>
        <div id="registerMessage" class="message"></div>
      </section>
    `;
    document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));
  }

  private showProfile() {
    if (!this.user) return;
    const content = document.getElementById('content')!;
    content.innerHTML = `
      <section class="profile-section">
        <h2>Perfil de Usuario</h2>
        <div class="user-info">
          <p><strong>Nombre de usuario:</strong> ${this.user.username}</p>
        </div>
        <form id="profileForm">
          <input type="email" id="email" placeholder="Correo electrónico" value="${this.user.email}" required>
          <input type="date" id="dateOfBirth" placeholder="Fecha de nacimiento" value="${this.user.profile?.dateOfBirth ? this.user.profile.dateOfBirth.split('T')[0] : ''}">
          <input type="text" id="firstName" placeholder="Nombre" value="${this.user.profile?.firstName || ''}">
          <input type="text" id="lastName" placeholder="Apellido" value="${this.user.profile?.lastName || ''}">
          <textarea id="bio" placeholder="Biografía">${this.user.profile?.bio || ''}</textarea>
          <button type="submit">Actualizar Perfil</button>
        </form>
        <div id="profileMessage" class="message"></div>
      </section>
    `;
    document.getElementById('profileForm')?.addEventListener('submit', (e) => this.handleUpdateProfile(e));
  }

  private async handleLogin(e: Event) {
    e.preventDefault();
    const email = (document.getElementById('loginEmail') as HTMLInputElement).value;
    const password = (document.getElementById('loginPassword') as HTMLInputElement).value;
    const messageEl = document.getElementById('loginMessage')!;
    try {
      const response = await api.login(email, password);
      this.token = response.token;
      this.user = response.user;
      localStorage.setItem('token', this.token);
      this.render();
      this.showHome();
    } catch (error) {
      messageEl.textContent = (error as Error).message;
      messageEl.classList.remove('success');
      messageEl.classList.add('error');
    }
  }

  private async handleRegister(e: Event) {
    e.preventDefault();
    const username = (document.getElementById('regUsername') as HTMLInputElement).value;
    const email = (document.getElementById('regEmail') as HTMLInputElement).value;
    const password = (document.getElementById('regPassword') as HTMLInputElement).value;
    const confirmPassword = (document.getElementById('regConfirmPassword') as HTMLInputElement).value;
    const dateOfBirth = (document.getElementById('regDateOfBirth') as HTMLInputElement).value;
    const messageEl = document.getElementById('registerMessage')!;

    if (password !== confirmPassword) {
      messageEl.textContent = 'Las contraseñas no coinciden.';
      messageEl.classList.remove('success');
      messageEl.classList.add('error');
      return;
    }

    try {
      await api.register(username, email, password, dateOfBirth || undefined);
      messageEl.textContent = '¡Registro exitoso! Por favor inicia sesión.';
      messageEl.classList.remove('error');
      messageEl.classList.add('success');
    } catch (error) {
      messageEl.textContent = (error as Error).message;
      messageEl.classList.remove('success');
      messageEl.classList.add('error');
    }
  }

  private async handleUpdateProfile(e: Event) {
    e.preventDefault();
    if (!this.token) return;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const dateOfBirth = (document.getElementById('dateOfBirth') as HTMLInputElement).value;
    const firstName = (document.getElementById('firstName') as HTMLInputElement).value;
    const lastName = (document.getElementById('lastName') as HTMLInputElement).value;
    const bio = (document.getElementById('bio') as HTMLTextAreaElement).value;
    const messageEl = document.getElementById('profileMessage')!;
    try {
      this.user = await api.updateProfile(this.token, { email, dateOfBirth: dateOfBirth || undefined, firstName, lastName, bio });
      messageEl.textContent = '¡Perfil actualizado!';
      messageEl.classList.remove('error');
      messageEl.classList.add('success');
    } catch (error) {
      messageEl.textContent = (error as Error).message;
      messageEl.classList.remove('success');
      messageEl.classList.add('error');
    }
  }

  private async loadProfile() {
    if (!this.token) return;
    try {
      this.user = await api.getProfile(this.token);
    } catch (error) {
      this.logout();
    }
  }

  private logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    this.render();
  }
}

export default App;