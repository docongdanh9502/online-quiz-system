import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizResult extends Document {
  quiz: mongoose.Types.ObjectId;
  assignment?: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  answers: number[];
  score: number;
  startedAt: Date;
  submittedAt: Date;
  timeSpent: number;
  createdAt: Date;
}

const quizResultSchema = new Schema<IQuizResult>(
  {
    quiz: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    assignment: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answers: {
      type: [Number],
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    submittedAt: {
      type: Date,
      required: true,
    },
    timeSpent: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

quizResultSchema.index({ student: 1 });
quizResultSchema.index({ quiz: 1 });
quizResultSchema.index({ assignment: 1 });
quizResultSchema.index({ student: 1, quiz: 1 });

export default mongoose.model<IQuizResult>('QuizResult', quizResultSchema);