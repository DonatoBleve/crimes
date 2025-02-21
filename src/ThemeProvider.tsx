import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import useMediaQuery from '@mui/material/useMediaQuery';

const ThemeContext = createContext({
    toggleTheme: () => {},
    themeMode: 'light',
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [themeMode, setThemeMode] = useState(prefersDarkMode ? 'dark' : 'light');

    useEffect(() => {
        setThemeMode(prefersDarkMode ? 'dark' : 'light');
    }, [prefersDarkMode]);

    const toggleTheme = () => {
        setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const theme = useMemo(() => (themeMode === 'light' ? lightTheme : darkTheme), [themeMode]);

    return (
        <ThemeContext.Provider value={{ toggleTheme, themeMode }}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};