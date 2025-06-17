import mongoose, { Schema, models, model } from 'mongoose';

const sessionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: Schema.Types.ObjectId, ref: 'Company' }, // For company context
  token: { type: String, required: true, unique: true },
  refreshToken: { type: String, unique: true },
  
  // Session details
  ipAddress: { type: String },
  userAgent: { type: String },
  deviceType: { type: String, enum: ['desktop', 'mobile', 'tablet', 'unknown'], default: 'unknown' },
  browser: { type: String },
  os: { type: String },
  location: {
    country: { type: String },
    city: { type: String },
    timezone: { type: String }
  },
  
  // Security
  isActive: { type: Boolean, default: true },
  lastActivity: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  refreshExpiresAt: { type: Date },
  
  // Session type and permissions
  sessionType: { type: String, enum: ['web', 'mobile', 'api'], default: 'web' },
  permissions: [{ type: String }], // Specific permissions for this session
  twoFactorVerified: { type: Boolean, default: false },
  
  // Analytics and tracking
  loginMethod: { type: String, enum: ['password', 'sso', 'magic_link', 'refresh'], required: true },
  duration: { type: Number }, // Session duration in seconds (calculated on logout)
  pageViews: { type: Number, default: 0 },
  apiCalls: { type: Number, default: 0 },
  
  // Logout/termination
  loggedOutAt: { type: Date },
  terminationReason: { type: String, enum: ['user_logout', 'expired', 'admin_revoked', 'security_breach', 'inactivity'] },
  
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

// TTL index for automatic cleanup of expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Indexes for queries
sessionSchema.index({ user: 1, isActive: 1 });
sessionSchema.index({ lastActivity: -1 });
sessionSchema.index({ company: 1, isActive: 1 });

// Virtual for checking if session is expired
sessionSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Method to extend session
sessionSchema.methods.extend = function(hours = 24) {
  this.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  this.lastActivity = new Date();
  return this.save();
};

// Method to terminate session
sessionSchema.methods.terminate = function(reason = 'user_logout') {
  this.isActive = false;
  this.loggedOutAt = new Date();
  this.terminationReason = reason;
  if (!this.duration) {
    this.duration = Math.floor((Date.now() - this.createdAt.getTime()) / 1000);
  }
  return this.save();
};

const Session = models.Session || model('Session', sessionSchema);
export default Session; 