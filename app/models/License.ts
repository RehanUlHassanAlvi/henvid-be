import mongoose, { Schema, models, model } from 'mongoose';

const licenseSchema = new Schema({
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  type: { type: String },
  status: { type: String },
}, { timestamps: true });

const License = models.License || model('License', licenseSchema);
export default License; 