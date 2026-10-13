import mongoose, { Schema, Document } from 'mongoose';

export interface IPermission extends Document {
  name: string; 
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema = new Schema<IPermission>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IPermission>('Permission', PermissionSchema);
