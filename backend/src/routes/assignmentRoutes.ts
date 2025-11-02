/**
 * @swagger
 * /assignments:
 *   post:
 *     summary: Tạo assignment mới
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quizId
 *               - assignedTo
 *               - dueDate
 *             properties:
 *               quizId:
 *                 type: string
 *                 description: ID của quiz
 *               assignedTo:
 *                 type: string
 *                 description: ID của học sinh
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Hạn nộp bài
 *     responses:
 *       201:
 *         description: Tạo assignment thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Assignment'
 *       400:
 *         description: Dữ liệu không hợp lệ
 */