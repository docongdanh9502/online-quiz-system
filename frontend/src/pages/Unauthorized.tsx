import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom>
          403
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Không có quyền truy cập
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 4 }}>
          Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Về trang chủ
        </Button>
      </Box>
    </Container>
  );
};

export default Unauthorized;