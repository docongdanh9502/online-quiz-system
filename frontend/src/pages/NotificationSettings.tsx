import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  Button,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { notificationAPI, NotificationPreferences } from '../services/notificationAPI';

const NotificationSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailAssignmentCreated: true,
    emailAssignmentReminder: true,
    emailQuizSubmitted: true,
    emailAssignmentExpired: true,
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const data = await notificationAPI.getPreferences();
      setPreferences(data);
    } catch (error) {
      console.error('Lỗi khi tải preferences:', error);
      // Giữ defaults nếu API chưa có
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await notificationAPI.updatePreferences(preferences);
      setMessage({ type: 'success', text: 'Đã lưu cài đặt thành công' });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Lỗi khi lưu cài đặt',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Cài đặt thông báo
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Email Notifications
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Chọn loại thông báo bạn muốn nhận qua email
        </Typography>

        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={preferences.emailAssignmentCreated}
                onChange={() => handleChange('emailAssignmentCreated')}
              />
            }
            label={
              <Box>
                <Typography variant="body1">Bài tập mới được giao</Typography>
                <Typography variant="caption" color="text.secondary">
                  Nhận email khi có bài tập mới được giao cho bạn
                </Typography>
              </Box>
            }
            sx={{ mb: 2 }}
          />

          <Divider sx={{ my: 2 }} />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.emailAssignmentReminder}
                onChange={() => handleChange('emailAssignmentReminder')}
              />
            }
            label={
              <Box>
                <Typography variant="body1">Nhắc nhở bài tập sắp hết hạn</Typography>
                <Typography variant="caption" color="text.secondary">
                  Nhận email nhắc nhở khi bài tập sắp hết hạn (1h, 3h, 6h trước)
                </Typography>
              </Box>
            }
            sx={{ mb: 2 }}
          />

          <Divider sx={{ my: 2 }} />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.emailQuizSubmitted}
                onChange={() => handleChange('emailQuizSubmitted')}
              />
            }
            label={
              <Box>
                <Typography variant="body1">Đã nộp bài thành công</Typography>
                <Typography variant="caption" color="text.secondary">
                  Nhận email xác nhận khi bạn nộp bài quiz
                </Typography>
              </Box>
            }
            sx={{ mb: 2 }}
          />

          <Divider sx={{ my: 2 }} />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.emailAssignmentExpired}
                onChange={() => handleChange('emailAssignmentExpired')}
              />
            }
            label={
              <Box>
                <Typography variant="body1">Bài tập đã hết hạn</Typography>
                <Typography variant="caption" color="text.secondary">
                  Nhận email thông báo khi bài tập đã hết hạn
                </Typography>
              </Box>
            }
          />
        </FormGroup>

        {message && (
          <Alert severity={message.type} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            Lưu cài đặt
          </Button>
        </Box>
      </Paper>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            💡 Lưu ý
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Các thông báo quan trọng vẫn sẽ được hiển thị trong hệ thống ngay cả khi bạn tắt email
            <br />
            • Bạn có thể thay đổi cài đặt này bất cứ lúc nào
            <br />
            • Email sẽ được gửi đến địa chỉ email của tài khoản
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default NotificationSettings;