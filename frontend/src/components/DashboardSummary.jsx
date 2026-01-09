import React, { useMemo } from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import { useProcessContext } from '../contexts/ProcessContext';

const formatNumber = (num) => new Intl.NumberFormat().format(num);

const DashboardSummary = () => {
    const { processQueue } = useProcessContext();

    const { daily, monthly, yearly } = useMemo(() => {
        const now = new Date();
        const todayDate = now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let dailyTotal = 0;
        let monthlyTotal = 0;
        let yearlyTotal = 0;

        const finishedEntries = processQueue.filter(e => e.status === 'Finished');

        for (const entry of finishedEntries) {
            const entryDate = new Date(entry.date);
            const totalBags = entry.waitIn.deliveryTable.reduce((sum, item) => sum + item.deliveryBag, 0);

            // Daily Calculation
            if (entry.date === todayDate) {
                dailyTotal += totalBags;
            }
            // Monthly Calculation
            if (entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear) {
                monthlyTotal += totalBags;
            }
            // Yearly Calculation
            if (entryDate.getFullYear() === currentYear) {
                yearlyTotal += totalBags;
            }
        }

        return { daily: dailyTotal, monthly: monthlyTotal, yearly: yearlyTotal };
    }, [processQueue]); // Recalculate whenever the queue changes

    const summaryData = [
        { label: 'Daily Dispatch', value: daily, unit: 'Bags', color: '#1976d2' },
        { label: 'Monthly Dispatch', value: monthly, unit: 'Bags', color: '#388e3c' },
        { label: 'Yearly Dispatch', value: yearly, unit: 'Bags', color: '#f57c00' },
    ];

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {summaryData.map((item) => (
                <Grid item xs={12} md={4} key={item.label}>
                    <Card elevation={4} sx={{ borderLeft: `5px solid ${item.color}` }}>
                        <CardContent>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                {item.label}
                            </Typography>
                            <Typography variant="h3" component="div" sx={{ color: item.color, fontWeight: 'bold' }}>
                                {formatNumber(item.value)}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                {item.unit} Dispatched
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default DashboardSummary;