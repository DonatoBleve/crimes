import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, FormControl, InputLabel, MenuItem, Select, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LoadingIcon from '../assets/LoadingIcon.svg';
import StatsRecap from './StatsRecap';
import '../styles/Statistics.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const categoryColors: { [key: string]: string } = {
    'anti-social-behaviour': '#6d2ddd',
    'bicycle-theft': '#49dacf',
    'burglary': '#d1a545',
    'criminal-damage-arson': '#f14a12',
    'drugs': '#232ab8',
    'other-theft': '#38d8a7',
    'possession-of-weapons': '#4e3a20',
    'public-order': '#a2c2cf',
    'robbery': '#1b8a69',
    'shoplifting': '#ea85e2',
    'theft-from-the-person': '#835ed1',
    'vehicle-crime': '#bbd50f',
    'violent-crime': '#bf0b0b',
    'other-crime': '#887474'
};

interface Crime {
    category: string;
    month: string;
    location: {
        latitude: string;
        longitude: string;
    };
}

interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string[];
        borderColor: string[];
        borderWidth: number;
    }[];
}

const Statistics: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const { polylinePoints, month: initialMonth } = location.state || { polylinePoints: '', month: '2024-01' };
    const [crimes, setCrimes] = useState<Crime[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(initialMonth);
    const [chartData, setChartData] = useState<ChartData>({ labels: [], datasets: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [legendDisplay, setLegendDisplay] = useState(window.innerHeight > 500);
    const [showRecap, setShowRecap] = useState(false);

    const fetchCrimes = async (month: string) => {
        if (polylinePoints) {
            setLoading(true);
            const url = `https://data.police.uk/api/crimes-street/all-crime?date=${month}&poly=${polylinePoints}`;
            console.log('Fetching URL:', url);
            try {
                const response = await axios.get(url);
                setCrimes(response.data);
            } catch (error) {
                console.error('Error fetching crimes:', error);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchCrimes(selectedMonth);
    }, [selectedMonth, polylinePoints]);

    useEffect(() => {
        const formatLabel = (label: string) => {
            return label
                .split('-')
                .map((word, index) => index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)
                .join(' ');
        };

        const categories = Array.from(new Set(crimes.map((crime) => crime.category)));
        const formattedLabels = categories.map(formatLabel);

        const data: ChartData = {
            labels: formattedLabels,
            datasets: [
                {
                    label: 'Crimes by Category',
                    data: categories.map((category) =>
                        crimes.filter((crime) => crime.category === category).length
                    ),
                    backgroundColor: categories.map(category =>
                        categoryColors[category] || '#8884d8'
                    ),
                    borderColor: categories.map(category =>
                        categoryColors[category] || '#8884d8'
                    ),
                    borderWidth: 1,
                },
            ],
        };
        setChartData(data);
    }, [crimes]);

    useEffect(() => {
        const handleResize = () => {
            setLegendDisplay(window.innerHeight > 500);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: legendDisplay,
                position: 'bottom' as const,
                labels: {
                    color: theme.palette.text.primary,
                    generateLabels: (chart: any) => {
                        const datasets = chart.data.datasets[0];
                        return chart.data.labels.map((label: string, i: number) => ({
                            text: label,
                            fillStyle: datasets.backgroundColor[i],
                            hidden: false,
                            lineCap: undefined,
                            lineDash: undefined,
                            lineDashOffset: undefined,
                            lineJoin: undefined,
                            lineWidth: undefined,
                            strokeStyle: datasets.backgroundColor[i],
                            pointStyle: 'rect',
                            rotation: undefined
                        }));
                    }
                }
            }
        }
    };

    const statistics = {
        totalCrimes: crimes.length,
        categories: crimes.reduce((acc, crime) => {
            acc[crime.category] = (acc[crime.category] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number })
    };

    return (
        <Box sx={{ height: '95vh', width: '100vw', position: 'absolute', left: 0, top: 30 }}>
            <div className="stats-container">
                <h2>Crime Statistics</h2>
                <FormControl variant="outlined" sx={{ mt: 2, minWidth: 120 }}>
                    <InputLabel id="month-selector-label">Month</InputLabel>
                    <Select
                        labelId="month-selector-label"
                        id="month-selector"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        label="Month"
                    >
                        <MenuItem value="2024-01">January 2024</MenuItem>
                        <MenuItem value="2024-02">February 2024</MenuItem>
                        <MenuItem value="2024-03">March 2024</MenuItem>
                        <MenuItem value="2024-04">April 2024</MenuItem>
                        <MenuItem value="2024-05">May 2024</MenuItem>
                        <MenuItem value="2024-06">June 2024</MenuItem>
                        <MenuItem value="2024-07">July 2024</MenuItem>
                        <MenuItem value="2024-08">August 2024</MenuItem>
                        <MenuItem value="2024-09">September 2024</MenuItem>
                        <MenuItem value="2024-10">October 2024</MenuItem>
                        <MenuItem value="2024-11">November 2024</MenuItem>
                        <MenuItem value="2024-12">December 2024</MenuItem>
                    </Select>
                </FormControl>
                {loading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40px', width: '100%', position: 'absolute', top: 'calc(20% - 20px)', zIndex: 2000, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                        <img src={LoadingIcon} alt="Loading" style={{ width: '20px', height: '20px' }} />
                        <Typography variant="body2" sx={{ ml: 1, color: 'black' }}>Loading statistics, please wait...</Typography>
                    </Box>
                )}
                {error &&
                    <Box sx={{ position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)', zIndex: 3000, backgroundColor: 'rgba(255,0,0,0.69)', color: 'white', padding: '10px 20px', borderRadius: '5px' }}>
                        <Typography variant="body1">You must select a valid area on the map first. If you already selected it, it's possible you are now on a month with too many crimes. Please try selecting a month and area on the map page and then try again.</Typography>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={() => navigate('/')}
                            sx={{ mt: 2, color: 'white' }}
                        >
                            GO TO MAP
                        </Button>
                    </Box>
                }
                <div className="chart-container" style={{ height: '60vh' }}>
                    <Bar data={chartData} options={options} />
                </div>
                <Button
                    variant="contained"
                    onClick={() => setShowRecap(true)}
                    sx={{ mt: 2, backgroundColor: 'orange', color: 'white' }}
                >
                    Recap
                </Button>
                <StatsRecap
                    open={showRecap}
                    onClose={() => setShowRecap(false)}
                    statistics={statistics}
                />
            </div>
        </Box>
    );
}

export default Statistics;