import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';

interface NavbarProps {
    onStatisticsClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onStatisticsClick }) => {
    return (
        <AppBar position="fixed" className="navbar" style={{ backgroundColor: '#2c3e60' }}>
            <Toolbar style={{ justifyContent: 'space-between' }}>
                <Box display="flex" alignItems="center">
                    <img src={logo} alt="logo" style={{ width: 35, height: 40, marginRight: 3 }} />
                    <Typography style={{ fontSize:30, fontFamily: 'Arial Narrow', fontWeight: 100 }}>
                        CRIMESTAT
                    </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                    <Button color="inherit" component={Link} to="/">Map</Button>
                    <Button color="inherit" onClick={onStatisticsClick} style={{ color: 'white' }}>Statistics</Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;