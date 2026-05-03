import mongoose, { Schema, Document } from 'mongoose';

export interface IVisitor extends Document {
  name: string; phone: string; email?: string; aadhar?: string;
  address?: string; gender?: string; imageUrl?: string;
}
const VisitorSchema = new Schema<IVisitor>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String, aadhar: String, address: String, gender: String, imageUrl: String,
}, { timestamps: true });
export const Visitor = mongoose.model<IVisitor>('Visitor', VisitorSchema);

export interface IVisit extends Document {
  visitor: mongoose.Types.ObjectId;
  meetWith: mongoose.Types.ObjectId;
  purpose: string; status: string;
  scheduledTime?: Date; fromTime?: string; toTime?: string;
  duration?: string; qrToken?: string; checkoutTime?: Date;
}
const VisitSchema = new Schema<IVisit>({
  visitor: { type: Schema.Types.ObjectId, ref: 'Visitor', required: true },
  meetWith: { type: Schema.Types.ObjectId, ref: 'VmsUser', required: true },
  purpose: { type: String, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending','Approved','Rejected','CheckedOut'] },
  scheduledTime: Date, fromTime: String, toTime: String,
  duration: String, qrToken: String, checkoutTime: Date,
}, { timestamps: true });
export const Visit = mongoose.model<IVisit>('Visit', VisitSchema);

export interface IVmsUser extends Document {
  name: string; email: string; password: string;
  role: string; isActive: boolean;
  department?: mongoose.Types.ObjectId;
  designation?: mongoose.Types.ObjectId;
}
const VmsUserSchema = new Schema<IVmsUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Employee', enum: ['Admin','Employee','Security'] },
  isActive: { type: Boolean, default: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department' },
  designation: { type: Schema.Types.ObjectId, ref: 'Designation' },
}, { timestamps: true });
export const VmsUser = mongoose.model<IVmsUser>('VmsUser', VmsUserSchema);

export interface IDepartment extends Document { name: string; code?: string; }
const DepartmentSchema = new Schema<IDepartment>({ name: { type: String, required: true }, code: String }, { timestamps: true });
export const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);

export interface IDesignation extends Document { name: string; level?: string; }
const DesignationSchema = new Schema<IDesignation>({ name: { type: String, required: true }, level: String }, { timestamps: true });
export const Designation = mongoose.model<IDesignation>('Designation', DesignationSchema);
