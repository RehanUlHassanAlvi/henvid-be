import mongoose, { Schema, models, model } from 'mongoose';

const addonSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true }, // Price in cents/øre
  currency: { type: String, default: 'NOK' },
  billingType: { type: String, enum: ['monthly', 'yearly', 'one-time', 'usage-based'], default: 'monthly' },
  category: { type: String, enum: ['customization', 'functionality', 'analytics', 'integration', 'support'], required: true },
  icon: { type: String }, // Icon identifier for frontend
  available: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  
  // Feature configuration
  config: {
    maxUsage: { type: Number }, // For usage-based billing
    includedInPlans: [{ type: String }], // Plans that include this addon
    dependencies: [{ type: Schema.Types.ObjectId, ref: 'Addon' }], // Required addons
    restrictions: { type: Schema.Types.Mixed } // Any feature restrictions
  },
  
  // Analytics fields
  totalSubscriptions: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 }, // Percentage of companies that subscribe
  
  // Admin fields
  isActive: { type: Boolean, default: true },
  launchedAt: { type: Date },
  deprecatedAt: { type: Date },
  
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

// Indexes for queries
addonSchema.index({ available: 1, isActive: 1, sortOrder: 1 });
addonSchema.index({ category: 1, featured: -1 });
addonSchema.index({ name: 1 });

const Addon = models.Addon || model('Addon', addonSchema);
export default Addon; 