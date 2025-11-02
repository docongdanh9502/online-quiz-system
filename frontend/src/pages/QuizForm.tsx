import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Autocomplete,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { quizAPI, Quiz } from '../services/quizAPI';
import { questionAPI, Question } from '../services/questionAPI';
import Layout from '../components/Layout';
import RoleGuard from '../components/RoleGuard';

const QuizForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    timeLimit: 60,
  });

  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailableQuestions();
    if (isEditMode && id) {
      fetchQuiz();
    }
  }, [id, isEditMode, filterSubject]);

  const fetchQuiz = async () => {
    setLoadingQuiz(true);
    try {
      const quiz = await quizAPI.getById(id!);
      setFormData({
        title: quiz.title,
        description: quiz.description || '',
        subject: quiz.subject,
        timeLimit: quiz.timeLimit,
      });
      setSelectedQuestions(quiz.questions.map((q: any) => q._id || q));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải quiz');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const fetchAvailableQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const params: any = { limit: 100 };
      if (filterSubject) params.subject = filterSubject;
      if (searchTerm) params.search = searchTerm;

      const response = await questionAPI.getAll(params);
      setAvailableQuestions(response.questions);
    } catch (err: any) {
      console.error('Lỗi khi tải câu hỏi:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchAvailableQuestions();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleQuestion = (questionId: string) => {
    setSelectedQuestions((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const removeQuestion = (questionId: string) => {
    setSelectedQuestions((prev) => prev.filter((id) => id !== questionId));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề');
      return false;
    }

    if (!formData.subject) {
      setError('Vui lòng chọn môn học');
      return false;
    }

    if (formData.timeLimit < 1) {
      setError('Thời gian làm bài phải lớn hơn 0 phút');
      return false;
    }

    if (selectedQuestions.length === 0) {
      setError('Quiz phải có ít nhất 1 câu hỏi');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const quizData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        subject: formData.subject,
        timeLimit: formData.timeLimit,
        questions: selectedQuestions,
      };

      if (isEditMode && id) {
        await quizAPI.update(id, quizData);
      } else {
        await quizAPI.create(quizData);
      }

      navigate('/quizzes');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi lưu quiz');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedQuestionsData = () => {
    return availableQuestions.filter((q) => selectedQuestions.includes(q._id));
  };

  if (loadingQuiz) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              {isEditMode ? 'Chỉnh Sửa Quiz' : 'Tạo Quiz Mới'}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => navigate('/quizzes')}
            >
              Hủy
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tiêu đề quiz"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Môn học</InputLabel>
                  <Select
                    value={formData.subject}
                    label="Môn học"
                    onChange={(e) => {
                      handleChange('subject', e.target.value);
                      setFilterSubject(e.target.value);
                    }}
                  >
                    <MenuItem value="Math">Toán</MenuItem>
                    <MenuItem value="Physics">Vật Lý</MenuItem>
                    <MenuItem value="Chemistry">Hóa Học</MenuItem>
                    <MenuItem value="Programming">Lập Trình</MenuItem>
                    <MenuItem value="English">Tiếng Anh</MenuItem>
                    <MenuItem value="History">Lịch Sử</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Thời gian làm bài (phút)"
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => handleChange('timeLimit', parseInt(e.target.value) || 0)}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Chọn câu hỏi ({selectedQuestions.length} đã chọn)
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    label="Tìm kiếm câu hỏi"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ flexGrow: 1 }}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Lọc theo môn</InputLabel>
                    <Select
                      value={filterSubject}
                      label="Lọc theo môn"
                      onChange={(e) => setFilterSubject(e.target.value)}
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      <MenuItem value="Math">Toán</MenuItem>
                      <MenuItem value="Physics">Vật Lý</MenuItem>
                      <MenuItem value="Chemistry">Hóa Học</MenuItem>
                      <MenuItem value="Programming">Lập Trình</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto', p: 1 }}>
                  {loadingQuestions ? (
                    <Box display="flex" justifyContent="center" p={2}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : availableQuestions.length === 0 ? (
                    <Box p={2} textAlign="center">
                      <Typography variant="body2" color="text.secondary">
                        Không có câu hỏi nào
                      </Typography>
                    </Box>
                  ) : (
                    <List>
                      {availableQuestions.map((question) => (
                        <ListItem
                          key={question._id}
                          sx={{
                            border: '1px solid',
                            borderColor: selectedQuestions.includes(question._id)
                              ? 'primary.main'
                              : 'divider',
                            borderRadius: 1,
                            mb: 1,
                            backgroundColor: selectedQuestions.includes(question._id)
                              ? 'primary.light'
                              : 'background.paper',
                          }}
                        >
                          <Checkbox
                            checked={selectedQuestions.includes(question._id)}
                            onChange={() => toggleQuestion(question._id)}
                          />
                          <ListItemText
                            primary={question.title}
                            secondary={
                              <Box>
                                <Typography variant="caption" display="block">
                                  {question.questionText.substring(0, 100)}...
                                </Typography>
                                <Box sx={{ mt: 0.5, display: 'flex', gap: 1 }}>
                                  <Chip label={question.subject} size="small" />
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
                                  />
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Câu hỏi đã chọn ({selectedQuestions.length})
                </Typography>
                {getSelectedQuestionsData().length === 0 ? (
                  <Alert severity="info">Chưa chọn câu hỏi nào</Alert>
                ) : (
                  <Grid container spacing={2}>
                    {getSelectedQuestionsData().map((question) => (
                      <Grid item xs={12} md={6} key={question._id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="subtitle2" gutterBottom>
                                {question.title}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => removeQuestion(question._id)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {question.questionText}
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                              <Chip label={question.subject} size="small" />
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
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/quizzes')}
                    disabled={loading}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
};
import ImageUpload from '../components/ImageUpload';

// Thêm state
const [quizImage, setQuizImage] = useState<string>('');

// Trong form, thêm ImageUpload component (sau description field)
<ImageUpload
  currentImage={quizImage}
  onUploadSuccess={(imagePath) => {
    setQuizImage(imagePath);
    if (quiz) {
      setFormData({ ...formData, image: imagePath });
    }
  }}
  onDelete={() => {
    setQuizImage('');
    if (quiz) {
      setFormData({ ...formData, image: '' });
    }
  }}
  quizId={quiz?._id}
  label="Upload ảnh đại diện cho quiz"
  maxSizeMB={5}
/>



export default QuizForm;
