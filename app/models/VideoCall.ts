import mongoose, { Schema, models, model } from 'mongoose';

const videoCallSchema = new Schema({
  code: { type: String, unique: true, required: true },
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  guest: { type: Schema.Types.ObjectId, ref: 'User' },
  guestPhone: { type: String },
  startedAt: { type: Date },
  endedAt: { type: Date },
  status: { type: String, enum: ['pending', 'active', 'ended', 'cancelled'], default: 'pending' },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  review: { type: Schema.Types.ObjectId, ref: 'Review' },
  duration: { type: Number },
}, { timestamps: true });

const VideoCall = models.VideoCall || model('VideoCall', videoCallSchema);
export default VideoCall; 