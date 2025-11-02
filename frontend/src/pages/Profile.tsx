import React from 'react';
import { Container, Paper, Typography, Box, Avatar, Grid, Chip } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'teacher':
        return 'primary';
      case 'student':
        return 'success';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'teacher':
        return 'Giáo viên';
      case 'student':
        return 'Học sinh';
      default:
        return role;
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              fontSize: 40,
              mb: 2,
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h5" component="h1" gutterBottom>
            {user?.name}
          </Typography>
          <Chip
            label={getRoleLabel(user?.role || '')}
            color={getRoleColor(user?.role || '')}
            sx={{ mt: 1 }}
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">{user?.email}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Vai trò
            </Typography>
            <Typography variant="body1">{getRoleLabel(user?.role || '')}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};
import AvatarUpload from '../components/AvatarUpload';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Hồ sơ của tôi
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <AvatarUpload
            currentAvatar={user?.avatar}
            size={150}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Họ tên
          </Typography>
          <Typography variant="h6">{user?.name}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Email
          </Typography>
          <Typography variant="h6">{user?.email}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Vai trò
          </Typography>
          <Typography variant="h6">{user?.role}</Typography>
        </Box>
      </Paper>
    </Container>
  );
};




export default Profile;