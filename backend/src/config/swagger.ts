import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Online Quiz System API',
      version: '1.0.0',
      description: 'API documentation cho hệ thống thi trắc nghiệm trực tuyến',
      contact: {
        name: 'API Support',
        email: 'support@quizsystem.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000/api',
        description: 'Development server',
      },
      {
        url: 'https://api.quizsystem.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Nhập JWT token với Bearer prefix',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email của user',
            },
            name: {
              type: 'string',
              description: 'Tên của user',
            },
            role: {
              type: 'string',
              enum: ['student', 'teacher', 'admin'],
              description: 'Vai trò của user',
            },
            avatar: {
              type: 'string',
              description: 'Đường dẫn avatar',
            },
            isActive: {
              type: 'boolean',
              description: 'Trạng thái hoạt động',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Question: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            title: {
              type: 'string',
              description: 'Tiêu đề câu hỏi',
            },
            questionText: {
              type: 'string',
              description: 'Nội dung câu hỏi',
            },
            options: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Các đáp án',
            },
            correctAnswer: {
              type: 'integer',
              description: 'Index của đáp án đúng',
            },
            subject: {
              type: 'string',
              description: 'Môn học',
            },
            difficulty: {
              type: 'string',
              enum: ['easy', 'medium', 'hard'],
              description: 'Độ khó',
            },
            createdBy: {
              $ref: '#/components/schemas/User',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Quiz: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            title: {
              type: 'string',
              description: 'Tiêu đề quiz',
            },
            description: {
              type: 'string',
              description: 'Mô tả quiz',
            },
            subject: {
              type: 'string',
              description: 'Môn học',
            },
            timeLimit: {
              type: 'integer',
              description: 'Thời gian làm bài (phút)',
            },
            questions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Question',
              },
            },
            image: {
              type: 'string',
              description: 'Đường dẫn ảnh',
            },
            createdBy: {
              $ref: '#/components/schemas/User',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Assignment: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            quiz: {
              $ref: '#/components/schemas/Quiz',
            },
            assignedTo: {
              $ref: '#/components/schemas/User',
            },
            assignedBy: {
              $ref: '#/components/schemas/User',
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Hạn nộp bài',
            },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'completed', 'expired'],
              description: 'Trạng thái',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        QuizResult: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            quiz: {
              $ref: '#/components/schemas/Quiz',
            },
            student: {
              $ref: '#/components/schemas/User',
            },
            answers: {
              type: 'array',
              items: {
                type: 'integer',
              },
              description: 'Các đáp án đã chọn',
            },
            score: {
              type: 'number',
              description: 'Điểm số (0-100)',
            },
            startedAt: {
              type: 'string',
              format: 'date-time',
            },
            submittedAt: {
              type: 'string',
              format: 'date-time',
            },
            timeSpent: {
              type: 'integer',
              description: 'Thời gian làm bài (phút)',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Thông báo lỗi',
            },
            error: {
              type: 'string',
              description: 'Chi tiết lỗi',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              description: 'Trang hiện tại',
            },
            limit: {
              type: 'integer',
              description: 'Số items mỗi trang',
            },
            total: {
              type: 'integer',
              description: 'Tổng số items',
            },
            pages: {
              type: 'integer',
              description: 'Tổng số trang',
            },
            hasNext: {
              type: 'boolean',
              description: 'Có trang tiếp theo',
            },
            hasPrev: {
              type: 'boolean',
              description: 'Có trang trước',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Xác thực và đăng nhập',
      },
      {
        name: 'Questions',
        description: 'Quản lý câu hỏi',
      },
      {
        name: 'Quizzes',
        description: 'Quản lý quiz',
      },
      {
        name: 'Assignments',
        description: 'Quản lý bài tập',
      },
      {
        name: 'Quiz Results',
        description: 'Kết quả làm bài',
      },
      {
        name: 'Analytics',
        description: 'Thống kê và phân tích',
      },
      {
        name: 'Upload',
        description: 'Upload files',
      },
      {
        name: 'Admin',
        description: 'Quản trị viên',
      },
      {
        name: 'Teacher',
        description: 'Giáo viên',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;