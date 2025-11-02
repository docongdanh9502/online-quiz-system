import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Done as DoneIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const NotificationBell: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification._id);
    if (notification.link) {
      navigate(notification.link);
    }
    handleClose();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment_created':
        return <AssignmentIcon color="primary" />;
      case 'assignment_reminder':
        return <ScheduleIcon color="warning" />;
      case 'quiz_submitted':
        return <DoneIcon color="success" />;
      case 'assignment_expired':
        return <WarningIcon color="error" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'assignment_created':
        return 'Bài tập mới';
      case 'assignment_reminder':
        return 'Nhắc nhở';
      case 'quiz_submitted':
        return 'Đã nộp bài';
      case 'assignment_expired':
        return 'Hết hạn';
      default:
        return 'Thông báo';
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton onClick={handleClick} color="inherit">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ width: 400, maxHeight: 600 }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Thông báo</Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={markAllAsRead}>
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </Box>
          <Divider />
          <List sx={{ maxHeight: 500, overflow: 'auto' }}>
            {notifications.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="Không có thông báo"
                  secondary="Bạn sẽ nhận được thông báo khi có bài tập mới"
                />
              </ListItem>
            ) : (
              notifications.map((notification) => (
                <ListItem
                  key={notification._id}
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                  onClick={() => handleNotificationClick(notification)}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {getNotificationTitle(notification.type)}
                        </Typography>
                        {!notification.read && (
                          <Chip label="Mới" size="small" color="primary" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                        <br />
                        <small>
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </small>
                      </Typography>
                    }
                  />
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
