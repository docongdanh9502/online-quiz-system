import React, { useState, useRef } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { uploadAPI, UploadResponse } from '../services/uploadAPI';
import { useAuth } from '../contexts/AuthContext';

interface AvatarUploadProps {
  currentAvatar?: string;
  onUploadSuccess?: (avatarPath: string) => void;
  size?: number;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onUploadSuccess,
  size = 120,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, refreshUser } = useAuth();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const getAvatarUrl = (avatar?: string) => {
    if (!avatar) return '';
    if (avatar.startsWith('http')) return avatar;
    return `${API_URL}${avatar}`;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Chỉ cho phép file ảnh (JPEG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 2MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setLoading(true);
    setError('');

    try {
      const response: UploadResponse = await uploadAPI.uploadAvatar(file);
      setPreview(null);
      if (onUploadSuccess) {
        onUploadSuccess(response.avatar || '');
      }
      await refreshUser?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi upload avatar');
      setPreview(null);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa avatar?')) return;

    setLoading(true);
    setError('');

    try {
      await uploadAPI.deleteAvatar();
      setPreview(null);
      if (onUploadSuccess) {
        onUploadSuccess('');
      }
      await refreshUser?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi xóa avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displayAvatar = preview || getAvatarUrl(currentAvatar || user?.avatar);

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <Avatar
          src={displayAvatar || undefined}
          sx={{
            width: size,
            height: size,
            border: '3px solid',
            borderColor: 'primary.main',
            cursor: 'pointer',
          }}
          onClick={handleClick}
        >
          {!displayAvatar && user?.name?.[0]?.toUpperCase()}
        </Avatar>

        {loading && (
          <CircularProgress
            size={size}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        )}

        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            display: 'flex',
            gap: 0.5,
          }}
        >
          <Tooltip title="Đổi avatar">
            <IconButton
              size="small"
              onClick={handleClick}
              disabled={loading}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <CameraIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {displayAvatar && (
            <Tooltip title="Xóa avatar">
              <IconButton
                size="small"
                onClick={handleDelete}
                disabled={loading}
                sx={{
                  bgcolor: 'error.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'error.dark' },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 1, maxWidth: size }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default AvatarUpload;


