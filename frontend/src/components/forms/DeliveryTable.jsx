import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Typography } from '@mui/material';

const DeliveryTable = ({ data, onDataChange, mode = 'requested' }) => {
    const isWaitOut = mode === 'delivery';

    const handleChange = (index, field, value) => {
        const numericValue = parseInt(value) || 0;
        const updatedTable = data.map((row, i) =>
            i === index ? { ...row, [field]: numericValue } : row
        );
        onDataChange(updatedTable);
    };

    return (
        <TableContainer component={Paper} sx={{ maxHeight: 300, overflowY: 'auto' }} elevation={1}>
            <Table size="small">
                <TableHead sx={{ backgroundColor: isWaitOut ? '#ffb4b4ff' : '#ffb4b4ff' }}>
                    <TableRow>
                        <TableCell><Typography variant="subtitle2">Brand</Typography></TableCell>
                        <TableCell align="right"><Typography variant="subtitle2">Requested Bags</Typography></TableCell>
                        <TableCell align="right"><Typography variant="subtitle2" color={isWaitOut ? 'primary.main' : 'text.secondary'}>Delivery Bags</Typography></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row, index) => (
                        <TableRow key={row.brand}>
                            <TableCell>{row.brand}</TableCell>
                            <TableCell align="right">
                                <TextField
                                    size="small"
                                    type="number"
                                    name="requestedBag"
                                    value={row.requestedBag}
                                    onChange={(e) => handleChange(index, 'requestedBag', e.target.value)}
                                    disabled={isWaitOut} // Requested bags are set only during Wait In
                                    sx={{ width: 100 }}
                                />
                            </TableCell>
                            <TableCell align="right">
                                <TextField
                                    size="small"
                                    type="number"
                                    name="deliveryBag"
                                    value={row.deliveryBag}
                                    onChange={(e) => handleChange(index, 'deliveryBag', e.target.value)}
                                    disabled={!isWaitOut} // Delivery bags are set only during Wait Out
                                    sx={{ width: 100 }}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default DeliveryTable;