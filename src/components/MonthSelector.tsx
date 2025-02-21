import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';

interface MonthSelectorProps {
    month: number;
    onMonthChange: React.Dispatch<React.SetStateAction<number>>;
    className?: string;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ month, onMonthChange }) => {
    const handleChange = (event: SelectChangeEvent<number>) => {
        onMonthChange(event.target.value as number);
    };

    return (
        <FormControl fullWidth sx={{ mt: 4 }} className="custom-month-selector">
            <InputLabel id="month-select-label">Select month</InputLabel>
            <Select
                labelId="month-select-label"
                id="month-select"
                value={month}
                onChange={handleChange}
                label="Select Month"
                MenuProps={{
                    PaperProps: {
                        style: {
                            zIndex: 4000,
                        },
                    },
                    container: document.body,
                }}
            >
                {Array.from({ length: 12 }, (_, index) => (
                    <MenuItem key={index + 1} value={index + 1}>
                        {new Date(2024, index).toLocaleString('en-UK', { month: 'long' })} 2024
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default MonthSelector;