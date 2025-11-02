import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';

interface FilterOption {
  value: string;
  label: string;
}

interface AdvancedFiltersProps {
  filters: {
    subjects?: FilterOption[];
    difficulties?: FilterOption[];
    statuses?: FilterOption[];
    sortBy?: FilterOption[];
  };
  selectedFilters: {
    subjects?: string[];
    difficulties?: string[];
    statuses?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    createdFrom?: Date | null;
    createdTo?: Date | null;
    dueFrom?: Date | null;
    dueTo?: Date | null;
    timeLimitMin?: number;
    timeLimitMax?: number;
  };
  onFilterChange: (filters: any) => void;
  onReset: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  selectedFilters,
  onFilterChange,
  onReset,
}) => {
  const handleMultiSelectChange = (field: string, values: string[]) => {
    onFilterChange({ [field]: values });
  };

  const handleSingleSelectChange = (field: string, value: string) => {
    onFilterChange({ [field]: value });
  };

  const handleDateChange = (field: string, date: Date | null) => {
    onFilterChange({ [field]: date });
  };

  const handleNumberChange = (field: string, value: number | '') => {
    onFilterChange({ [field]: value === '' ? undefined : value });
  };

  const hasActiveFilters = () => {
    return (
      (selectedFilters.subjects && selectedFilters.subjects.length > 0) ||
      (selectedFilters.difficulties && selectedFilters.difficulties.length > 0) ||
      (selectedFilters.statuses && selectedFilters.statuses.length > 0) ||
      selectedFilters.createdFrom ||
      selectedFilters.createdTo ||
      selectedFilters.dueFrom ||
      selectedFilters.dueTo ||
      selectedFilters.timeLimitMin ||
      selectedFilters.timeLimitMax
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Bộ lọc nâng cao</Typography>
          {hasActiveFilters() && (
            <Chip
              label="Đang lọc"
              color="primary"
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {filters.subjects && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Môn học</InputLabel>
                  <Select
                    multiple
                    value={selectedFilters.subjects || []}
                    onChange={(e) =>
                      handleMultiSelectChange('subjects', e.target.value as string[])
                    }
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip
                            key={value}
                            label={filters.subjects?.find((s) => s.value === value)?.label || value}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {filters.subjects.map((subject) => (
                      <MenuItem key={subject.value} value={subject.value}>
                        {subject.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {filters.difficulties && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Độ khó</InputLabel>
                  <Select
                    multiple
                    value={selectedFilters.difficulties || []}
                    onChange={(e) =>
                      handleMultiSelectChange('difficulties', e.target.value as string[])
                    }
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip
                            key={value}
                            label={filters.difficulties?.find((d) => d.value === value)?.label || value}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {filters.difficulties.map((difficulty) => (
                      <MenuItem key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {filters.statuses && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    multiple
                    value={selectedFilters.statuses || []}
                    onChange={(e) =>
                      handleMultiSelectChange('statuses', e.target.value as string[])
                    }
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip
                            key={value}
                            label={filters.statuses?.find((s) => s.value === value)?.label || value}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {filters.statuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Sắp xếp theo</InputLabel>
                <Select
                  value={selectedFilters.sortBy || 'createdAt'}
                  onChange={(e) => handleSingleSelectChange('sortBy', e.target.value)}
                >
                  {filters.sortBy?.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Thứ tự</InputLabel>
                <Select
                  value={selectedFilters.sortOrder || 'desc'}
                  onChange={(e) => handleSingleSelectChange('sortOrder', e.target.value as 'asc' | 'desc')}
                >
                  <MenuItem value="desc">Mới nhất</MenuItem>
                  <MenuItem value="asc">Cũ nhất</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {(selectedFilters.createdFrom !== undefined || selectedFilters.createdTo !== undefined) && (
              <>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Từ ngày"
                    value={selectedFilters.createdFrom}
                    onChange={(date) => handleDateChange('createdFrom', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Đến ngày"
                    value={selectedFilters.createdTo}
                    onChange={(date) => handleDateChange('createdTo', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
                  />
                </Grid>
              </>
            )}

            {(selectedFilters.dueFrom !== undefined || selectedFilters.dueTo !== undefined) && (
              <>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Hạn nộp từ"
                    value={selectedFilters.dueFrom}
                    onChange={(date) => handleDateChange('dueFrom', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Hạn nộp đến"
                    value={selectedFilters.dueTo}
                    onChange={(date) => handleDateChange('dueTo', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
                  />
                </Grid>
              </>
            )}

            {(selectedFilters.timeLimitMin !== undefined || selectedFilters.timeLimitMax !== undefined) && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Thời gian tối thiểu (phút)"
                    type="number"
                    value={selectedFilters.timeLimitMin || ''}
                    onChange={(e) =>
                      handleNumberChange('timeLimitMin', parseInt(e.target.value) || '')
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Thời gian tối đa (phút)"
                    type="number"
                    value={selectedFilters.timeLimitMax || ''}
                    onChange={(e) =>
                      handleNumberChange('timeLimitMax', parseInt(e.target.value) || '')
                    }
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={onReset}
                  disabled={!hasActiveFilters()}
                >
                  Xóa bộ lọc
                </Button>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </LocalizationProvider>
  );
};

export default AdvancedFilters;
