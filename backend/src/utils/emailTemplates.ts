export const emailTemplates = {
  assignmentCreated: (data: {
    studentName: string;
    quizTitle: string;
    subject: string;
    dueDate: string;
    teacherName: string;
  }) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1976d2; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📚 Bài tập mới được giao</h1>
            </div>
            <div class="content">
              <p>Xin chào <strong>${data.studentName}</strong>,</p>
              <p>Bạn đã được giao một bài quiz mới:</p>
              <ul>
                <li><strong>Quiz:</strong> ${data.quizTitle}</li>
                <li><strong>Môn học:</strong> ${data.subject}</li>
                <li><strong>Người giao:</strong> ${data.teacherName}</li>
                <li><strong>Hạn nộp:</strong> ${data.dueDate}</li>
              </ul>
              <p>Vui lòng đăng nhập vào hệ thống để làm bài.</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/my-assignments" class="button">
                Xem bài tập
              </a>
            </div>
            <div class="footer">
              <p>Đây là email tự động từ hệ thống Online Quiz System. Vui lòng không trả lời email này.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  assignmentReminder: (data: {
    studentName: string;
    quizTitle: string;
    subject: string;
    dueDate: string;
    hoursLeft: number;
  }) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #ff9800; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .warning { background-color: #fff3cd; border-left: 4px solid #ff9800; padding: 15px; margin: 15px 0; }
            .button { display: inline-block; padding: 10px 20px; background-color: #ff9800; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Nhắc nhở: Bài tập sắp hết hạn</h1>
            </div>
            <div class="content">
              <p>Xin chào <strong>${data.studentName}</strong>,</p>
              <div class="warning">
                <p><strong>Cảnh báo:</strong> Bài quiz của bạn sắp hết hạn!</p>
                <ul>
                  <li><strong>Quiz:</strong> ${data.quizTitle}</li>
                  <li><strong>Môn học:</strong> ${data.subject}</li>
                  <li><strong>Hạn nộp:</strong> ${data.dueDate}</li>
                  <li><strong>Còn lại:</strong> ${data.hoursLeft} giờ</li>
                </ul>
              </div>
              <p>Vui lòng hoàn thành bài quiz trước khi hết hạn.</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/my-assignments" class="button">
                Làm bài ngay
              </a>
            </div>
            <div class="footer">
              <p>Đây là email tự động từ hệ thống Online Quiz System. Vui lòng không trả lời email này.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  quizSubmitted: (data: {
    studentName: string;
    quizTitle: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
  }) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4caf50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .score { text-align: center; font-size: 48px; font-weight: bold; color: #4caf50; margin: 20px 0; }
            .button { display: inline-block; padding: 10px 20px; background-color: #4caf50; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Đã nộp bài thành công</h1>
            </div>
            <div class="content">
              <p>Xin chào <strong>${data.studentName}</strong>,</p>
              <p>Bạn đã nộp bài quiz thành công:</p>
              <ul>
                <li><strong>Quiz:</strong> ${data.quizTitle}</li>
                <li><strong>Số câu đúng:</strong> ${data.correctAnswers} / ${data.totalQuestions}</li>
              </ul>
              <div class="score">${data.score.toFixed(1)}%</div>
              <p>Bạn có thể xem chi tiết kết quả trong hệ thống.</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/my-results" class="button">
                Xem kết quả
              </a>
            </div>
            <div class="footer">
              <p>Đây là email tự động từ hệ thống Online Quiz System. Vui lòng không trả lời email này.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  assignmentExpired: (data: {
    studentName: string;
    quizTitle: string;
    subject: string;
  }) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .warning { background-color: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1⚠️ Bài tập đã hết hạn</h1>
            </div>
            <div class="content">
              <p>Xin chào <strong>${data.studentName}</strong>,</p>
              <div class="warning">
                <p>Rất tiếc, bài quiz của bạn đã hết hạn:</p>
                <ul>
                  <li><strong>Quiz:</strong> ${data.quizTitle}</li>
                  <li><strong>Môn học:</strong> ${data.subject}</li>
                </ul>
              </div>
              <p>Bạn không thể nộp bài này nữa. Vui lòng liên hệ giáo viên nếu có vấn đề.</p>
            </div>
            <div class="footer">
              <p>Đây là email tự động từ hệ thống Online Quiz System. Vui lòng không trả lời email này.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },
};
