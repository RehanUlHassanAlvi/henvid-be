import mongoose, { Schema, models, model } from 'mongoose';

const videoCallSchema = new Schema({
  code: { type: String, unique: true, required: true },
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  guest: { type: Schema.Types.ObjectId, ref: 'User' },
  guestPhone: { type: String },
  guestName: { type: String }, // For non-registered guests
  guestEmail: { type: String }, // For non-registered guests
  
  // Call timing
  startedAt: { type: Date },
  endedAt: { type: Date },
  scheduledAt: { type: Date }, // For scheduled calls
  duration: { type: Number }, // in seconds
  
  // Call status and quality
  status: { type: String, enum: ['pending', 'ringing', 'active', 'ended', 'cancelled', 'missed', 'failed'], default: 'pending' },
  endReason: { type: String, enum: ['completed', 'user_ended', 'guest_ended', 'timeout', 'technical_issue', 'cancelled'] },
  quality: { type: String, enum: ['excellent', 'good', 'fair', 'poor'], default: 'good' },
  
  // Technical data
  connectionData: {
    guestIP: { type: String },
    guestBrowser: { type: String },
    guestOS: { type: String },
    connectionType: { type: String }, // wifi, cellular, etc.
    bandwidth: { type: Number },
    latency: { type: Number }
  },
  
  // Recording (if available)
  recordingEnabled: { type: Boolean, default: false },
  recordingUrl: { type: String },
  recordingDuration: { type: Number },
  
  // Relationships
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  review: { type: Schema.Types.ObjectId, ref: 'Review' },
  
  // Analytics and tracking
  waitingTime: { type: Number }, // Time guest waited before call started
  responseTime: { type: Number }, // Time between call initiation and user joining
  reconnections: { type: Number, default: 0 },
  screenshareUsed: { type: Boolean, default: false },
  filesSent: { type: Number, default: 0 },
  
  // Problem resolution
  problemCategory: { type: String },
  problemSolved: { type: Boolean },
  followUpRequired: { type: Boolean, default: false },
  followUpDate: { type: Date },
  
  // Billing
  billable: { type: Boolean, default: true },
  billingCategory: { type: String, enum: ['support', 'sales', 'consultation', 'training'] },
  
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

// Indexes for analytics and queries
videoCallSchema.index({ company: 1, createdAt: -1 });
videoCallSchema.index({ user: 1, status: 1 });
videoCallSchema.index({ status: 1, startedAt: -1 });
videoCallSchema.index({ endedAt: -1 });
videoCallSchema.index({ problemSolved: 1, company: 1 });
videoCallSchema.index({ duration: -1 });

// Virtual for call success rate calculation
videoCallSchema.virtual('wasSuccessful').get(function() {
  return this.status === 'ended' && this.endReason === 'completed';
});

// Pre-save middleware to calculate duration
videoCallSchema.pre('save', function() {
  if (this.startedAt && this.endedAt && !this.duration) {
    this.duration = Math.floor((this.endedAt.getTime() - this.startedAt.getTime()) / 1000);
  }
});

const VideoCall = models.VideoCall || model('VideoCall', videoCallSchema);
export default VideoCall; 