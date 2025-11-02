import express from 'express';
import {
  getAll,
  getById,
  create,
  update,
  deleteQuestion,
} from '../controllers/questionController';
import { authenticate, isTeacher } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Lấy danh sách câu hỏi
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số items mỗi trang
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tiêu đề hoặc nội dung
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         description: Lọc theo môn học
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *         description: Lọc theo độ khó
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, title, subject, difficulty]
 *           default: createdAt
 *         description: Sắp xếp theo
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Thứ tự sắp xếp
 *     responses:
 *       200:
 *         description: Danh sách câu hỏi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Question'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 filters:
 *                   type: object
 *                   properties:
 *                     subjects:
 *                       type: array
 *                       items:
 *                         type: string
 *                     difficulties:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.get('/', authenticate, getAll);

/**
 * @swagger
 * /questions/{id}:
 *   get:
 *     summary: Lấy thông tin câu hỏi theo ID
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của câu hỏi
 *     responses:
 *       200:
 *         description: Thông tin câu hỏi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       404:
 *         description: Không tìm thấy câu hỏi
 */
router.get('/:id', authenticate, getById);

/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Tạo câu hỏi mới
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - questionText
 *               - options
 *               - correctAnswer
 *               - subject
 *             properties:
 *               title:
 *                 type: string
 *                 example: Câu hỏi toán học
 *               questionText:
 *                 type: string
 *                 example: 2 + 2 = ?
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['2', '3', '4', '5']
 *                 minItems: 2
 *                 maxItems: 6
 *               correctAnswer:
 *                 type: integer
 *                 description: Index của đáp án đúng (0-based)
 *                 example: 2
 *               subject:
 *                 type: string
 *                 example: Toán học
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *                 default: medium
 *     responses:
 *       201:
 *         description: Tạo câu hỏi thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       403:
 *         description: Chỉ giáo viên mới được tạo câu hỏi
 */
router.post('/', authenticate, isTeacher, create);

/**
 * @swagger
 * /questions/{id}:
 *   put:
 *     summary: Cập nhật câu hỏi
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               questionText:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               correctAnswer:
 *                 type: integer
 *               subject:
 *                 type: string
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       403:
 *         description: Không có quyền chỉnh sửa câu hỏi này
 *       404:
 *         description: Không tìm thấy câu hỏi
 */
router.put('/:id', authenticate, isTeacher, update);

/**
 * @swagger
 * /questions/{id}:
 *   delete:
 *     summary: Xóa câu hỏi
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       403:
 *         description: Không có quyền xóa câu hỏi này
 *       404:
 *         description: Không tìm thấy câu hỏi
 */
router.delete('/:id', authenticate, isTeacher, deleteQuestion);

export default router;