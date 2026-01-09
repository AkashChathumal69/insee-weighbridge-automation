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
  TextField,
  Alert,
  Container,
  List,
  ListItem,
  ListItemText,
  Snackbar,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { plateDetectionService } from '../services/plateDetectionService';
import { useProcessContext } from '../contexts/ProcessContext';

const PlateDetection = () => {
  const { setDetectedVehicleNumber } = useProcessContext();
  const [selectedFile, setSelectedFile] = useState(null);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [apiOnline, setApiOnline] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ok = await plateDetectionService.checkHealth();
        if (mounted && !ok) {
          setApiOnline(false);
          setError('Backend API unreachable. Please start the backend (http://localhost:5000)');
        }
      } catch (e) {
        if (mounted) {
          setApiOnline(false);
          setError(`Backend health check failed: ${e.message}`);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      setDetections([]);
      setResultImage(null);
    } else {
      setError('Please select a valid image file');
    }
  };

  const handleDetectFromFile = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await plateDetectionService.detectFromFile(selectedFile);

      if (result.success) {
        setDetections(result.detections);
        setResultImage(`data:image/jpeg;base64,${result.image}`);
      } else {
        setError(result.error || 'Detection failed');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error('Detection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError(null);
    } catch (err) {
      setError(`Camera access denied: ${err.message}`);
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
      setSelectedFile(file);
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
    setSelectedFile(null);
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
        {/* Upload Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Number Plate Detection"
              subheader="Upload or capture an image"
              avatar={<CloudUploadIcon />}
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* File Upload */}
                <Box
                  sx={{
                    border: '2px dashed #1976d2',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#f5f5f5',
                    '&:hover': {
                      backgroundColor: '#eeeeee',
                    },
                    transition: 'background-color 0.3s',
                  }}
                  component="label"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Click to upload an image
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {selectedFile ? `Selected: ${selectedFile.name}` : 'No file selected'}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDetectFromFile}
                  disabled={!selectedFile || loading}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Detect Plates'}
                </Button>

                <Divider sx={{ my: 1 }}>OR</Divider>

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
            {!loading && selectedFile && detections.length === 0 && resultImage && (
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
