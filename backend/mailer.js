const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT) || 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

/**
 * Envía el correo de restablecimiento de contraseña.
 * @param {string} to - Correo del usuario.
 * @param {string} resetUrl - URL completa para restablecer la contraseña.
 */
async function sendPasswordResetEmail(to, resetUrl) {
  const mailOptions = {
    from: '"CardMaster" <no-reply@cardmaster.local>',
    to,
    subject: 'Restablecer contraseña - CardMaster',
    html: `
      <p>Has solicitado restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace (válido por 1 hora):</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Si no fuiste tú, puedes ignorar este mensaje.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendPasswordResetEmail };
