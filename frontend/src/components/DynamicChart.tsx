import React, { lazy, Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';

// Lazy load heavy chart library only when needed
const Chart = lazy(() => import('recharts'));

interface DynamicChartProps {
  data: any[];
  type: 'bar' | 'line' | 'pie';
}

const DynamicChart: React.FC<DynamicChartProps> = ({ data, type }) => {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      }
    >
      <Chart data={data} type={type} />
    </Suspense>
  );
};

export default DynamicChart;
