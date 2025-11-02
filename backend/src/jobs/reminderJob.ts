import cron from 'node-cron';
import Assignment from '../models/Assignment';
import { notificationService } from '../services/notificationService';

export const startReminderJob = () => {
  // Chạy mỗi giờ một lần
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🔄 Đang kiểm tra assignments sắp hết hạn...');

      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 1 * 60 * 60 * 1000);
      const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60 * 1000);

      // Tìm assignments hết hạn trong 1-6 giờ tới và chưa completed
      const assignments = await Assignment.find({
        dueDate: { $gte: oneHourLater, $lte: sixHoursLater },
        status: { $in: ['pending', 'in_progress'] },
      });

      for (const assignment of assignments) {
        const hoursLeft = Math.ceil(
          (new Date(assignment.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60)
        );

        // Gửi reminder nếu còn 1, 3, hoặc 6 giờ
        if (hoursLeft === 1 || hoursLeft === 3 || hoursLeft === 6) {
          await notificationService.sendAssignmentReminder(
            assignment._id.toString(),
            hoursLeft
          );
        }
      }

      // Kiểm tra và update expired assignments
      const expiredAssignments = await Assignment.find({
        dueDate: { $lt: now },
        status: { $in: ['pending', 'in_progress'] },
      });

      for (const assignment of expiredAssignments) {
        assignment.status = 'expired';
        await assignment.save();
        await notificationService.sendAssignmentExpired(assignment._id.toString());
      }

      console.log(`✅ Đã kiểm tra ${assignments.length} assignments`);
    } catch (error) {
      console.error('❌ Lỗi reminder job:', error);
    }
  });

  console.log('✅ Reminder job đã được khởi động');
};
