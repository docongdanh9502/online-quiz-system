import React, { memo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

interface TableColumn {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  minWidth?: number;
}

interface MemoizedTableProps {
  columns: TableColumn[];
  rows: any[];
  renderRow: (row: any) => React.ReactNode;
}

const MemoizedTable = memo<MemoizedTableProps>(({ columns, rows, renderRow }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                style={{ minWidth: column.minWidth }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => renderRow(row))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

MemoizedTable.displayName = 'MemoizedTable';

export default MemoizedTable;

