import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography,
  Alert,
  Container,
  List,
  ListItem,
  ListItemText,
  Snackbar,
} from '@mui/material';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { plateDetectionService } from '../services/plateDetectionService';
import { useProcessContext } from '../contexts/ProcessContext';

const PlateDetection = () => {
  const { setDetectedVehicleNumber } = useProcessContext();
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ok = await plateDetectionService.checkHealth();
        if (mounted && !ok) {
          setError('Backend API unreachable. Please start the backend -python api.py (http://localhost:5000)');
        }
      } catch (e) {
        if (mounted) {
          setError(`Backend health check failed: ${e.message}`);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Effect to ensure video element plays when stream is set
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch((e) => {
        console.error('Video play error:', e);
      });
    }
  }, [cameraStream]);

  const handleStartCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 300 },
          height: { ideal: 150 },
        },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Ensure video plays
        videoRef.current.play().catch((e) => {
          console.error('Video play error:', e);
        });
      }
      
      setCameraStream(stream);
      setError(null);
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError(`Camera error: ${err.message}`);
      }
    }
  };

  const handleStopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const handleCapturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, 320, 256);

    canvasRef.current.toBlob(async (blob) => {
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      setLoading(true);
      setError(null);

      try {
        const result = await plateDetectionService.detectFromFile(file);

        if (result.success) {
          setDetections(result.detections);
          setResultImage(`data:image/jpeg;base64,${result.image}`);
          handleStopCamera();
        } else {
          setError(result.error || 'Detection failed');
        }
      } catch (err) {
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }, 'image/jpeg');
  };

  const handleClear = () => {
    setDetections([]);
    setResultImage(null);
    setError(null);
    setSuccessMessage('');
    handleStopCamera();
  };

  const handleUseThisPlate = (plateText) => {
    setDetectedVehicleNumber(plateText);
    setSuccessMessage(`✓ Plate "${plateText}" added to form!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Camera Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Number Plate Detection"
              subheader="Capture an image using your camera"
              avatar={<VideoCameraFrontIcon />}
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Camera Section */}
                {!cameraStream ? (
                  <Button
                    variant="outlined"
                    startIcon={<VideoCameraFrontIcon />}
                    onClick={handleStartCamera}
                    fullWidth
                  >
                    Open Camera
                  </Button>
                ) : (
                  <>
                    <Box
                      sx={{
                        width: '100%',
                        backgroundColor: '#000',
                        borderRadius: 1,
                        overflow: 'hidden',
                      }}
                    >
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ width: '100%', display: 'block' }}
                      />
                      <canvas
                        ref={canvasRef}
                        width={320}
                        height={256}
                        style={{ display: 'none' }}
                      />
                    </Box>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleCapturePhoto}
                      disabled={loading}
                      fullWidth
                    >
                      {loading ? <CircularProgress size={24} /> : 'Capture & Detect'}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleStopCamera}
                      fullWidth
                    >
                      Close Camera
                    </Button>
                  </>
                )}

                {error && (
                  <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}

                {detections.length > 0 && (
                  <Alert severity="success">
                    Found {detections.length} plate{detections.length !== 1 ? 's' : ''}
                  </Alert>
                )}

                <Button
                  variant="outlined"
                  onClick={handleClear}
                  fullWidth
                  disabled={loading}
                >
                  Clear
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            {/* Result Image */}
            {resultImage && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Detection Result
                  </Typography>
                  <Box
                    component="img"
                    src={resultImage}
                    sx={{
                      width: '100%',
                      height: { ideal: 150 },
                      borderRadius: 1,
                      backgroundColor: '#f5f5f5',
                    }}
                    alt="Detection result"
                  />
                </Paper>
              </Grid>
            )}

            {/* Detections List */}
            {detections.length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardHeader title={`Detected Plates (${detections.length})`} />
                  <CardContent>
                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {detections.map((detection, index) => (
                        <React.Fragment key={index}>
                          <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <ListItemText
                                primary={
                                  <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                                    {detection.formatted_text}
                                  </Typography>
                                }
                                secondary={
                                  <Box sx={{ mt: 1 }}>
                                    <Typography variant="body2" color="textSecondary">
                                      Raw: {detection.raw_text}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                      Confidence: {(detection.confidence * 100).toFixed(2)}%
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                      Position: ({detection.bbox.x1}, {detection.bbox.y1}) - ({detection.bbox.x2}, {detection.bbox.y2})
                                    </Typography>
                                  </Box>
                                }
                              />
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleUseThisPlate(detection.formatted_text)}
                                sx={{ whiteSpace: 'nowrap', ml: 2 }}
                              >
                                Use This
                              </Button>
                            </Box>
                          </ListItem>
                          {index < detections.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* No Results Message */}
            {!loading && detections.length === 0 && resultImage && (
              <Grid item xs={12}>
                <Alert severity="info">No number plates detected in the image</Alert>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: '#4caf50',
            color: 'white',
            fontWeight: 'bold',
          },
        }}
      />
    </Container>
  );
};

export default PlateDetection;
