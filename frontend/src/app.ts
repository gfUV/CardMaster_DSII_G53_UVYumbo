import { api, type User } from "./api";

class App {
  private token: string | null = localStorage.getItem("token");
  private user: User | null = null;

  constructor() {
    this.init();
  }

  private init() {
    this.render();

     // Si la URL contiene /reset-password/, mostrar directamente el formulario
    const url = new URL(window.location.href);
    if (url.pathname.startsWith('/reset-password/')) {
      const parts = url.pathname.split('/');
      const token = parts[parts.length - 1];
      this.showResetPassword(token);
      return;
    }

    if (this.token) {
      this.loadProfile();
    }
  }

  private render() {
    const app = document.querySelector<HTMLDivElement>("#app")!;
    app.innerHTML = `
      <header>
        <h1>CardMaster</h1>
        <p>Tu gestor de cuentas de usuario</p>
      </header>
      <nav>
        <button id="home">Inicio</button>
        ${
          !this.token
            ? '<button id="login">Iniciar Sesión</button><button id="register">Registrarse</button>'
            : '<button id="profile">Perfil</button><button id="logout">Cerrar Sesión</button>'
        }
      </nav>
      <main id="content"></main>
    `;
    this.bindEvents();
    this.showHome();
  }

  private bindEvents() {
    document
      .getElementById("home")
      ?.addEventListener("click", () => this.showHome());
    document
      .getElementById("login")
      ?.addEventListener("click", () => this.showLogin());
    document
      .getElementById("register")
      ?.addEventListener("click", () => this.showRegister());
    document
      .getElementById("profile")
      ?.addEventListener("click", () => this.showProfile());
    document
      .getElementById("logout")
      ?.addEventListener("click", () => this.logout());
  }

  private showHome() {
    const content = document.getElementById("content")!;
    content.innerHTML = `
      <section class="welcome">
        <h2>Bienvenido</h2>
        <p>Gestiona tu cuenta de usuario de manera segura y fácil.</p>
        <p>¡Explora las funciones disponibles!</p>
      </section>
    `;
  }

  private showLogin() {
    const content = document.getElementById("content")!;
    content.innerHTML = `
      <section class="auth-section">
        <h2>Iniciar Sesión</h2>
        <form id="loginForm">
          <input type="email" id="loginEmail" placeholder="Correo electrónico" required>
          <input type="password" id="loginPassword" placeholder="Contraseña" required>
          <button type="submit">Iniciar Sesión</button>
        </form>
        <a id="forgotPasswordLink" href="#" class="link-button">¿Olvidaste tu contraseña?</a>
        <div id="loginMessage" class="message"></div>
      </section>
    `;
    document
      .getElementById("loginForm")
      ?.addEventListener("submit", (e) => this.handleLogin(e));
    document
      .getElementById("forgotPasswordLink")
      ?.addEventListener("click", () => this.showForgotPassword());
  }

  private showRegister() {
    const content = document.getElementById("content")!;
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
    document
      .getElementById("registerForm")
      ?.addEventListener("submit", (e) => this.handleRegister(e));
  }

  private showProfile() {
    if (!this.user) return;
    const content = document.getElementById("content")!;
    content.innerHTML = `
      <section class="profile-section">
        <h2>Perfil de Usuario</h2>
        <div class="user-info">
          <p><strong>Nombre de usuario:</strong> ${this.user.username}</p>
        </div>
        <form id="profileForm">
          <input type="email" id="email" placeholder="Correo electrónico" value="${
            this.user.email
          }" required>
          <input type="date" id="dateOfBirth" placeholder="Fecha de nacimiento" value="${
            this.user.profile?.dateOfBirth
              ? this.user.profile.dateOfBirth.split("T")[0]
              : ""
          }">
          <input type="text" id="firstName" placeholder="Nombre" value="${
            this.user.profile?.firstName || ""
          }">
          <input type="text" id="lastName" placeholder="Apellido" value="${
            this.user.profile?.lastName || ""
          }">
          <textarea id="bio" placeholder="Biografía">${
            this.user.profile?.bio || ""
          }</textarea>
          <button type="submit">Actualizar Perfil</button>
        </form>
        <div id="profileMessage" class="message"></div>
      </section>
    `;
    document
      .getElementById("profileForm")
      ?.addEventListener("submit", (e) => this.handleUpdateProfile(e));
  }

  private showForgotPassword() {
    const content = document.getElementById("content")!;
    content.innerHTML = `
      <section class="auth-section">
        <h2>Recuperar contraseña</h2>
        <form id="forgotPasswordForm">
          <input type="email" id="forgotEmail" placeholder="Correo electrónico" required>
          <button type="submit">Enviar enlace</button>
        </form>
        <div id="forgotMessage" class="message"></div>
      </section>
    `;
    document
      .getElementById("forgotPasswordForm")
      ?.addEventListener("submit", (e) => this.handleForgotPassword(e));
  }

  private showResetPassword(tokenFromUrl?: string) {
    const token = tokenFromUrl || this.getTokenFromLocation();
    if (!token) {
      const content = document.getElementById("content")!;
      content.innerHTML = `
        <section class="auth-section">
          <h2>Restablecer contraseña</h2>
          <p>Token no válido o falta en la URL.</p>
        </section>
      `;
      return;
    }

    const content = document.getElementById("content")!;
    content.innerHTML = `
      <section class="auth-section">
        <h2>Restablecer contraseña</h2>
        <form id="resetPasswordForm">
          <input type="password" id="newPassword" placeholder="Nueva contraseña" required>
          <input type="password" id="confirmNewPassword" placeholder="Confirmar contraseña" required>
          <button type="submit">Guardar nueva contraseña</button>
        </form>
        <div id="resetMessage" class="message"></div>
      </section>
    `;

    const form = document.getElementById("resetPasswordForm");
    form?.addEventListener("submit", (e) => this.handleResetPassword(e, token));
  }

  private getTokenFromLocation(): string | null {
    const url = new URL(window.location.href);
    const parts = url.pathname.split("/");
    const token = parts[parts.length - 1];
    return token || null;
  }

  private async handleLogin(e: Event) {
    e.preventDefault();
    const email = (document.getElementById("loginEmail") as HTMLInputElement)
      .value;
    const password = (
      document.getElementById("loginPassword") as HTMLInputElement
    ).value;
    const messageEl = document.getElementById("loginMessage")!;
    try {
      const response = await api.login(email, password);
      this.token = response.token;
      this.user = response.user;
      localStorage.setItem("token", this.token);
      this.render();
      this.showHome();
    } catch (error) {
      messageEl.textContent = (error as Error).message;
      messageEl.classList.remove("success");
      messageEl.classList.add("error");
    }
  }

  private async handleRegister(e: Event) {
    e.preventDefault();
    const username = (
      document.getElementById("regUsername") as HTMLInputElement
    ).value;
    const email = (document.getElementById("regEmail") as HTMLInputElement)
      .value;
    const password = (
      document.getElementById("regPassword") as HTMLInputElement
    ).value;
    const confirmPassword = (
      document.getElementById("regConfirmPassword") as HTMLInputElement
    ).value;
    const dateOfBirth = (
      document.getElementById("regDateOfBirth") as HTMLInputElement
    ).value;
    const messageEl = document.getElementById("registerMessage")!;

    if (password !== confirmPassword) {
      messageEl.textContent = "Las contraseñas no coinciden.";
      messageEl.classList.remove("success");
      messageEl.classList.add("error");
      return;
    }

    try {
      await api.register(username, email, password, dateOfBirth || undefined);
      messageEl.textContent = "¡Registro exitoso! Por favor inicia sesión.";
      messageEl.classList.remove("error");
      messageEl.classList.add("success");
    } catch (error) {
      messageEl.textContent = (error as Error).message;
      messageEl.classList.remove("success");
      messageEl.classList.add("error");
    }
  }

  private async handleForgotPassword(e: Event) {
    e.preventDefault();
    const email = (document.getElementById("forgotEmail") as HTMLInputElement)
      .value;
    const messageEl = document.getElementById("forgotMessage")!;
    try {
      await api.forgotPassword(email);
      messageEl.textContent =
        "Si el correo existe, se ha enviado un enlace de restablecimiento.";
      messageEl.classList.remove("error");
      messageEl.classList.add("success");
    } catch (error) {
      messageEl.textContent = (error as Error).message;
      messageEl.classList.remove("success");
      messageEl.classList.add("error");
    }
  }

  private async handleResetPassword(e: Event, token: string) {
    e.preventDefault();
    const password = (
      document.getElementById("newPassword") as HTMLInputElement
    ).value;
    const confirmPassword = (
      document.getElementById("confirmNewPassword") as HTMLInputElement
    ).value;
    const messageEl = document.getElementById("resetMessage")!;

    if (password !== confirmPassword) {
      messageEl.textContent = "Las contraseñas no coinciden.";
      messageEl.classList.remove("success");
      messageEl.classList.add("error");
      return;
    }

    try {
      await api.resetPassword(token, password);
      messageEl.textContent =
        "Contraseña restablecida correctamente. Ahora puedes iniciar sesión.";
      messageEl.classList.remove("error");
      messageEl.classList.add("success");
    } catch (error) {
      messageEl.textContent = (error as Error).message;
      messageEl.classList.remove("success");
      messageEl.classList.add("error");
    }
  }

  private async handleUpdateProfile(e: Event) {
    e.preventDefault();
    if (!this.token) return;
    const email = (document.getElementById("email") as HTMLInputElement).value;
    const dateOfBirth = (
      document.getElementById("dateOfBirth") as HTMLInputElement
    ).value;
    const firstName = (document.getElementById("firstName") as HTMLInputElement)
      .value;
    const lastName = (document.getElementById("lastName") as HTMLInputElement)
      .value;
    const bio = (document.getElementById("bio") as HTMLTextAreaElement).value;
    const messageEl = document.getElementById("profileMessage")!;
    try {
      this.user = await api.updateProfile(this.token, {
        email,
        dateOfBirth: dateOfBirth || undefined,
        firstName,
        lastName,
        bio,
      });
      messageEl.textContent = "¡Perfil actualizado!";
      messageEl.classList.remove("error");
      messageEl.classList.add("success");
    } catch (error) {
      messageEl.textContent = (error as Error).message;
      messageEl.classList.remove("success");
      messageEl.classList.add("error");
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
    localStorage.removeItem("token");
    this.render();
  }
}

export default App;
