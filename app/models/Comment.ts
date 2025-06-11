import mongoose, { Schema, models, model } from 'mongoose';

const commentSchema = new Schema({
  videoCall: { type: Schema.Types.ObjectId, ref: 'VideoCall', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

const Comment = models.Comment || model('Comment', commentSchema);
export default Comment; 