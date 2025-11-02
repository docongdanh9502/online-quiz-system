import React, { useState, useEffect } from 'react';
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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { questionAPI, Question } from '../services/questionAPI';
import Layout from '../components/Layout';
import RoleGuard from '../components/RoleGuard';

const Questions: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {
        page: page + 1,
        limit,
      };

      if (search) params.search = search;
      if (filterSubject) params.subject = filterSubject;
      if (filterDifficulty) params.difficulty = filterDifficulty;

      const response = await questionAPI.getAll(params);
      setQuestions(response.questions);
      setTotal(response.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [page, limit, search, filterSubject, filterDifficulty]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
      return;
    }

    try {
      await questionAPI.delete(id);
      fetchQuestions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi xóa câu hỏi');
    }
  };

  const handleView = async (id: string) => {
    try {
      const question = await questionAPI.getById(id);
      setSelectedQuestion(question);
      setViewDialogOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi tải câu hỏi');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Dễ';
      case 'medium':
        return 'Trung bình';
      case 'hard':
        return 'Khó';
      default:
        return difficulty;
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ padding: 3, marginTop: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Quản Lý Câu Hỏi
            </Typography>
            <RoleGuard allowedRoles={['teacher', 'admin']}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/questions/create')}
              >
                Tạo Câu Hỏi
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
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Độ khó</InputLabel>
              <Select
                value={filterDifficulty}
                label="Độ khó"
                onChange={(e) => setFilterDifficulty(e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="easy">Dễ</MenuItem>
                <MenuItem value="medium">Trung bình</MenuItem>
                <MenuItem value="hard">Khó</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Môn học</TableCell>
                  <TableCell>Độ khó</TableCell>
                  <TableCell>Người tạo</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : questions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Không có câu hỏi nào
                    </TableCell>
                  </TableRow>
                ) : (
                  questions.map((question) => (
                    <TableRow key={question._id}>
                      <TableCell>{question.title}</TableCell>
                      <TableCell>{question.subject}</TableCell>
                      <TableCell>
                        <Chip
                          label={getDifficultyLabel(question.difficulty)}
                          color={getDifficultyColor(question.difficulty) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{question.createdBy?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {new Date(question.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleView(question._id)}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <RoleGuard allowedRoles={['teacher', 'admin']}>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/questions/edit/${question._id}`)}
                            color="warning"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(question._id)}
                            color="error"
                          >
                            <DeleteIcon />
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

        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedQuestion?.title}
            <Chip
              label={selectedQuestion ? getDifficultyLabel(selectedQuestion.difficulty) : ''}
              color={
                selectedQuestion
                  ? (getDifficultyColor(selectedQuestion.difficulty) as any)
                  : 'default'
              }
              size="small"
              sx={{ ml: 2 }}
            />
          </DialogTitle>
          <DialogContent>
            {selectedQuestion && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  <strong>Môn học:</strong> {selectedQuestion.subject}
                </Typography>
                <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
                  <strong>Câu hỏi:</strong>
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedQuestion.questionText}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Đáp án:</strong>
                </Typography>
                {selectedQuestion.options.map((option, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 1,
                      mb: 1,
                      backgroundColor:
                        index === selectedQuestion.correctAnswer
                          ? 'success.light'
                          : 'grey.100',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2">
                      {String.fromCharCode(65 + index)}. {option}
                      {index === selectedQuestion.correctAnswer && (
                        <Chip label="Đúng" color="success" size="small" sx={{ ml: 1 }} />
                      )}
                    </Typography>
                  </Box>
                ))}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Người tạo: {selectedQuestion.createdBy?.name || 'N/A'}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Đóng</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};
onClick={() => navigate(`/questions/edit/${question._id}`)}
export default Questions;
