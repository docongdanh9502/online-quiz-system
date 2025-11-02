import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  CardActions,
  Typography,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { uploadAPI, UploadResponse } from '../services/uploadAPI';

interface ImageUploadProps {
  currentImage?: string;
  onUploadSuccess?: (imagePath: string) => void;
  onDelete?: () => void;
  quizId?: string;
  label?: string;
  maxSizeMB?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onUploadSuccess,
  onDelete,
  quizId,
  label = 'Upload ảnh',
  maxSizeMB = 5,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const getImageUrl = (image?: string) => {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    return `${API_URL}${image}`;
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

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Kích thước file không được vượt quá ${maxSizeMB}MB`);
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
      const response: UploadResponse = await uploadAPI.uploadQuizImage(file, quizId);
      setPreview(null);
      if (onUploadSuccess) {
        onUploadSuccess(response.image || '');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi upload ảnh');
      setPreview(null);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa ảnh này?')) return;

    if (quizId) {
      setLoading(true);
      setError('');

      try {
        await uploadAPI.deleteQuizImage(quizId);
        setPreview(null);
        if (onDelete) {
          onDelete();
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Lỗi khi xóa ảnh');
      } finally {
        setLoading(false);
      }
    } else {
      setPreview(null);
      if (onDelete) {
        onDelete();
      }
    }
  };

  const displayImage = preview || getImageUrl(currentImage);

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {displayImage ? (
        <Card>
          <CardMedia
            component="img"
            height="200"
            image={displayImage}
            alt="Preview"
            sx={{ objectFit: 'cover' }}
          />
          <CardActions>
            <Button
              size="small"
              startIcon={loading ? <CircularProgress size={16} /> : <UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              Đổi ảnh
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              disabled={loading}
            >
              Xóa
            </Button>
          </CardActions>
        </Card>
      ) : (
        <Box
          sx={{
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            JPEG, PNG, GIF, WEBP (tối đa {maxSizeMB}MB)
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ImageUpload;


