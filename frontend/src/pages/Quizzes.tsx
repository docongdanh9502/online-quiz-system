import PlayArrowIcon from '@mui/icons-material/PlayArrow';


const handleStartQuiz = (quiz: Quiz, assignmentId?: string) => {
  if (assignmentId) {
    navigate(`/assignment/${assignmentId}/quiz/${quiz._id}/take`);
  } else {
    navigate(`/quiz/${quiz._id}/take`);
  }
};

<RoleGuard allowedRoles={['student']}>
  <IconButton
    size="small"
    onClick={() => handleStartQuiz(quiz)}
    color="primary"
  >
    <PlayArrowIcon />
  </IconButton>
</RoleGuard>


File: frontend/src/pages/MyAssignments.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Button,
  Chip,
  Box,
  IconButton,
} from '@mui/material';
import { PlayArrow } from '@mui/icons-material';
import { assignmentAPI, Assignment } from '../services/assignmentAPI';
import RoleGuard from '../components/RoleGuard';

const MyAssignments: React.FC = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await assignmentAPI.getByStudent();
      setAssignments(response.assignments || []);
    } catch (error) {
      console.error('Lỗi khi tải assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'expired':
        return 'error';
      default:
        return 'warning';
    }
  };

  const handleStartQuiz = (assignment: Assignment) => {
    navigate(`/assignment/${assignment._id}/quiz/${assignment.quiz._id}/take`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Bài tập của tôi
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Quiz</TableCell>
              <TableCell>Môn học</TableCell>
              <TableCell>Ngày hết hạn</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment._id}>
                <TableCell>{assignment.quiz.title}</TableCell>
                <TableCell>{assignment.quiz.subject}</TableCell>
                <TableCell>
                  {new Date(assignment.dueDate).toLocaleString('vi-VN')}
                </TableCell>
                <TableCell>
                  <Chip
                    label={assignment.status}
                    color={getStatusColor(assignment.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <RoleGuard allowedRoles={['student']}>
                    <IconButton
                      size="small"
                      onClick={() => handleStartQuiz(assignment)}
                      color="primary"
                      disabled={assignment.status === 'expired' || assignment.status === 'completed'}
                    >
                      <PlayArrow />
                    </IconButton>
                  </RoleGuard>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default MyAssignments;

Thêm route vào App.tsx:

import MyAssignments from './pages/MyAssignments';

<Route
  path="/my-assignments"
  element={
    <ProtectedRoute>
      <Layout>
        <MyAssignments />
      </Layout>
    </ProtectedRoute>
  }
/>
