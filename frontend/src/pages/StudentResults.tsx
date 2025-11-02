import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Grid,
  Card,
  CardContent,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
} from '@mui/material';
import { analyticsAPI, StudentResultsResponse } from '../services/analyticsAPI';
import { quizAPI } from '../services/quizAPI';

const StudentResults: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StudentResultsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [selectedQuiz, setSelectedQuiz] = useState<string>('');
  const [quizzes, setQuizzes] = useState<any[]>([]);

  useEffect(() => {
    fetchQuizzes();
    fetchResults();
  }, [page, selectedQuiz]);

  const fetchQuizzes = async () => {
    try {
      const response = await quizAPI.getAll({ limit: 100 });
      setQuizzes(response.quizzes || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách quiz:', error);
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (selectedQuiz) params.quizId = selectedQuiz;
      
      const response = await analyticsAPI.getStudentResults(params);
      setData(response);
    } catch (error) {
      console.error('Lỗi khi tải kết quả:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'info';
    if (score >= 40) return 'warning';
    return 'error';
  };

  if (loading && !data) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Kết quả của tôi
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Tổng số bài làm
              </Typography>
              <Typography variant="h4">
                {data?.summary.totalQuizzes || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Điểm trung bình
              </Typography>
              <Typography variant="h4">
                {data?.summary.averageScore.toFixed(1) || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Điểm cao nhất
              </Typography>
              <Typography variant="h4" color="success.main">
                {data?.summary.highestScore.toFixed(1) || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Điểm thấp nhất
              </Typography>
              <Typography variant="h4" color="error.main">
                {data?.summary.lowestScore.toFixed(1) || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 2 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Lọc theo Quiz</InputLabel>
          <Select
            value={selectedQuiz}
            onChange={(e) => {
              setSelectedQuiz(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {quizzes.map((quiz) => (
              <MenuItem key={quiz._id} value={quiz._id}>
                {quiz.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Quiz</TableCell>
              <TableCell>Môn học</TableCell>
              <TableCell>Điểm số</TableCell>
              <TableCell>Thời gian làm</TableCell>
              <TableCell>Ngày nộp</TableCell>
              <TableCell>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.results.map((result) => (
              <TableRow key={result._id}>
                <TableCell>{result.quiz.title}</TableCell>
                <TableCell>{result.quiz.subject}</TableCell>
                <TableCell>
                  <Chip
                    label={`${result.score.toFixed(1)}%`}
                    color={getScoreColor(result.score) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {Math.floor(result.timeSpent)} phút
                </TableCell>
                <TableCell>
                  {result.submittedAt
                    ? new Date(result.submittedAt).toLocaleString('vi-VN')
                    : 'Chưa nộp'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={result.submittedAt ? 'Hoàn thành' : 'Đang làm'}
                    color={result.submittedAt ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {data && data.pagination.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={data.pagination.pages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
};

export default StudentResults;