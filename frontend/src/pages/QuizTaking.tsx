import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { ArrowBack, Save, Send } from '@mui/icons-material';
import { quizResultAPI, StartQuizResponse } from '../services/quizResultAPI';
import { quizAPI } from '../services/quizAPI';

const QuizTaking: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { assignmentId } = useParams<{ assignmentId?: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [quizData, setQuizData] = useState<StartQuizResponse | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (quizId) {
      startQuiz();
    }
  }, [quizId]);

  useEffect(() => {
    if (quizData && quizData.quiz.timeLimit > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizData]);

  const startQuiz = async () => {
    if (!quizId) return;

    setLoading(true);
    setError('');

    try {
      const response = await quizResultAPI.startQuiz({
        quizId,
        assignmentId: assignmentId || undefined,
      });

      setQuizData(response);
      setAnswers(response.quizResult.answers || []);

      if (response.canContinue) {
        const endTime = new Date(response.quizResult.startedAt).getTime() + response.quiz.timeLimit * 60000;
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeLeft(remaining);
      } else {
        setTimeLeft(response.quiz.timeLimit * 60);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi bắt đầu làm bài');
      if (err.response?.status === 403 || err.response?.status === 404) {
        setTimeout(() => navigate('/quizzes'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSave = async () => {
    if (!quizData) return;

    setSaving(true);
    try {
      await quizResultAPI.saveAnswers(quizData.quizResult._id, answers);
    } catch (err: any) {
      console.error('Lỗi khi lưu:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAutoSubmit = async () => {
    if (!quizData || submitting) return;

    setSubmitting(true);
    try {
      await quizResultAPI.submitQuiz(quizData.quizResult._id, answers);
      setShowResults(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi nộp bài');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setConfirmSubmitOpen(false);
    await handleAutoSubmit();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Đang tải quiz...</Typography>
      </Container>
    );
  }

  if (error && !quizData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/quizzes')}>
          Quay lại
        </Button>
      </Container>
    );
  }

  if (!quizData) {
    return null;
  }

  if (showResults) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Đã nộp bài thành công!
          </Typography>
          <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
            Điểm số: {quizData.quizResult.score.toFixed(1)}%
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() => navigate('/quizzes')}
          >
            Quay lại danh sách
          </Button>
        </Paper>
      </Container>
    );
  }

  const currentQuestion = quizData.quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizData.quiz.questions.length) * 100;
  const answeredCount = answers.filter((a) => a !== undefined && a !== -1).length;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">{quizData.quiz.title}</Typography>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/quizzes')}>
            Thoát
          </Button>
        </Box>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Câu {currentQuestionIndex + 1} / {quizData.quiz.questions.length}
          </Typography>
          <Typography
            variant="h6"
            color={timeLeft < 300 ? 'error' : 'primary'}
            sx={{ fontWeight: 'bold' }}
          >
           ⏱️ {formatTime(timeLeft)}
          </Typography>
        </Box>

        <LinearProgress variant="determinate" value={progress} sx={{ mb: 3, height: 8, borderRadius: 1 }} />

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {currentQuestion.questionText}
                </Typography>

                <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
                  <RadioGroup
                    value={answers[currentQuestionIndex]?.toString() || ''}
                    onChange={(e) => handleAnswerChange(currentQuestionIndex, parseInt(e.target.value))}
                  >
                    {currentQuestion.options.map((option, index) => (
                      <FormControlLabel
                        key={index}
                        value={index.toString()}
                        control={<Radio />}
                        label={option}
                        sx={{
                          mb: 1,
                          p: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Điều hướng câu hỏi
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Đã trả lời: {answeredCount} / {quizData.quiz.questions.length}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {quizData.quiz.questions.map((_, index) => (
                    <Button
                      key={index}
                      variant={index === currentQuestionIndex ? 'contained' : answers[index] !== undefined && answers[index] !== -1 ? 'outlined' : 'text'}
                      size="small"
                      onClick={() => setCurrentQuestionIndex(index)}
                      sx={{ minWidth: 40 }}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
          >
            Câu trước
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <CircularProgress size={20} /> : 'Lưu tạm'}
            </Button>

            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={() => setConfirmSubmitOpen(true)}
              disabled={submitting}
            >
              Nộp bài
            </Button>
          </Box>

          <Button
            variant="outlined"
            onClick={() => setCurrentQuestionIndex(Math.min(quizData.quiz.questions.length - 1, currentQuestionIndex + 1))}
            disabled={currentQuestionIndex === quizData.quiz.questions.length - 1}
          >
            Câu sau
          </Button>
        </Box>
      </Paper>

      <Dialog open={confirmSubmitOpen} onClose={() => setConfirmSubmitOpen(false)}>
        <DialogTitle>Xác nhận nộp bài</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn nộp bài? Sau khi nộp bạn sẽ không thể sửa đáp án.
            <br />
            <strong>Đã trả lời: {answeredCount} / {quizData.quiz.questions.length} câu</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSubmitOpen(false)}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" autoFocus>
            Xác nhận nộp
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuizTaking;
