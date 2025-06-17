import mongoose, { Schema, models, model } from 'mongoose';

const companySchema = new Schema({
  name: { type: String, required: true },
  orgNumber: { type: String, required: true, unique: true },
  industry: { type: String },
  country: { type: String, default: 'NO' },
  language: { type: String, default: 'nb-NO' },
  
  // Contact information
  email: { type: String },
  phone: { type: String },
  website: { type: String },
  address: {
    street: { type: String },
    city: { type: String },
    postalCode: { type: String },
    country: { type: String, default: 'NO' }
  },
  
  // Branding
  logo: { type: String },
  brandColors: {
    primary: { type: String },
    secondary: { type: String }
  },
  customDomain: { type: String },
  
  // Business details
  size: { type: String, enum: ['startup', 'small', 'medium', 'large', 'enterprise'] },
  foundedYear: { type: Number },
  
  // Status and settings
  isActive: { type: Boolean, default: true },
  isPremium: { type: Boolean, default: false },
  settings: {
    timezone: { type: String, default: 'Europe/Oslo' },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
      days: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }]
    },
    autoResponse: {
      enabled: { type: Boolean, default: false },
      message: { type: String }
    },
    callLimits: {
      dailyLimit: { type: Number, default: 100 },
      monthlyLimit: { type: Number, default: 1000 }
    }
  },
  
  // Relationships
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  licenses: [{ type: Schema.Types.ObjectId, ref: 'License' }],
  subscription: { type: Schema.Types.ObjectId, ref: 'Subscription' },
  
  // Legacy field for backward compatibility
  features: [{ type: String }],
  
  // Analytics aggregates
  analytics: {
    totalCalls: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 },
    averageCallDuration: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 }, // Percentage of successful calls
    responseTime: { type: Number, default: 0 }, // Average response time
    lastUpdated: { type: Date }
  },
  
  // Onboarding and lifecycle
  onboardingCompleted: { type: Boolean, default: false },
  onboardingStep: { type: Number, default: 0 },
  trialStartDate: { type: Date },
  trialEndDate: { type: Date },
  
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

// Indexes for queries and analytics
companySchema.index({ orgNumber: 1 });
companySchema.index({ isActive: 1, createdAt: -1 });
companySchema.index({ 'analytics.totalCalls': -1 });
companySchema.index({ 'analytics.totalRevenue': -1 });
companySchema.index({ customDomain: 1 });

// Virtual for total users count
companySchema.virtual('userCount').get(function() {
  return this.users ? this.users.length : 0;
});

// Virtual for license count
companySchema.virtual('licenseCount').get(function() {
  return this.licenses ? this.licenses.length : 0;
});

// Method to update analytics
companySchema.methods.updateAnalytics = async function() {
  // This would be called periodically to update aggregated analytics
  this.analytics.lastUpdated = new Date();
  return this.save();
};

const Company = models.Company || model('Company', companySchema);
export default Company; 