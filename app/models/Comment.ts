import mongoose, { Schema, models, model } from 'mongoose';

const commentSchema = new Schema({
  videoCall: { type: Schema.Types.ObjectId, ref: 'VideoCall' }, // Optional - can be standalone
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true }, // Main content field
  text: { type: String }, // Backward compatibility
  type: { type: String, enum: ['general', 'technical', 'resolution', 'feedback'], default: 'general' },
  timestamp: { type: Date, default: Date.now },
  isInternal: { type: Boolean, default: false }, // Internal vs customer-facing comments
  tags: [{ type: String }],
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

// Indexes for comment queries
commentSchema.index({ videoCall: 1, createdAt: -1 });
commentSchema.index({ user: 1, timestamp: -1 });
commentSchema.index({ isInternal: 1 });

const Comment = models.Comment || model('Comment', commentSchema);
export default Comment; 