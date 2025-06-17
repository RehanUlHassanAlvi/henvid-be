import mongoose, { Schema, models, model } from 'mongoose';

const analyticsSchema = new Schema({
  // Scope of the analytics data
  company: { type: Schema.Types.ObjectId, ref: 'Company' }, // null for global analytics
  user: { type: Schema.Types.ObjectId, ref: 'User' }, // null for company-wide analytics
  
  // Time period for this analytics record
  period: { type: String, enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'], required: true },
  date: { type: Date, required: true }, // Start of the period
  endDate: { type: Date, required: true }, // End of the period
  
  // Call metrics
  calls: {
    total: { type: Number, default: 0 },
    successful: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    missed: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 }, // in seconds
    averageDuration: { type: Number, default: 0 },
    averageWaitTime: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 },
    peakHour: { type: String }, // Hour with most calls (e.g., "14:00")
    uniqueGuests: { type: Number, default: 0 }
  },
  
  // User engagement
  users: {
    active: { type: Number, default: 0 },
    newRegistrations: { type: Number, default: 0 },
    totalLogins: { type: Number, default: 0 },
    averageSessionDuration: { type: Number, default: 0 },
    dailyActiveUsers: { type: Number, default: 0 },
    weeklyActiveUsers: { type: Number, default: 0 },
    monthlyActiveUsers: { type: Number, default: 0 }
  },
  
  // Revenue metrics
  revenue: {
    total: { type: Number, default: 0 },
    subscriptions: { type: Number, default: 0 },
    addons: { type: Number, default: 0 },
    oneTime: { type: Number, default: 0 },
    mrr: { type: Number, default: 0 }, // Monthly recurring revenue
    arr: { type: Number, default: 0 }, // Annual recurring revenue
    churn: { type: Number, default: 0 }, // Churn rate percentage
    newSubscriptions: { type: Number, default: 0 },
    cancelledSubscriptions: { type: Number, default: 0 }
  },
  
  // Customer satisfaction
  satisfaction: {
    totalReviews: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    ratingDistribution: {
      oneStar: { type: Number, default: 0 },
      twoStar: { type: Number, default: 0 },
      threeStar: { type: Number, default: 0 },
      fourStar: { type: Number, default: 0 },
      fiveStar: { type: Number, default: 0 }
    },
    problemsSolved: { type: Number, default: 0 },
    problemsNotSolved: { type: Number, default: 0 },
    nps: { type: Number, default: 0 } // Net Promoter Score
  },
  
  // Technical metrics
  technical: {
    averageLatency: { type: Number, default: 0 },
    connectionFailures: { type: Number, default: 0 },
    reconnections: { type: Number, default: 0 },
    recordingsCreated: { type: Number, default: 0 },
    screenshareUsage: { type: Number, default: 0 },
    filesSent: { type: Number, default: 0 },
    browserDistribution: { type: Schema.Types.Mixed },
    osDistribution: { type: Schema.Types.Mixed },
    deviceTypeDistribution: { type: Schema.Types.Mixed }
  },
  
  // Growth metrics
  growth: {
    callGrowthRate: { type: Number, default: 0 }, // Percentage
    revenueGrowthRate: { type: Number, default: 0 },
    userGrowthRate: { type: Number, default: 0 },
    retentionRate: { type: Number, default: 0 },
    expansionRevenue: { type: Number, default: 0 } // Revenue from existing customers upgrading
  },
  
  // Time-based patterns
  patterns: {
    hourlyDistribution: [{ type: Number }], // 24 elements for hours 0-23
    dailyDistribution: [{ type: Number }], // 7 elements for days of week
    monthlyTrend: [{ type: Number }] // Variable length for trend analysis
  },
  
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

// Indexes for efficient dashboard queries
analyticsSchema.index({ company: 1, period: 1, date: -1 });
analyticsSchema.index({ user: 1, period: 1, date: -1 });
analyticsSchema.index({ period: 1, date: -1 });

const Analytics = models.Analytics || model('Analytics', analyticsSchema);
export default Analytics;