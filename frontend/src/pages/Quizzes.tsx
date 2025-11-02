// src/pages/Quizzes.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { quizAPI, Quiz } from '../services/quizAPI';
import Layout from '../components/Layout';
import RoleGuard from '../components/RoleGuard';
import AssignQuizDialog from '../components/AssignQuizDialog';

const Quizzes: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // State cho Assign
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedQuizForAssign, setSelectedQuizForAssign] = useState<{ id: string; title: string } | null>(null);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {
        page: page + 1,
        limit,
      };

      if (search) params.search = search;
      if (filterSubject) params.subject = filterSubject;

      const response = await quizAPI.getAll(params);
      setQuizzes(response.quizzes);
      setTotal(response.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách quiz');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, filterSubject]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa quiz này?')) {
      return;
    }

    try {
      await quizAPI.delete(id);
      fetchQuizzes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi xóa quiz');
    }
  };

  const handleView = async (id: string) => {
    try {
      const quiz = await quizAPI.getById(id);
      setSelectedQuiz(quiz);
      setViewDialogOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi tải quiz');
    }
  };

  const handleAssign = (quiz: Quiz) => {
    setSelectedQuizForAssign({ id: quiz._id, title: quiz.title });
    setAssignDialogOpen(true);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}phút`;
    }
    return `${mins} phút`;
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ padding: 3, marginTop: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Danh Sách Bài Thi
            </Typography>
            <RoleGuard allowedRoles={['teacher', 'admin']}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/quizzes/create')}
              >
                Tạo Quiz
              </Button>
            </RoleGuard>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="Tìm kiếm"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Môn học</InputLabel>
              <Select
                value={filterSubject}
                label="Môn học"
                onChange={(e) => setFilterSubject(e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="Math">Toán</MenuItem>
                <MenuItem value="Physics">Vật Lý</MenuItem>
                <MenuItem value="Chemistry">Hóa Học</MenuItem>
                <MenuItem value="Programming">Lập Trình</MenuItem>
                <MenuItem value="English">Tiếng Anh</MenuItem>
                <MenuItem value="History">Lịch Sử</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Môn học</TableCell>
                  <TableCell>Số câu hỏi</TableCell>
                  <TableCell>Thời gian</TableCell>
                  <TableCell>Người tạo</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : quizzes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Không có quiz nào
                    </TableCell>
                  </TableRow>
                ) : (
                  quizzes.map((quiz) => (
                    <TableRow key={quiz._id}>
                      <TableCell>{quiz.title}</TableCell>
                      <TableCell>{quiz.subject}</TableCell>
                      <TableCell>{quiz.questions?.length || 0}</TableCell>
                      <TableCell>{formatTime(quiz.timeLimit)}</TableCell>
                      <TableCell>{quiz.createdBy?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {new Date(quiz.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleView(quiz._id)}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/quizzes/${quiz._id}/start`)}
                          color="success"
                        >
                          <PlayArrowIcon />
                        </IconButton>
                        <RoleGuard allowedRoles={['teacher', 'admin']}>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/quizzes/edit/${quiz._id}`)}
                            color="warning"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(quiz._id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                          {/* Nút Assign */}
                          <IconButton
                            size="small"
                            onClick={() => handleAssign(quiz)}
                            color="primary"
                            title="Giao bài thi"
                          >
                            <AssignmentIcon />
                          </IconButton>
                        </RoleGuard>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={limit}
            onRowsPerPageChange={(e) => {
              setLimit(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>

        {/* Dialog xem chi tiết */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedQuiz?.title}
            <Chip label={selectedQuiz?.subject} size="small" sx={{ ml: 2 }} />
          </DialogTitle>
          <DialogContent>
            {selectedQuiz && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  <strong>Mô tả:</strong> {selectedQuiz.description || 'Không có mô tả'}
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Số câu hỏi:</strong> {selectedQuiz.questions?.length || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Thời gian:</strong> {formatTime(selectedQuiz.timeLimit)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Người tạo:</strong> {selectedQuiz.createdBy?.name || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Ngày tạo:</strong>{' '}
                      {new Date(selectedQuiz.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Grid>
                </Grid>
                {selectedQuiz.questions && selectedQuiz.questions.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Danh sách câu hỏi:
                    </Typography>
                    {selectedQuiz.questions.map((question: any, index: number) => (
                      <Card key={index} variant="outlined" sx={{ mb: 1 }}>
                        <CardContent>
                          <Typography variant="body2">
                            <strong>Câu {index + 1}:</strong> {question.title || question.questionText}
                          </Typography>
                          {question.subject && (
                            <Chip
                              label={question.subject}
                              size="small"
                              sx={{ mt: 1, mr: 1 }}
                            />
                          )}
                          {question.difficulty && (
                            <Chip
                              label={
                                question.difficulty === 'easy'
                                  ? 'Dễ'
                                  : question.difficulty === 'medium'
                                  ? 'Trung bình'
                                  : 'Khó'
                              }
                              color={
                                question.difficulty === 'easy'
                                  ? 'success'
                                  : question.difficulty === 'medium'
                                  ? 'warning'
                                  : 'error'
                              }
                              size="small"
                              sx={{ mt: 1 }}
                            />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Đóng</Button>
            <Button
              variant="contained"
              onClick={() => {
                setViewDialogOpen(false);
                if (selectedQuiz) {
                  navigate(`/quizzes/${selectedQuiz._id}/start`);
                }
              }}
            >
              Làm Bài
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Assign Quiz */}
        <AssignQuizDialog
          open={assignDialogOpen}
          onClose={() => {
            setAssignDialogOpen(false);
            setSelectedQuizForAssign(null);
          }}
          quizId={selectedQuizForAssign?.id || ''}
          quizTitle={selectedQuizForAssign?.title || ''}
          onSuccess={() => {
            fetchQuizzes();
          }}
        />
      </Container>
    </Layout>
  );
};

export default Quizzes;
