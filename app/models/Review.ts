import mongoose, { Schema, models, model } from 'mongoose';

const reviewSchema = new Schema({
  videoCall: { type: Schema.Types.ObjectId, ref: 'VideoCall', required: true },
  guest: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ratingHelpfulness: { type: Number, min: 1, max: 5 },
  ratingEmployee: { type: Number, min: 1, max: 5 },
  problemSolved: { type: Boolean },
  comment: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

const Review = models.Review || model('Review', reviewSchema);
export default Review; 