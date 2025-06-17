import mongoose, { Schema, models, model } from 'mongoose';

const paymentSchema = new Schema({
  invoiceId: { type: String, unique: true, required: true },
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true }, // Amount in cents/øre
  currency: { type: String, default: 'NOK' },
  type: { type: String, enum: ['subscription', 'addon', 'one-time'], default: 'subscription' },
  status: { type: String, enum: ['pending', 'paid', 'failed', 'cancelled', 'overdue'], default: 'pending' },
  invoiceDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  paidDate: { type: Date },
  paymentMethod: { type: String, enum: ['invoice', 'card', 'bank_transfer'], default: 'invoice' },
  licenses: [{ type: Schema.Types.ObjectId, ref: 'License' }],
  addons: [{ 
    addon: { type: Schema.Types.ObjectId, ref: 'Addon' },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true }
  }],
  billingPeriodStart: { type: Date },
  billingPeriodEnd: { type: Date },
  taxAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  metadata: { type: Schema.Types.Mixed }, // For additional payment processor data
}, { timestamps: true });

// Indexes for dashboard queries
paymentSchema.index({ company: 1, invoiceDate: -1 });
paymentSchema.index({ status: 1, dueDate: 1 });
paymentSchema.index({ type: 1, createdAt: -1 });

const Payment = models.Payment || model('Payment', paymentSchema);
export default Payment; 