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

const [advancedFilters, setAdvancedFilters] = useState({
  subjects: [] as string[],
  sortBy: 'createdAt',
  sortOrder: 'desc' as 'asc' | 'desc',
  createdFrom: null as Date | null,
  createdTo: null as Date | null,
  timeLimitMin: undefined as number | undefined,
  timeLimitMax: undefined as number | undefined,
});

const fetchQuizzes = async () => {
  setLoading(true);
  try {
    const params: any = {
      page,
      limit: 10,
    };

    if (searchTerm) {
      params.search = searchTerm;
    }

    if (selectedSubject) {
      params.subject = selectedSubject;
    }

    // Advanced filters
    if (advancedFilters.subjects.length > 0) {
      params.subject = advancedFilters.subjects;
    }

    params.sortBy = advancedFilters.sortBy;
    params.sortOrder = advancedFilters.sortOrder;

    if (advancedFilters.createdFrom) {
      params.createdFrom = advancedFilters.createdFrom.toISOString();
    }

    if (advancedFilters.createdTo) {
      params.createdTo = advancedFilters.createdTo.toISOString();
    }

    if (advancedFilters.timeLimitMin) {
      params.timeLimitMin = advancedFilters.timeLimitMin;
    }

    if (advancedFilters.timeLimitMax) {
      params.timeLimitMax = advancedFilters.timeLimitMax;
    }

    const response = await quizAPI.getAll(params);
    setQuizzes(response.quizzes || []);
    setPagination(response.pagination);
    setAvailableFilters(response.filters || {});
  } catch (error) {
    console.error('Lỗi khi tải quizzes:', error);
  } finally {
    setLoading(false);
  }
};

// Thêm component vào UI
<AdvancedFilters
  filters={{
    subjects: (availableFilters.subjects || []).map((s: string) => ({
      value: s,
      label: s,
    })),
    sortBy: [
      { value: 'createdAt', label: 'Ngày tạo' },
      { value: 'title', label: 'Tiêu đề' },
      { value: 'subject', label: 'Môn học' },
      { value: 'timeLimit', label: 'Thời gian' },
    ],
  }}
  selectedFilters={advancedFilters}
  onFilterChange={handleAdvancedFilterChange}
  onReset={handleResetFilters}
/>

export default MyAssignments;
