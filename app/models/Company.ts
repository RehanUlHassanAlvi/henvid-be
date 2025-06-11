import mongoose, { Schema, models, model } from 'mongoose';

const companySchema = new Schema({
  name: { type: String, required: true },
  orgNumber: { type: String, required: true },
  industry: { type: String },
  country: { type: String },
  language: { type: String },
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  licenses: [{ type: Schema.Types.ObjectId, ref: 'License' }],
  features: [{ type: String }]
}, { timestamps: true });

const Company = models.Company || model('Company', companySchema);
export default Company; 