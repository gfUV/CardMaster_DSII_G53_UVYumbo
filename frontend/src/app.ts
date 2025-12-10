import { api, type User } from "./api";

class App {
  private token: string | null = localStorage.getItem("token");
  private user: User | null = null;
  private timerInterval: number | null = null;
  private selectedLevel: string | null = null;

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
        ${this.token ? '<div class="user-actions"><span id="profile-icon" class="icon">👤</span><span id="logout-icon" class="icon">🚪</span></div>' : ''}
      </header>
      <nav>
        ${
          this.token
            ? '<div class="nav-center"><h3>Inicio</h3></div>'
            : '<button id="login">Iniciar Sesión</button><button id="register">Registrarse</button>'
        }
      </nav>
      <main id="content"></main>
    `;
    this.bindEvents();
    if (this.token) {
      this.showHome();
    } else {
      this.showLogin();
    }
  }

  private bindEvents() {
    document
      .getElementById("home")
      ?.addEventListener("click", () => this.showHome());
    document
      .getElementById("home-title")
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
    document
      .getElementById("profile-icon")
      ?.addEventListener("click", () => this.showProfile());
    document
      .getElementById("logout-icon")
      ?.addEventListener("click", () => this.logout());
    document
      .getElementById("quick-play")
      ?.addEventListener("click", () => this.handleQuickPlay());
    document
      .getElementById("tutorial")
      ?.addEventListener("click", () => this.showTutorial());
  }

  private showHome() {
    const content = document.getElementById("content")!;
    let extraContent = '';
    if (this.token) {
      extraContent = `
        <section class="game-section">
          <div class="game-buttons">
            <button id="quick-play">Jugar partida rápida</button>
            <button id="online-play">Jugar online</button>
            <button id="friends-play">Partida con amigos</button>
            <button id="tutorial">Tutorial</button>
            <button id="scores">Ver puntuaciones</button>
          </div>
        </section>
        <section class="game-info">
          <h3>¿Qué es CardMaster?</h3>
          <p>CardMaster es un emocionante juego de cartas estratégico donde los jugadores compiten por acumular puntos mediante combinaciones inteligentes de cartas.</p>
          <h4>Reglas básicas:</h4>
          <ul>
            <li>Cada jugador recibe un mazo inicial de cartas.</li>
            <li>En cada turno, juega una carta para formar combinaciones.</li>
            <li>Gana puntos por parejas, tríos y secuencias.</li>
            <li>El juego termina cuando se agotan las cartas o un jugador alcanza el puntaje objetivo.</li>
          </ul>
          <h4>Cómo ganar:</h4>
          <p>El jugador con más puntos al final de la partida es el ganador. Las combinaciones especiales otorgan bonificaciones extra.</p>
          <h4>Modos de juego:</h4>
          <ul>
            <li><strong>Partida rápida:</strong> Juego corto contra la IA.</li>
            <li><strong>Online:</strong> Compite contra jugadores de todo el mundo.</li>
            <li><strong>Con amigos:</strong> Crea salas privadas para jugar con conocidos.</li>
          </ul>
        </section>
      `;
    }
    content.innerHTML = `
      <section class="welcome">
        <h2>Bienvenido${this.user ? ', ' + this.user.username : ''}</h2>
        <p>Gestiona tu cuenta de usuario de manera segura y fácil.</p>
        <p>¡Explora las funciones disponibles!</p>
      </section>
      ${extraContent}
    `;

    // Bind events for dynamically created buttons
    if (this.token) {
      document
        .getElementById("quick-play")
        ?.addEventListener("click", () => this.handleQuickPlay());
      document
        .getElementById("online-play")
        ?.addEventListener("click", () => this.handleOnlinePlay());
      document
        .getElementById("friends-play")
        ?.addEventListener("click", () => this.handleFriendsPlay());
    }
  }

  private showLogin() {
    const content = document.getElementById("content")!;
    content.innerHTML = `
      <section class="auth-section">
        <h2>Iniciar Sesión</h2>
        <form id="loginForm">
          <input type="email" id="loginEmail" placeholder="Correo electrónico" required>
          <input type="password" id="loginPassword" placeholder="Contraseña" required>
          <button type="submit" class="auth-button">Iniciar Sesión</button>
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
          <button type="submit" class="auth-button">Registrarse</button>
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
        <button id="back-to-home" class="back-button">← Volver</button>
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
    document
      .getElementById("back-to-home")
      ?.addEventListener("click", () => this.showHome());
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

  private initFreeDragAndDrop() {
    const map = document.getElementById("game-map") as HTMLElement;
    const cards = map.querySelectorAll(".card.draggable");

    cards.forEach(card => {
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let initialLeft = 0;
      let initialTop = 0;

      card.addEventListener("mousedown", (e) => {
        const mouseEvent = e as MouseEvent;
        isDragging = true;
        startX = mouseEvent.clientX;
        startY = mouseEvent.clientY;
        const rect = (card as HTMLElement).getBoundingClientRect();
        initialLeft = rect.left - map.getBoundingClientRect().left;
        initialTop = rect.top - map.getBoundingClientRect().top;
        (card as HTMLElement).style.cursor = "grabbing";
        e.preventDefault();
      });

      document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        const mouseEvent = e as MouseEvent;
        const mapRect = map.getBoundingClientRect();
        let newLeft = initialLeft + (mouseEvent.clientX - startX);
        let newTop = initialTop + (mouseEvent.clientY - startY);

        // Restringir dentro del mapa
        const cardWidth = 50;
        const cardHeight = 70;
        newLeft = Math.max(0, Math.min(newLeft, mapRect.width - cardWidth));
        newTop = Math.max(0, Math.min(newTop, mapRect.height - cardHeight));

        (card as HTMLElement).style.left = `${newLeft}px`;
        (card as HTMLElement).style.top = `${newTop}px`;
      });

      document.addEventListener("mouseup", () => {
        if (isDragging) {
          isDragging = false;
          (card as HTMLElement).style.cursor = "grab";
        }
      });
    });
  }

  private handleQuickPlay() {
    const content = document.getElementById("content")!;
    content.innerHTML = `
      <section class="loading-section">
        <div class="spinner"></div>
        <h2>Tiempo estimado</h2>
        <div id="timer">00:00</div>
        <button id="cancel-matchmaking" class="cancel-button">Cancelar emparejamiento</button>
      </section>
    `;
    this.startQuickPlayTimer();
    document
      .getElementById("cancel-matchmaking")
      ?.addEventListener("click", () => this.cancelMatchmaking());
  }

  private handleOnlinePlay() {
    const content = document.getElementById("content")!;
    content.innerHTML = `
      <section class="auth-section">
        <h2>Selecciona tu nivel</h2>
        <div class="level-buttons">
          <button id="level-malo" class="level-button">Malo</button>
          <button id="level-regular" class="level-button">Regular</button>
          <button id="level-bueno" class="level-button">Bueno</button>
          <button id="level-pro" class="level-button">Pro</button>
        </div>
        <button id="search-rival" class="search-button" disabled>Buscar rival</button>
        <button id="back-to-home-online" class="back-button">← Volver</button>
      </section>
    `;
    document
      .getElementById("level-malo")
      ?.addEventListener("click", () => this.selectLevel("Malo"));
    document
      .getElementById("level-regular")
      ?.addEventListener("click", () => this.selectLevel("Regular"));
    document
      .getElementById("level-bueno")
      ?.addEventListener("click", () => this.selectLevel("Bueno"));
    document
      .getElementById("level-pro")
      ?.addEventListener("click", () => this.selectLevel("Pro"));
    document
      .getElementById("search-rival")
      ?.addEventListener("click", () => this.searchRival());
    document
      .getElementById("back-to-home-online")
      ?.addEventListener("click", () => this.showHome());
  }

  private handleFriendsPlay() {
    const content = document.getElementById("content")!;
    content.innerHTML = `
      <section class="friends-play-section">
        <h2>Partida con Amigos</h2>
        <div class="friends-options">
          <button id="create-room" class="friends-button">Crear sala</button>
          <button id="join-room" class="friends-button">Unirse a sala</button>
        </div>
        <button id="back-to-home-friends" class="back-button">← Volver</button>
      </section>
    `;
    document
      .getElementById("create-room")
      ?.addEventListener("click", () => this.showCreateRoom());
    document
      .getElementById("join-room")
      ?.addEventListener("click", () => this.showJoinRoom());
    document
      .getElementById("back-to-home-friends")
      ?.addEventListener("click", () => this.showHome());
  }

  private showCreateRoom() {
    const content = document.getElementById("content")!;
    content.innerHTML = `
      <section class="create-room-section">
        <h2>Crear sala</h2>
        <div class="create-room-form">
          <div class="form-group">
            <label for="room-name">Nombre de la sala:</label>
            <input type="text" id="room-name" placeholder="Nombre de la sala">
          </div>
          <div class="option-row">
            <label class="option-label">Número de jugadores:</label>
            <select id="num-players" class="small-select">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>
          <div class="option-row game-modes-row">
            <label class="option-label">Modos de juego:</label>
            <div class="game-modes">
              <label><input type="radio" name="game-mode" value="Juegos de bazas"> Juegos de bazas</label>
              <label><input type="radio" name="game-mode" value="Juegos de descarte"> Juegos de descarte</label>
              <label><input type="radio" name="game-mode" value="Juegos de emparejamiento"> Juegos de emparejamiento</label>
              <label><input type="radio" name="game-mode" value="Juegos de comparación"> Juegos de comparación</label>
              <label><input type="radio" name="game-mode" value="Juegos de apuestas"> Juegos de apuestas</label>
              <label><input type="radio" name="game-mode" value="Juegos de solitario"> Juegos de solitario</label>
            </div>
          </div>
          <button id="create-room-btn" class="create-room-button">Crear sala</button>
        </div>
        <button id="back-to-friends-create" class="back-button">← Volver</button>
      </section>
    `;

    // Validación para nombre de sala: solo letras y espacios
    const roomNameInput = document.getElementById("room-name") as HTMLInputElement;
    roomNameInput.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      target.value = target.value.replace(/[^a-zA-Z\s]/g, ''); // Solo letras y espacios
      this.validateCreateRoomForm();
    });

    // Validación para cambios en el select de número de jugadores
    const numPlayersSelect = document.getElementById("num-players") as HTMLSelectElement;
    numPlayersSelect.addEventListener("change", () => {
      this.validateCreateRoomForm();
    });

    // Validación para cambios en los radio buttons de modos de juego
    const gameModeRadios = document.querySelectorAll('input[name="game-mode"]');
    gameModeRadios.forEach(radio => {
      radio.addEventListener("change", () => {
        this.validateCreateRoomForm();
      });
    });

    document
      .getElementById("create-room-btn")
      ?.addEventListener("click", () => this.handleCreateRoom());
    document
      .getElementById("back-to-friends-create")
      ?.addEventListener("click", () => this.handleFriendsPlay());

    // Inicializar validación del formulario
    this.validateCreateRoomForm();
  }

  private validateCreateRoomForm() {
    const roomName = (document.getElementById("room-name") as HTMLInputElement).value.trim();
    const numPlayers = (document.getElementById("num-players") as HTMLSelectElement).value;
    const selectedMode = document.querySelector('input[name="game-mode"]:checked') as HTMLInputElement;
    const createButton = document.getElementById("create-room-btn") as HTMLButtonElement;

    const isValid = roomName.length > 0 && numPlayers !== "" && selectedMode !== null;

    if (isValid) {
      createButton.disabled = false;
      createButton.classList.remove("disabled");
      createButton.textContent = "Crear";
    } else {
      createButton.disabled = true;
      createButton.classList.add("disabled");
      createButton.textContent = "Crear sala";
    }
  }

  private handleCreateRoom() {
    const roomName = (document.getElementById("room-name") as HTMLInputElement).value.trim();
    const selectedMode = document.querySelector('input[name="game-mode"]:checked') as HTMLInputElement;

    if (!roomName) {
      alert("Por favor, ingresa un nombre para la sala.");
      return;
    }

    if (!selectedMode) {
      alert("Por favor, selecciona un modo de juego.");
      return;
    }

    // Generar código de 6 dígitos al azar
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Mostrar pantalla de espera
    this.showWaitingForRival(code);
  }

  private showWaitingForRival(code: string) {
    const content = document.getElementById("content")!;
    content.innerHTML = `
      <section class="waiting-section">
        <div class="spinner"></div>
        <h2>Esperando a tu rival</h2>
        <div id="waiting-timer">00:00</div>
        <p class="room-code">Código: <span style="color: black; font-size: normal;">${code}</span></p>
        <button id="cancel-waiting" class="cancel-button">Cancelar emparejamiento</button>
      </section>
    `;
    this.startWaitingTimer();
    document
      .getElementById("cancel-waiting")
      ?.addEventListener("click", () => this.cancelWaiting());
  }

  private cancelWaiting() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.showCreateRoom();
  }

  private startWaitingTimer() {
    let totalSeconds = 0;
    const maxSeconds = 5 * 60; // 5 minutos
    const timerElement = document.getElementById("waiting-timer")!;

    this.timerInterval = setInterval(() => {
      totalSeconds++;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      if (totalSeconds >= maxSeconds) {
        clearInterval(this.timerInterval!);
        this.timerInterval = null;
        alert("Tiempo agotado. No se encontró rival.");
        this.handleFriendsPlay();
      }
    }, 1000);
  }

  private showJoinRoom() {
    const content = document.getElementById("content")!;
    content.innerHTML = `
      <section class="join-room-section">
        <h2>Unirse a sala</h2>
        <div class="join-room-form">
          <input type="text" id="room-code" placeholder="Código" maxlength="6" pattern="[0-9]*" inputmode="numeric">
          <button id="accept-room-code" class="accept-button">Aceptar</button>
        </div>
        <button id="back-to-friends" class="back-button">← Volver</button>
      </section>
    `;
    const roomCodeInput = document.getElementById("room-code") as HTMLInputElement;
    roomCodeInput.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      target.value = target.value.replace(/\D/g, ''); // Solo números
    });
    document
      .getElementById("accept-room-code")
      ?.addEventListener("click", () => this.handleAcceptRoomCode());
    document
      .getElementById("back-to-friends")
      ?.addEventListener("click", () => this.handleFriendsPlay());
  }

  private handleAcceptRoomCode() {
    const roomCode = (document.getElementById("room-code") as HTMLInputElement).value;
    if (roomCode.length === 6) {
      this.showJoiningMatchmaking();
    } else {
      alert("El código debe tener exactamente 6 dígitos");
    }
  }

  private showJoiningMatchmaking() {
    const content = document.getElementById("content")!;
    content.innerHTML = `
      <section class="loading-section">
        <h2>Cargando emparejamiento</h2>
        <div class="spinner"></div>
        <div id="timer">00:00</div>
        <button id="cancel-matchmaking" class="cancel-button">Cancelar emparejamiento</button>
      </section>
    `;
    this.startCountdownTimer();
    document
      .getElementById("cancel-matchmaking")
      ?.addEventListener("click", () => this.cancelJoiningMatchmaking());
  }

  private startCountdownTimer() {
    let totalSeconds = 0; // Empezar desde 0
    const maxSeconds = 5 * 60; // 5 minutos
    const timerElement = document.getElementById("timer")!;

    this.timerInterval = setInterval(() => {
      totalSeconds++;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      if (totalSeconds >= maxSeconds) {
        clearInterval(this.timerInterval!);
        this.timerInterval = null;
        alert("Tiempo agotado. No se encontró emparejamiento.");
        this.showJoinRoom();
      }
    }, 1000);
  }

  private cancelJoiningMatchmaking() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.showJoinRoom();
  }

  private selectLevel(level: string) {
    this.selectedLevel = level;
    // Remove selected class from all buttons
    document.querySelectorAll(".level-button").forEach(btn => btn.classList.remove("selected"));
    // Add selected class to clicked button
    document.getElementById(`level-${level.toLowerCase()}`)?.classList.add("selected");
    // Enable search button and change color
    const searchButton = document.getElementById("search-rival") as HTMLButtonElement;
    searchButton.disabled = false;
    searchButton.classList.add("enabled");
  }

  private searchRival() {
    if (!this.selectedLevel) return;
    const content = document.getElementById("content")!;
    content.innerHTML = `
      <section class="loading-section">
        <div class="spinner"></div>
        <h2>Buscando rival en nivel ${this.selectedLevel}</h2>
        <div id="timer">00:00</div>
        <button id="cancel-matchmaking" class="cancel-button">Cancelar búsqueda</button>
      </section>
    `;
    this.startTimer();
    document
      .getElementById("cancel-matchmaking")
      ?.addEventListener("click", () => this.cancelMatchmaking());
  }

  private startTimer() {
    let seconds = 0;
    const maxSeconds = 5 * 60; // 5 minutos
    const timerElement = document.getElementById("timer")!;

    this.timerInterval = setInterval(() => {
      seconds++;
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      if (seconds >= maxSeconds) {
        clearInterval(this.timerInterval!);
        this.timerInterval = null;
        // Aquí podrías redirigir al juego o mostrar un mensaje
        alert("¡Partida rápida lista!");
      }
    }, 1000);
  }

  private cancelMatchmaking() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.showHome();
  }

  private startGame() {
    const content = document.getElementById("content")!;
    content.innerHTML = `
      <section class="game-map">
        <h2>¡Partida Iniciada!</h2>
        <div class="map-container">
          <div class="map" id="game-map">
            <!-- Primera pila de 5 cartas -->
            <div class="card draggable" draggable="true" data-card="A♠" style="left: 150px; top: 165px; z-index: 1;">A♠</div>
            <div class="card draggable" draggable="true" data-card="K♥" style="left: 155px; top: 170px; z-index: 2;">K♥</div>
            <div class="card draggable" draggable="true" data-card="Q♦" style="left: 160px; top: 175px; z-index: 3;">Q♦</div>
            <div class="card draggable" draggable="true" data-card="J♣" style="left: 165px; top: 180px; z-index: 4;">J♣</div>
            <div class="card draggable" draggable="true" data-card="10♠" style="left: 170px; top: 185px; z-index: 5;">10♠</div>
            <!-- Segunda pila de 5 cartas -->
            <div class="card draggable" draggable="true" data-card="9♥" style="left: 280px; top: 165px; z-index: 6;">9♥</div>
            <div class="card draggable" draggable="true" data-card="8♦" style="left: 285px; top: 170px; z-index: 7;">8♦</div>
            <div class="card draggable" draggable="true" data-card="7♣" style="left: 290px; top: 175px; z-index: 8;">7♣</div>
            <div class="card draggable" draggable="true" data-card="6♠" style="left: 295px; top: 180px; z-index: 9;">6♠</div>
            <div class="card draggable" draggable="true" data-card="5♥" style="left: 300px; top: 185px; z-index: 10;">5♥</div>
          </div>
        </div>
        <p>Arrastra las cartas libremente dentro del mapa para organizarlas.</p>
        <button id="back-to-home-game" class="back-button">← Volver al inicio</button>
      </section>
    `;
    this.initFreeDragAndDrop();
    document
      .getElementById("back-to-home-game")
      ?.addEventListener("click", () => this.showHome());
  }

  private startQuickPlayTimer() {
    let seconds = 0;
    const maxSeconds = 10; // 10 segundos
    const timerElement = document.getElementById("timer")!;

    this.timerInterval = setInterval(() => {
      seconds++;
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      if (seconds >= maxSeconds) {
        clearInterval(this.timerInterval!);
        this.timerInterval = null;
        this.startGame();
      }
    }, 1000);
  }

  private showTutorial() {
    const content = document.getElementById("content")!;
    content.innerHTML = `
      <section class="game-info">
        <button id="back-to-home-tutorial" class="back-button">← Volver</button>
        <h3>¿Qué es CardMaster?</h3>
        <p>CardMaster es un emocionante juego de cartas estratégico donde los jugadores compiten por acumular puntos mediante combinaciones inteligentes de cartas.</p>
        <h4>Reglas básicas:</h4>
        <ul>
          <li>Cada jugador recibe un mazo inicial de cartas.</li>
          <li>En cada turno, juega una carta para formar combinaciones.</li>
          <li>Gana puntos por parejas, tríos y secuencias.</li>
          <li>El juego termina cuando se agotan las cartas o un jugador alcanza el puntaje objetivo.</li>
        </ul>
        <h4>Cómo ganar:</h4>
        <p>El jugador con más puntos al final de la partida es el ganador. Las combinaciones especiales otorgan bonificaciones extra.</p>
        <h4>Modos de juego:</h4>
        <ul>
          <li><strong>Partida rápida:</strong> Juego corto contra la IA.</li>
          <li><strong>Online:</strong> Compite contra jugadores de todo el mundo.</li>
          <li><strong>Con amigos:</strong> Crea salas privadas para jugar con conocidos.</li>
        </ul>
      </section>
    `;
    document
      .getElementById("back-to-home-tutorial")
      ?.addEventListener("click", () => this.showHome());
  }
}

export default App;
