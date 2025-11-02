import { Chip } from '@mui/material';
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
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { questionAPI, Question } from '../services/questionAPI';
import Layout from '../components/Layout';
import RoleGuard from '../components/RoleGuard';

const QuestionForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    questionText: '',
    subject: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    options: ['', ''],
    correctAnswer: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      fetchQuestion();
    }
  }, [id, isEditMode]);

  const fetchQuestion = async () => {
    setLoadingQuestion(true);
    try {
      const question = await questionAPI.getById(id!);
      setFormData({
        title: question.title,
        questionText: question.questionText,
        subject: question.subject,
        difficulty: question.difficulty,
        options: question.options,
        correctAnswer: question.correctAnswer,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải câu hỏi');
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData((prev) => ({ ...prev, options: [...prev.options, ''] }));
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      const newCorrectAnswer =
        formData.correctAnswer >= newOptions.length
          ? newOptions.length - 1
          : formData.correctAnswer < index
          ? formData.correctAnswer
          : formData.correctAnswer - 1;
      setFormData((prev) => ({
        ...prev,
        options: newOptions,
        correctAnswer: newCorrectAnswer,
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề');
      return false;
    }

    if (!formData.questionText.trim()) {
      setError('Vui lòng nhập nội dung câu hỏi');
      return false;
    }

    if (!formData.subject) {
      setError('Vui lòng chọn môn học');
      return false;
    }

    const validOptions = formData.options.filter((opt) => opt.trim() !== '');
    if (validOptions.length < 2) {
      setError('Câu hỏi phải có ít nhất 2 đáp án');
      return false;
    }

    if (formData.correctAnswer < 0 || formData.correctAnswer >= validOptions.length) {
      setError('Vui lòng chọn đáp án đúng');
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
      const validOptions = formData.options.filter((opt) => opt.trim() !== '');
      const correctAnswerIndex = validOptions.findIndex(
        (_, index) => index === formData.correctAnswer
      );

      const questionData = {
        title: formData.title.trim(),
        questionText: formData.questionText.trim(),
        subject: formData.subject,
        difficulty: formData.difficulty,
        options: validOptions,
        correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : formData.correctAnswer,
      };

      if (isEditMode && id) {
        await questionAPI.update(id, questionData);
      } else {
        await questionAPI.create(questionData);
      }

      navigate('/questions');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi lưu câu hỏi');
    } finally {
      setLoading(false);
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

  if (loadingQuestion) {
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
              {isEditMode ? 'Chỉnh Sửa Câu Hỏi' : 'Tạo Câu Hỏi Mới'}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => navigate('/questions')}
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
                  label="Tiêu đề"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                  inputProps={{ maxLength: 200 }}
                  helperText={`${formData.title.length}/200 ký tự`}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nội dung câu hỏi"
                  value={formData.questionText}
                  onChange={(e) => handleChange('questionText', e.target.value)}
                  multiline
                  rows={4}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Môn học</InputLabel>
                  <Select
                    value={formData.subject}
                    label="Môn học"
                    onChange={(e) => handleChange('subject', e.target.value)}
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
                <FormControl fullWidth required>
                  <InputLabel>Độ khó</InputLabel>
                  <Select
                    value={formData.difficulty}
                    label="Độ khó"
                    onChange={(e) => handleChange('difficulty', e.target.value)}
                  >
                    <MenuItem value="easy">Dễ</MenuItem>
                    <MenuItem value="medium">Trung bình</MenuItem>
                    <MenuItem value="hard">Khó</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Đáp án
                </Typography>
                {formData.options.map((option, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                    <Radio
                      checked={formData.correctAnswer === index}
                      onChange={() => handleChange('correctAnswer', index)}
                      value={index}
                    />
                    <TextField
                      fullWidth
                      label={`Đáp án ${String.fromCharCode(65 + index)}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      required
                    />
                    {formData.options.length > 2 && (
                      <IconButton
                        color="error"
                        onClick={() => removeOption(index)}
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}

                {formData.options.length < 6 && (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addOption}
                    variant="outlined"
                    sx={{ mt: 1 }}
                  >
                    Thêm đáp án
                  </Button>
                )}
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Preview
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>{formData.title || 'Tiêu đề câu hỏi'}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {formData.questionText || 'Nội dung câu hỏi...'}
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Chip
                        label={formData.subject || 'Môn học'}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={getDifficultyLabel(formData.difficulty)}
                        color={
                          formData.difficulty === 'easy'
                            ? 'success'
                            : formData.difficulty === 'medium'
                            ? 'warning'
                            : 'error'
                        }
                        size="small"
                      />
                    </Box>
                    {formData.options
                      .filter((opt) => opt.trim() !== '')
                      .map((option, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 1,
                            mb: 1,
                            backgroundColor:
                              index === formData.correctAnswer ? 'success.light' : 'grey.100',
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body2">
                            {String.fromCharCode(65 + index)}. {option || `Đáp án ${index + 1}`}
                            {index === formData.correctAnswer && (
                              <Chip label="Đúng" color="success" size="small" sx={{ ml: 1 }} />
                            )}
                          </Typography>
                        </Box>
                      ))}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/questions')}
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

export default QuestionForm;