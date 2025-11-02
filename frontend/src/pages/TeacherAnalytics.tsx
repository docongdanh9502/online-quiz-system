import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { analyticsAPI, TeacherAnalyticsResponse } from '../services/analyticsAPI';
import { useNavigate } from 'react-router-dom';

const TeacherAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TeacherAnalyticsResponse | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await analyticsAPI.getTeacherAnalytics();
      setData(response);
    } catch (error) {
      console.error('Lỗi khi tải analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Thống kê của tôi
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Tổng số Quiz
              </Typography>
              <Typography variant="h4">{data.stats.totalQuizzes}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Tổng số Assignment
              </Typography>
              <Typography variant="h4">{data.stats.totalAssignments}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Tổng số lượt làm bài
              </Typography>
              <Typography variant="h4">{data.stats.totalAttempts}</Typography>
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
                {data.stats.averageScore.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top 10 Quiz phổ biến
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Quiz</TableCell>
                    <TableCell align="right">Lượt làm</TableCell>
                    <TableCell align="right">Điểm TB</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.topQuizzes.map((quiz) => (
                    <TableRow key={quiz._id} hover>
                      <TableCell>{quiz.title}</TableCell>
                      <TableCell align="right">{quiz.totalAttempts}</TableCell>
                      <TableCell align="right">
                        {quiz.averageScore ? quiz.averageScore.toFixed(1) : 0}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thống kê theo môn học
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.subjectStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalAttempts" fill="#8884d8" name="Lượt làm" />
                <Bar dataKey="totalQuizzes" fill="#82ca9d" name="Số quiz" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TeacherAnalytics;
