import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion extends Document {
  title: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (options: string[]) => options.length >= 2 && options.length <= 6,
        message: 'Câu hỏi phải có từ 2 đến 6 đáp án',
      },
    },
    correctAnswer: {
      type: Number,
      required: true,
      validate: {
        validator: function (this: IQuestion, value: number) {
          return value >= 0 && value < this.options.length;
        },
        message: 'Đáp án đúng phải là index hợp lệ trong mảng options',
      },
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.index({ subject: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ createdBy: 1 });

export default mongoose.model<IQuestion>('Question', questionSchema);