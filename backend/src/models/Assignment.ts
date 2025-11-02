import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignment extends Document {
  quiz: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    quiz: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'expired'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

assignmentSchema.index({ assignedTo: 1 });
assignmentSchema.index({ quiz: 1 });
assignmentSchema.index({ status: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ assignedTo: 1, status: 1 });

export default mongoose.model<IAssignment>('Assignment', assignmentSchema);