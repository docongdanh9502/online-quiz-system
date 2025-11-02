import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length > 2) {
      const timeoutId = setTimeout(() => {
        performSearch();
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setResults(null);
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await api.get('/search/global', {
        params: { q: query, limit: 5 },
      });
      setResults(response.data);
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (type: string, id: string) => {
    onClose();
    if (type === 'question') {
      navigate(`/questions`);
    } else if (type === 'quiz') {
      navigate(`/quizzes`);
    } else if (type === 'assignment') {
      navigate(`/my-assignments`);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Tìm kiếm toàn hệ thống</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder="Nhập từ khóa tìm kiếm..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {results && query.length > 2 && (
          <Box sx={{ mt: 2 }}>
            {results.total === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Không tìm thấy kết quả
              </Typography>
            ) : (
              <>
                {results.results.questions?.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Câu hỏi ({results.results.questions.length})
                    </Typography>
                    <List>
                      {results.results.questions.map((item: any) => (
                        <ListItem
                          key={item._id}
                          button
                          onClick={() => handleItemClick('question', item._id)}
                        >
                          <ListItemText
                            primary={item.title}
                            secondary={`${item.subject} • ${item.difficulty}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {results.results.quizzes?.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Quiz ({results.results.quizzes.length})
                    </Typography>
                    <List>
                      {results.results.quizzes.map((item: any) => (
                        <ListItem
                          key={item._id}
                          button
                          onClick={() => handleItemClick('quiz', item._id)}
                        >
                          <ListItemText
                            primary={item.title}
                            secondary={`${item.subject} • ${item.timeLimit} phút`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {results.results.assignments?.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Bài tập ({results.results.assignments.length})
                    </Typography>
                    <List>
                      {results.results.assignments.map((item: any) => (
                        <ListItem
                          key={item._id}
                          button
                          onClick={() => handleItemClick('assignment', item._id)}
                        >
                          <ListItemText
                            primary={item.quiz?.title}
                            secondary={`Hạn: ${new Date(item.dueDate).toLocaleDateString('vi-VN')} • ${item.status}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSearch;