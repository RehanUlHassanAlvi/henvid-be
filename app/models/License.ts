import mongoose, { Schema, models, model } from 'mongoose';

const licenseSchema = new Schema({
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' }, // null if unassigned
  
  // License details
  type: { type: String, enum: ['standard', 'premium', 'enterprise'], default: 'standard' },
  status: { type: String, enum: ['active', 'inactive', 'suspended', 'expired'], default: 'active' },
  
  // Pricing and billing
  price: { type: Number, required: true }, // Price in cents/øre
  currency: { type: String, default: 'NOK' },
  billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
  
  // License validity
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  autoRenew: { type: Boolean, default: true },
  
  // Usage tracking
  lastUsed: { type: Date },
  totalCalls: { type: Number, default: 0 },
  totalDuration: { type: Number, default: 0 }, // in seconds
  monthlyCallLimit: { type: Number }, // null = unlimited
  monthlyCallsUsed: { type: Number, default: 0 },
  
  // Features included with this license
  features: [{
    name: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    limits: { type: Schema.Types.Mixed } // Feature-specific limits
  }],
  
  // License assignment history
  assignmentHistory: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date },
    unassignedAt: { type: Date },
    reason: { type: String }
  }],
  
  // Payment tracking
  payments: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
  
  // Analytics
  analytics: {
    averageCallDuration: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    lastCalculated: { type: Date }
  },
  
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

// Indexes for queries
licenseSchema.index({ company: 1, status: 1 });
licenseSchema.index({ user: 1, status: 1 });
licenseSchema.index({ validUntil: 1, autoRenew: 1 });
licenseSchema.index({ status: 1, validUntil: 1 });

// Virtual for checking if license is currently valid
licenseSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.validFrom <= now && 
         this.validUntil >= now;
});

// Virtual for checking if license is assigned
licenseSchema.virtual('isAssigned').get(function() {
  return !!this.user;
});

// Method to assign license to user
licenseSchema.methods.assignToUser = function(userId, reason = 'manual_assignment') {
  const oldUser = this.user;
  
  // Close previous assignment if exists
  if (oldUser) {
    const lastAssignment = this.assignmentHistory[this.assignmentHistory.length - 1];
    if (lastAssignment && !lastAssignment.unassignedAt) {
      lastAssignment.unassignedAt = new Date();
      lastAssignment.reason = 'reassigned';
    }
  }
  
  // Create new assignment
  this.user = userId;
  this.assignmentHistory.push({
    user: userId,
    assignedAt: new Date(),
    reason: reason
  });
  
  return this.save();
};

// Method to unassign license
licenseSchema.methods.unassign = function(reason = 'manual_unassignment') {
  if (this.user) {
    const lastAssignment = this.assignmentHistory[this.assignmentHistory.length - 1];
    if (lastAssignment && !lastAssignment.unassignedAt) {
      lastAssignment.unassignedAt = new Date();
      lastAssignment.reason = reason;
    }
    this.user = null;
  }
  
  return this.save();
};

const License = models.License || model('License', licenseSchema);
export default License; 