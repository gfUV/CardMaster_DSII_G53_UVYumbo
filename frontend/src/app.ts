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
      <nav>
        <button id="home">Home</button>
        ${!this.token ? '<button id="login">Login</button><button id="register">Register</button>' : '<button id="profile">Profile</button><button id="logout">Logout</button>'}
      </nav>
      <div id="content"></div>
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
      <h1>Welcome to CardMaster</h1>
      <p>Manage your user account here.</p>
    `;
  }

  private showLogin() {
    const content = document.getElementById('content')!;
    content.innerHTML = `
      <h2>Login</h2>
      <form id="loginForm">
        <input type="email" id="loginEmail" placeholder="Email" required>
        <input type="password" id="loginPassword" placeholder="Password" required>
        <button type="submit">Login</button>
      </form>
      <div id="loginMessage"></div>
    `;
    document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
  }

  private showRegister() {
    const content = document.getElementById('content')!;
    content.innerHTML = `
      <h2>Register</h2>
      <form id="registerForm">
        <input type="text" id="regUsername" placeholder="Username" required>
        <input type="email" id="regEmail" placeholder="Email" required>
        <input type="password" id="regPassword" placeholder="Password" required>
        <button type="submit">Register</button>
      </form>
      <div id="registerMessage"></div>
    `;
    document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));
  }

  private showProfile() {
    if (!this.user) return;
    const content = document.getElementById('content')!;
    content.innerHTML = `
      <h2>Profile</h2>
      <p>Username: ${this.user.username}</p>
      <p>Email: ${this.user.email}</p>
      <form id="profileForm">
        <input type="text" id="firstName" placeholder="First Name" value="${this.user.profile?.firstName || ''}">
        <input type="text" id="lastName" placeholder="Last Name" value="${this.user.profile?.lastName || ''}">
        <textarea id="bio" placeholder="Bio">${this.user.profile?.bio || ''}</textarea>
        <button type="submit">Update Profile</button>
      </form>
      <div id="profileMessage"></div>
    `;
    document.getElementById('profileForm')?.addEventListener('submit', (e) => this.handleUpdateProfile(e));
  }

  private async handleLogin(e: Event) {
    e.preventDefault();
    const email = (document.getElementById('loginEmail') as HTMLInputElement).value;
    const password = (document.getElementById('loginPassword') as HTMLInputElement).value;
    try {
      const response = await api.login(email, password);
      this.token = response.token;
      this.user = response.user;
      localStorage.setItem('token', this.token);
      this.render();
      this.showHome();
    } catch (error) {
      document.getElementById('loginMessage')!.textContent = (error as Error).message;
    }
  }

  private async handleRegister(e: Event) {
    e.preventDefault();
    const username = (document.getElementById('regUsername') as HTMLInputElement).value;
    const email = (document.getElementById('regEmail') as HTMLInputElement).value;
    const password = (document.getElementById('regPassword') as HTMLInputElement).value;
    try {
      await api.register(username, email, password);
      document.getElementById('registerMessage')!.textContent = 'Registration successful! Please login.';
    } catch (error) {
      document.getElementById('registerMessage')!.textContent = (error as Error).message;
    }
  }

  private async handleUpdateProfile(e: Event) {
    e.preventDefault();
    if (!this.token) return;
    const firstName = (document.getElementById('firstName') as HTMLInputElement).value;
    const lastName = (document.getElementById('lastName') as HTMLInputElement).value;
    const bio = (document.getElementById('bio') as HTMLTextAreaElement).value;
    try {
      this.user = await api.updateProfile(this.token, { firstName, lastName, bio });
      document.getElementById('profileMessage')!.textContent = 'Profile updated!';
    } catch (error) {
      document.getElementById('profileMessage')!.textContent = (error as Error).message;
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