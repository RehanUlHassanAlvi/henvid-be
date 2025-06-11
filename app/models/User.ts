import mongoose, { Schema, models, model } from 'mongoose';

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['super_admin', 'admin', 'user', 'guest'], default: 'user' },
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  language: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = models.User || model('User', userSchema);
export default User; 