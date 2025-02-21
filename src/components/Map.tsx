import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Box, Button, FormControlLabel, Switch, Typography } from '@mui/material';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet.heat';
import '../types/leaflet-draw.d.ts';
import '../styles/Map.css';
import MonthSelector from './MonthSelector';
import LoadingIcon from '../assets/LoadingIcon.svg';
import HeatmapIcon from '../assets/heatmap.png';
import MarkersIcon from '../assets/marker-icon.png';
import Navbar from './Navbar';
import { categoryColors } from './Statistics';
import chroma from 'chroma-js';

const customMarkerIcon = (hue: number) => {
    const hueClass = `hue-${Math.round(hue / 30) * 30 % 360}`;
    return new L.Icon({
        iconUrl: MarkersIcon,
        shadowUrl: '',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        className: hueClass
    });
};

const calculateHue = (color: string) => {
    return Math.round(chroma(color).get('hsl.h'));
};

interface CrimeData {
    id: string;
    category: string;
    location: {
        latitude: string;
        longitude: string;
    };
    outcome_status: {
        category: string;
        date: string;
    } | null;
}

const HeatmapLayer: React.FC<{ points: CrimeData[] }> = ({ points }) => {
    const map = useMap();

    useEffect(() => {
        const heatLayer = (L as any).heatLayer(
            points.map(crime => [parseFloat(crime.location.latitude), parseFloat(crime.location.longitude), 1]),
            { radius: 25 }
        ).addTo(map);

        return () => {
            map.removeLayer(heatLayer);
        };
    }, [points, map]);

    return null;
};

const Map: React.FC = () => {
    const [drawing, setDrawing] = useState(false);
    const [drawnLayer] = useState<L.FeatureGroup>(new L.FeatureGroup());
    const [polylinePoints, setPolylinePoints] = useState<string | null>(null);
    const [month, setMonth] = useState<number>(1);
    const [crimeData, setCrimeData] = useState<CrimeData[]>([]);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchSuccess, setFetchSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleDraw = () => {
        setDrawing(!drawing);
        drawnLayer.clearLayers();
        if (!drawing) {
            setCrimeData([]);
            setFetchSuccess(false);
        }
    };

    const fetchData = async (date: string, poly: string) => {
        setLoading(true);
        const url = `https://data.police.uk/api/crimes-street/all-crime?date=${date}&poly=${poly}`;
        console.log('Fetching data from:', url);
        try {
            const response = await fetch(url);
            if (response.status === 503) {
                setErrorMessage("The area you have selected contains more than 10,000 crimes. Please try restricting the field.");
                setTimeout(() => setErrorMessage(null), 7000);
                return;
            }
            const data: CrimeData[] = await response.json();
            setCrimeData(data);
            setFetchSuccess(true);
        } catch (error) {
            console.error('Error fetching data:', error);
            setFetchSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (polylinePoints) {
            const date = `2024-${month.toString().padStart(2, '0')}`;
            fetchData(date, polylinePoints);
        }
    }, [month, polylinePoints]);

    const formatCategory = (category: string) => {
        return category
            .split('-')
            .map((word, index) => index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)
            .join(' ');
    };

    const MapEvents = () => {
        const map = useMap();
        const [points, setPoints] = useState<L.LatLng[]>([]);
        const [tooltip, setTooltip] = useState<HTMLDivElement | null>(null);

        useEffect(() => {
            map.addLayer(drawnLayer);

            // Create tooltip
            const div = document.createElement('div');
            div.className = 'drawing-tooltip';
            document.querySelector('.leaflet-container')?.appendChild(div);
            setTooltip(div);

            return () => {
                map.removeLayer(drawnLayer);
                div.remove();
            };
        }, [map]);

        useEffect(() => {
            if (drawing) {
                document.querySelector('.leaflet-container')?.classList.add('drawing');
                if (tooltip) {
                    tooltip.style.display = 'block';
                    if (points.length === 0) {
                        tooltip.innerHTML = 'Click to start drawing';
                    } else if (points.length < 3) {
                        tooltip.innerHTML = 'Keep clicking to draw polygon';
                    } else {
                        tooltip.innerHTML = 'Click near start point to finish';
                    }
                }
            } else {
                document.querySelector('.leaflet-container')?.classList.remove('drawing');
                if (tooltip) {
                    tooltip.style.display = 'none';
                }
            }
        }, [drawing, points.length, tooltip]);

        // Update tooltip position on mouse move
        useMapEvents({
            mousemove(e) {
                if (tooltip && drawing) {
                    tooltip.style.left = `${e.containerPoint.x + 20}px`;
                    tooltip.style.top = `${e.containerPoint.y}px`;
                }
            },
            click(e) {
                if (!drawing) return;

                if (points.length >= 3) {
                    const firstPoint = points[0];
                    const firstMarker = drawnLayer.getLayers().find(layer =>
                        layer instanceof L.CircleMarker &&
                        layer.getLatLng().equals(firstPoint)
                    );

                    if (firstMarker) {
                        const clicked = map.latLngToContainerPoint(e.latlng);
                        const markerPoint = map.latLngToContainerPoint(firstPoint);
                        const pixelDistance = clicked.distanceTo(markerPoint);

                        // If clicked within 10 pixels of the first marker
                        if (pixelDistance < 10) {
                            completePolygon(points);
                            return;
                        }
                    }

                    // Chiusura quando la distanza è minore di 500 metri
                    const distance = map.distance(e.latlng, firstPoint);
                    if (distance < 500) {
                        completePolygon(points);
                        return;
                    }
                }

                const newPoint = e.latlng;
                const newPoints = [...points, newPoint];
                setPoints(newPoints);

                drawnLayer.clearLayers();

                // Add circle markers for each point
                newPoints.forEach((point, index) => {
                    const isFirstPoint = index === 0;
                    const circleMarker = L.circleMarker(point, {
                        radius: isFirstPoint ? 5 : 4,
                        color: '#f357a1',
                        fillColor: isFirstPoint ? '#f357a1' : '#fff',
                        fillOpacity: 1,
                        weight: 2
                    });
                    drawnLayer.addLayer(circleMarker);
                });

                if (newPoints.length > 1) {
                    const polyline = L.polyline(newPoints, {
                        color: '#f357a1',
                        weight: 4
                    });
                    drawnLayer.addLayer(polyline);
                }
            }
        });

        const completePolygon = (polygonPoints: L.LatLng[]) => {
            drawnLayer.clearLayers();
            const closedPoints = [...polygonPoints, polygonPoints[0]];

            const polygon = L.polygon(closedPoints, {
                color: '#f357a1',
                weight: 4
            });
            drawnLayer.addLayer(polygon);

            const poly = closedPoints
                .map(point => `${point.lat},${point.lng}`)
                .join(':');
            setPolylinePoints(poly);

            const date = `2024-${month.toString().padStart(2, '0')}`;
            fetchData(date, poly);

            setPoints([]);
            setDrawing(false);
        };

        // Reset points when drawing mode changes
        useEffect(() => {
            if (drawing) {
                setPoints([]);
                drawnLayer.clearLayers();
            }
        }, [drawing]);

        return null;
    };

    const handleNavigateToStatistics = () => {
        const polyline = polylinePoints ? polylinePoints : 'noarea';
        navigate('/statistics', { state: { polylinePoints: polyline, month: `2024-${month.toString().padStart(2, '0')}` } });
    };

    return (
        <Box sx={{ height: { xs: 'calc(80vh - 56px)', sm: 'calc(85vh - 64px)' }, width: '100%', maxWidth: '2000px', margin: '0 auto', position: 'relative' }}>
            <Navbar onStatisticsClick={handleNavigateToStatistics} />
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 2 }}>
                <MonthSelector month={month} onMonthChange={setMonth} className="custom-month-selector" />
            </Box>
            <MapContainer center={[54.5, -3.5]} zoom={6} style={{ height: '100%', width: '100%' }}>
                <Button
                    variant="contained"
                    onClick={handleDraw}
                    sx={{
                        position: 'absolute',
                        zIndex: 1000,
                        top: 10,
                        right: 10,
                        backgroundColor: drawing ? '#f357a1' : 'rgba(255, 255, 255, 0.8)',
                        color: drawing ? 'white' : 'black',
                    }}
                >
                    {drawing ? 'Drawing Area...' : 'Area of Interest'}
                </Button>
                {fetchSuccess && polylinePoints && (
                    <Button
                        variant="contained"
                        onClick={handleNavigateToStatistics}
                        sx={{
                            position: 'absolute',
                            zIndex: 1000,
                            top: 50,
                            right: 10,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            color: 'black',
                        }}
                    >
                        View Statistics
                    </Button>
                )}
                <FormControlLabel
                    control={<Switch checked={showHeatmap} onChange={() => setShowHeatmap(!showHeatmap)} />}
                    label={
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'black' }}>
                            <img src={showHeatmap ? MarkersIcon : HeatmapIcon} alt="Icon" style={{ width: 'auto', height: '1.5em', marginRight: '0.5em'}} />
                            {showHeatmap ? 'Show markers' : 'Show heatmap'}
                        </Box>
                    }
                    sx={{
                        position: 'absolute',
                        zIndex: 1000,
                        bottom: 10,
                        left: 10,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        padding: '0 8px',
                        borderRadius: '4px',
                    }}
                />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', zIndex: 1000, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                        <img src={LoadingIcon} alt="Loading" style={{ width: '50px', height: '50px' }} />
                        <Typography variant="h6" sx={{ mt: 2, color: 'black' }}>Loading crimes data, please wait...</Typography>
                    </Box>
                ) : showHeatmap ? (
                    <HeatmapLayer points={crimeData} />
                ) : (
                    crimeData.map((crime) => {
                        const hue = calculateHue(categoryColors[crime.category] || '#0000ff');
                        return (
                            <Marker
                                key={crime.id}
                                position={[parseFloat(crime.location.latitude), parseFloat(crime.location.longitude)]}
                                icon={customMarkerIcon(hue)}
                            >
                                <Popup>
                                    <strong>Category:</strong> {formatCategory(crime.category)}<br />
                                    {crime.outcome_status && (
                                        <>
                                            <strong>Outcome:</strong> {crime.outcome_status.category}<br />
                                            <strong>Date of the outcome:</strong> {crime.outcome_status.date}
                                        </>
                                    )}
                                </Popup>
                            </Marker>
                        );
                    })
                )}
                <MapEvents />
            </MapContainer>
            {errorMessage && (
                <Box sx={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', zIndex: 3000, backgroundColor: 'rgba(255,0,0,0.61)', color: 'white', padding: '10px 20px', borderRadius: '5px', animation: 'fadeOut 7s forwards' }}>
                    <Typography variant="body1">{errorMessage}</Typography>
                </Box>
            )}
        </Box>
    );
};

export default Map;