import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string; // admin | operador | usuario
  permissions: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Permission'
      }
    ]
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IRole>('Role', RoleSchema);
