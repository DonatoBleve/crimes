import React from 'react';
import { Fab } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../ThemeProvider';

const ThemeToggleButton: React.FC = () => {
    const { toggleTheme, themeMode } = useTheme();

    return (
        <Fab
            color="primary"
            aria-label="toggle theme"
            onClick={toggleTheme}
            style={{ position: 'fixed', bottom: 16, right: 16 }}
        >
            {themeMode === 'light' ? <Brightness4 /> : <Brightness7 />}
        </Fab>
    );
};

export default ThemeToggleButton;