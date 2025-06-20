import mongoose, { Schema, models, model } from 'mongoose';

const reviewSchema = new Schema({
  videoCall: { type: Schema.Types.ObjectId, ref: 'VideoCall', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Consistent field name
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  rating: { type: Number, min: 1, max: 5, required: true }, // Primary rating field
  ratingHelpfulness: { type: Number, min: 1, max: 5 },
  ratingEmployee: { type: Number, min: 1, max: 5 },
  title: { type: String, required: true },
  content: { type: String, required: true }, // Main review content
  comment: { type: String }, // Backward compatibility
  problemSolved: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  helpful: { type: Number, default: 0 }, // Number of helpful votes
  reported: { type: Number, default: 0 }, // Number of reports
  response: { type: String }, // Company response to review
  responseDate: { type: Date },
  tags: [{ type: String }],
}, { timestamps: true });

// Indexes for review queries
reviewSchema.index({ company: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ verified: 1, rating: -1 });

const Review = models.Review || model('Review', reviewSchema);
export default Review; 