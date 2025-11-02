export interface IQuiz extends Document {
  title: string;
  description?: string;
  subject: string;
  timeLimit: number;
  questions: mongoose.Types.ObjectId[];
  image?: string; // Thêm field này
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const quizSchema = new Schema<IQuiz>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    timeLimit: {
      type: Number,
      required: true,
      min: 1,
    },
    questions: {
      type: [Schema.Types.ObjectId],
      ref: 'Question',
      required: true,
      validate: {
        validator: (questions: mongoose.Types.ObjectId[]) => questions.length > 0,
        message: 'Quiz phải có ít nhất 1 câu hỏi',
      },
    },
    image: String, // Thêm field này
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