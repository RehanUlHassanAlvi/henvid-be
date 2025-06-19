import mongoose, { Schema, models, model } from 'mongoose';

const subscriptionSchema = new Schema({
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, unique: true },
  plan: { 
    name: { type: String, required: true },
    basePrice: { type: Number, required: true }, // Price per license in cents/øre
    currency: { type: String, default: 'NOK' }
  },
  licenseCount: { type: Number, required: true, min: 1 },
  billingFrequency: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
  status: { type: String, enum: ['active', 'cancelled', 'past_due', 'trialing', 'paused'], default: 'active' },
  currentPeriodStart: { type: Date, required: true },
  currentPeriodEnd: { type: Date, required: true },
  trialStart: { type: Date },
  trialEnd: { type: Date },
  cancelledAt: { type: Date },
  cancelAtPeriodEnd: { type: Boolean, default: false },
  addons: [{ 
    addon: { type: Schema.Types.ObjectId, ref: 'Addon' },
    quantity: { type: Number, default: 1 },
    addedAt: { type: Date, default: Date.now }
  }],
  discounts: [{
    name: { type: String },
    type: { type: String, enum: ['percentage', 'fixed'] },
    value: { type: Number },
    validUntil: { type: Date }
  }],
  paymentHistory: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
  nextBillingDate: { type: Date, required: true },
  lastBillingDate: { type: Date },
  totalRevenue: { type: Number, default: 0 }, // For analytics
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

// Virtual for monthly recurring revenue (MRR) - simplified to avoid TS errors
subscriptionSchema.virtual('mrr').get(function() {
  const baseAmount = (this as any).licenseCount * (this as any).plan.basePrice;
  
  return (this as any).billingFrequency === 'yearly' ? Math.round(baseAmount / 12) : baseAmount;
});

// Virtual for annual recurring revenue (ARR)
subscriptionSchema.virtual('arr').get(function() {
  const baseAmount = (this as any).licenseCount * (this as any).plan.basePrice;
  return (this as any).billingFrequency === 'yearly' ? baseAmount : baseAmount * 12;
});

// Indexes for dashboard queries
subscriptionSchema.index({ status: 1, nextBillingDate: 1 });
subscriptionSchema.index({ createdAt: -1 });
subscriptionSchema.index({ billingFrequency: 1, status: 1 });

const Subscription = models.Subscription || model('Subscription', subscriptionSchema);
export default Subscription; 