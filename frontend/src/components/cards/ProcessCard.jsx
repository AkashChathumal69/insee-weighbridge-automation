import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, Grid, Chip, Modal, Box, Divider } from '@mui/material';
import WaitOutForm from '../forms/WaitOutForm';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 420,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 3,
};

const ProcessCard = ({ entry = {} }) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const isPending = entry?.status === 'Pending';
    const chipColor = isPending ? 'warning' : 'success';
    const headerBg = isPending ? '#fff8e1' : '#e8f5e9';

    // Defensive totals (entry shape may vary across data); fall back to 0 or 'N/A'
    const totalDelivered = entry?.waitOut?.totalDelivered ?? entry?.waitOut?.deliveredBags ?? entry?.deliveredBags ?? 0;

    return (
        <Card elevation={isPending ? 4 : 1} sx={{ borderLeft: isPending ? '5px solid #ff9800' : '5px solid #4caf50' }}>
            <CardContent sx={{ background: headerBg }}>
                <Grid container spacing={1} alignItems="center">
                    <Grid item xs={8}>
                        <Typography variant="h6">Token #{entry?.tokenNumber ?? '—'}</Typography>
                        <Typography variant="body2" color="text.secondary">Vehicle: {entry?.vehicleNumber ?? entry?.waitIn?.vehicleNumber ?? '—'}</Typography>
                        <Typography variant="body2" color="text.secondary">Driver Name: {entry?.waitIn?.driverName ?? '—'}</Typography>
                    </Grid>
                    <Grid item xs={4} sx={{ textAlign: 'right' }}>
                        <Chip label={entry?.status ?? 'Unknown'} color={chipColor} />
                    </Grid>
                </Grid>

                <Grid container spacing={1} sx={{ mt: 2 }}>
                    <Grid item>
                        <Button variant="contained" onClick={handleOpen}>Details</Button>
                    </Grid>
                </Grid>
            </CardContent>

            <Modal open={open} onClose={handleClose} disableScrollLock={true}>
                <Box sx={style}>
                    {isPending ? (
                        <WaitOutForm entry={entry} onClose={handleClose} />
                    ) : (
                        <>
                            <Typography variant="h5">Finished Dispatch Details</Typography>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body1">Delivery No: {entry?.waitOut?.deliveryNumber ?? '—'}</Typography>
                            <Typography variant="body1">Wayout Time: {entry?.waitOut?.wayoutTime ?? '—'}</Typography>
                            <Typography variant="body1">Total Delivered Bags: {totalDelivered}</Typography>
                            <Button onClick={handleClose} sx={{ mt: 3 }}>Close</Button>
                        </>
                    )}
                </Box>
            </Modal>
        </Card>
    );
};

export default ProcessCard;