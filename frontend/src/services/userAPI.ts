import api from './api';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export const userAPI = {
  getAll: async (params?: { role?: string }): Promise<{ users: User[] }> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getStudents: async (): Promise<{ users: User[] }> => {
    const response = await api.get('/users', { params: { role: 'student' } });
    return response.data;
  },
};

File: frontend/src/components/AssignQuizDialog.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import { assignmentAPI, Assignment } from '../services/assignmentAPI';
import { userAPI, User } from '../services/userAPI';

interface AssignQuizDialogProps {
  open: boolean;
  onClose: () => void;
  quizId: string;
  quizTitle: string;
  onSuccess?: () => void;
}

const AssignQuizDialog: React.FC<AssignQuizDialogProps> = ({
  open,
  onClose,
  quizId,
  quizTitle,
  onSuccess,
}) => {
  const [selectedStudents, setSelectedStudents] = useState<User[]>([]);
  const [availableStudents, setAvailableStudents] = useState<User[]>([]);
  const [dueDate, setDueDate] = useState<Date | null>(new Date());
  const [dueTime, setDueTime] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      fetchStudents();
    }
  }, [open]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await userAPI.getStudents();
      setAvailableStudents(response.users || []);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách học sinh:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleAssign = async () => {
    if (selectedStudents.length === 0) {
      setError('Vui lòng chọn ít nhất một học sinh');
      return;
    }

    if (!dueDate) {
      setError('Vui lòng chọn ngày hết hạn');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const dueDateTime = new Date(dueDate);
      if (dueTime) {
        dueDateTime.setHours(dueTime.getHours());
        dueDateTime.setMinutes(dueTime.getMinutes());
      }

      const assignments = await Promise.all(
        selectedStudents.map((student) =>
          assignmentAPI.create({
            quizId,
            assignedTo: student._id,
            dueDate: dueDateTime.toISOString(),
          })
        )
      );

      onSuccess?.();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi gán quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedStudents([]);
    setDueDate(new Date());
    setDueTime(new Date());
    setError('');
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Gán Quiz cho Học Sinh</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Quiz: <strong>{quizTitle}</strong>
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Autocomplete
            multiple
            options={availableStudents}
            getOptionLabel={(option) => `${option.name} (${option.email})`}
            value={selectedStudents}
            onChange={(_, newValue) => setSelectedStudents(newValue)}
            loading={loadingStudents}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Chọn học sinh"
                placeholder="Tìm kiếm học sinh..."
                fullWidth
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.name}
                  {...getTagProps({ index })}
                  key={option._id}
                />
              ))
            }
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <DatePicker
              label="Ngày hết hạn"
              value={dueDate}
              onChange={(newValue) => setDueDate(newValue)}
              minDate={new Date()}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
            />
            <TimePicker
              label="Giờ hết hạn"
              value={dueTime}
              onChange={(newValue) => setDueTime(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </Box>

          {selectedStudents.length > 0 && (
            <Alert severity="info">
              Sẽ gán quiz cho {selectedStudents.length} học sinh
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            onClick={handleAssign}
            variant="contained"
            disabled={loading || selectedStudents.length === 0}
          >
            {loading ? <CircularProgress size={20} /> : 'Gán Quiz'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AssignQuizDialog;
