import React, { memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Box, Paper } from '@mui/material';

interface VirtualizedListProps {
  items: any[];
  height?: number;
  itemHeight?: number;
  renderItem: (props: { index: number; style: any; data: any }) => React.ReactNode;
}

const VirtualizedList = memo<VirtualizedListProps>(({
  items,
  height = 400,
  itemHeight = 72,
  renderItem,
}) => {
  const Row = ({ index, style }: { index: number; style: any }) => {
    const item = items[index];
    return (
      <div style={style}>
        {renderItem({ index, style, data: item })}
      </div>
    );
  };

  return (
    <Paper>
      <List
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        width="100%"
      >
        {Row}
      </List>
    </Paper>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

export default VirtualizedList;
