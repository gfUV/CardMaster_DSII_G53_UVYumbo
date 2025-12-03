const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },

  profile: {
    firstName:  { type: String, default: "" },
    lastName:   { type: String, default: "" },
    bio:        { type: String, default: "" },
    dateOfBirth:{ type: Date }
  },

  resetPasswordToken:   { type: String },
  resetPasswordExpires: { type: Date }

}, { timestamps: true });

// La encriptación de contraseña se maneja en las rutas, no en pre-save hooks

// Comparar contraseña
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
