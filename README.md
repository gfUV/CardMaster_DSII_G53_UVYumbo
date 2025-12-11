# CardMaster_DSII_G53_UVYumbo

[Diagrama de clases](https://www.mermaidchart.com/d/a4c8b566-3bf9-4184-a758-f82c5891845d)
[Diagrama entidad relación](https://drive.google.com/file/d/1cdFVKQs4JuG1KAbawTYKEDI_800rr2r4/view?usp=sharing) Se puede visualizar en https://app.diagrams.net/
[Modelo relacional](https://www.mermaidchart.com/d/2998ea50-3532-4cfa-b530-ebb7004d444e)


# 📘 HISTORIAS DE USUARIO PARA CARDMASTER

## 🧩 1. Registro e inicio de sesión

### HU-01 — Registro

**Como** usuario nuevo  
**Quiero** crear una cuenta con mi nombre, correo y contraseña  
**Para** poder ingresar a la plataforma y participar en las partidas.

**Criterios de aceptación:**

- Debo recibir un error si el correo ya existe.
- La contraseña debe guardarse en forma segura.
- Si el registro es exitoso, debo poder iniciar sesión.

---

### HU-02 — Inicio de sesión

**Como** usuario registrado  
**Quiero** iniciar sesión con mis credenciales  
**Para** acceder a mi cuenta y participar en las partidas.

**Criterios de aceptación:**

- Si mis credenciales son incorrectas, debo ver un mensaje de error.
- Al iniciar sesión debo recibir un token para validar mis acciones dentro de la plataforma.
- Debo ser redirigido a la pantalla principal del juego.

---

## 🔐 2. Recuperación de contraseña

### HU-03 — Recuperar contraseña

**Como** usuario que olvidó su contraseña  
**Quiero** recibir un correo con un enlace para restablecerla  
**Para** poder volver a acceder a mi cuenta.

**Criterios de aceptación:**

- Debo ingresar mi correo registrado.
- Debo recibir un email con un link de recuperación.
- El link debe permitirme establecer una nueva contraseña.

---

## 🎮 3. Gestión de salas y partidas

### HU-04 — Unirme a una sala

**Como** jugador  
**Quiero** poder unirme a una sala de juego  
**Para** poder participar en una partida.

**Criterios de aceptación:**

- No puedo entrar si la sala está llena.
- Debo ver cuántos jugadores hay conectados.
- Debo ver un contador antes de que la partida inicie.

---

### HU-05 — Ver el tablero de juego

**Como** jugador dentro de una sala  
**Quiero** visualizar un tablero o cuadro de juego  
**Para** poder interactuar con la interfaz del juego de cartas.

**Criterios de aceptación:**

- Debo ver un espacio visual asignado para el juego.
- El tablero debe actualizarse cuando la partida inicia.
- El ambiente debe representar un entorno de cartas (color verde, estructura de mesa, etc).

---

### HU-06 — Inicio automático de partida

**Como** jugador en sala  
**Quiero** que la partida inicie automáticamente entre los segundos 0 y 10  
**Para** comenzar la experiencia sin intervención manual.

**Criterios de aceptación:**

- La partida inicia sola cuando se cumple el tiempo.
- Los jugadores deben ver el tablero al iniciar.
- Si el temporizador llega a 5 minutos, se termina la sala.

---

### HU-07 — Ver el número de jugadores

**Como** jugador en una sala  
**Quiero** ver cuántos jugadores están conectados  
**Para** saber si se puede iniciar la partida.

**Criterios de aceptación:**

- El número debe actualizarse en tiempo real.
- Debo ver una notificación visual o indicador.

---

## 💻 4. Interfaz y experiencia de usuario

### HU-08 — Navegación básica

**Como** usuario  
**Quiero** navegar entre login, registro y sala  
**Para** poder desplazarme dentro de la plataforma sin confusión.

---

### HU-09 — Feedback del sistema

**Como** usuario  
**Quiero** recibir mensajes claros cuando hago acciones importantes  
**Para** entender si mi acción fue correcta o incorrecta.

**Ejemplos:**

- Error de login
- Registro exitoso
- Sala llena
- Tiempo agotado

---

## ⚙️ 5. Administración y estructura del proyecto

### HU-10 — Estructura de ramas

**Como** desarrollador del equipo  
**Quiero** trabajar con una estrategia de ramas organizada  
**Para** evitar conflictos y mantener un desarrollo ordenado.

---

## 📊 Resumen de Historias de Usuario

| ID    | Historia                     | Prioridad | Estado           |
| ----- | ---------------------------- | --------- | ---------------- |
| HU-01 | Registro                     | Alta      | ✅ Implementada  |
| HU-02 | Inicio de sesión             | Alta      | ✅ Implementada  |
| HU-03 | Recuperar contraseña         | Media     | ✅ Implementada  |
| HU-04 | Unirme a una sala            | Alta      | 🔄 En desarrollo |
| HU-05 | Ver el tablero de juego      | Alta      | 🔄 En desarrollo |
| HU-06 | Inicio automático de partida | Media     | 📋 Pendiente     |
| HU-07 | Ver el número de jugadores   | Media     | 🔄 En desarrollo |
| HU-08 | Navegación básica            | Alta      | ✅ Implementada  |
| HU-09 | Feedback del sistema         | Media     | 🔄 En desarrollo |
| HU-10 | Estructura de ramas          | Alta      | ✅ Implementada  |

---

**Proyecto:** CardMaster  
**Equipo:** Grupo 53 - UV Yumbo  
**Metodología:** Scrum / Agile  
**Fecha:** Diciembre 2025
