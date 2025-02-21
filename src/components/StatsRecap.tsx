import React from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';

interface StatsRecapProps {
    open: boolean;
    onClose: () => void;
    statistics: {
        totalCrimes: number;
        categories: { [key: string]: number };
    };
}

const formatLabel = (label: string) => {
    return label
        .split('-')
        .map((word, index) => index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)
        .join(' ');
};

const StatsRecap: React.FC<StatsRecapProps> = ({ open, onClose, statistics }) => {
    if (!open) return null;

    return (
        <Box sx={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1300, maxHeight: '80vh', overflowY: 'auto' }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" component="div">
                        Statistics Recap
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Total Crimes: {statistics.totalCrimes}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Categories:
                    </Typography>
                    <ul>
                        {Object.entries(statistics.categories).map(([category, count]) => (
                            <li key={category} style={{ listStyleType: 'none', textAlign: 'left' }}>
                                {formatLabel(category)}: {count}
                            </li>
                        ))}
                    </ul>
                    <Button variant="contained" color="error" onClick={onClose}>
                        Close
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
};

export default StatsRecap;