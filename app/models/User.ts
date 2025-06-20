import mongoose, { Schema, models, model } from 'mongoose';
// Import Company to ensure it's registered for population
import './Company';

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: {
    countryCode: { type: String, default: '+47' }, // Default to Norway
    number: { type: String },
    full: { type: String } // Computed full number for backward compatibility
  },
  role: { type: String, enum: ['super_admin', 'admin', 'user', 'guest'], default: 'user' },
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  language: { type: String, default: 'nb-NO' },
  isActive: { type: Boolean, default: true },
  
  // Additional fields to match frontend expectations
  image: { type: String, default: '/assets/elements/avatar.png' },
  timezone: { type: String, default: 'Europe/Oslo' },
  
  // Authentication & Security
  emailVerified: { type: Boolean, default: false },
  emailVerifiedAt: { type: Date },
  emailVerificationToken: { type: String },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  lastLoginAt: { type: Date },
  lastLoginIP: { type: String },
  
  // Analytics fields
  totalVideoCalls: { type: Number, default: 0 },
  totalCallDuration: { type: Number, default: 0 }, // in seconds
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  
  // Activity tracking
  lastActivityAt: { type: Date },
  loginCount: { type: Number, default: 0 },
  
  // Preferences
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    callStarted: { type: Boolean, default: true },
    callEnded: { type: Boolean, default: true },
    reviewReceived: { type: Boolean, default: true }
  },
  
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for frontend compatibility (name/lastname)
userSchema.virtual('name').get(function() {
  return this.firstName;
});

userSchema.virtual('lastname').get(function() {
  return this.lastName;
});

userSchema.virtual('reviews').get(function() {
  return this.reviewCount;
});

// Virtual for full phone number (backward compatibility)
userSchema.virtual('phoneNumber').get(function() {
  if (this.phone?.countryCode && this.phone?.number) {
    return `${this.phone.countryCode}${this.phone.number}`;
  }
  return this.phone?.full || '';
});

// Indexes for analytics and queries
userSchema.index({ company: 1, role: 1, isActive: 1 });
userSchema.index({ isActive: 1, lastActivityAt: -1 });
userSchema.index({ totalVideoCalls: -1 });
userSchema.index({ email: 1, company: 1 }, { unique: true });

// Pre-save middleware to compute full phone number
userSchema.pre('save', function() {
  if (this.phone?.countryCode && this.phone?.number) {
    this.phone.full = `${this.phone.countryCode}${this.phone.number}`;
  }
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = models.User || model('User', userSchema);
export default User; 