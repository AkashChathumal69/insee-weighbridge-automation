# Sri Lanka Number Plate Detection System

A complete web-based solution for detecting and recognizing Sri Lankan number plates using YOLO and OCR technology.

## Quick Start (Windows)

```bash
# Run setup (one time)
setup.bat

# Start the system
start.bat
```

Then open your browser to **http://localhost:3000**

## Manual Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- Tesseract-OCR ([Download](https://github.com/UB-Mannheim/tesseract/wiki))

### Backend Setup

```bash
cd slnp

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start API server
python api.py
```

API will be available at: `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Start React app
npm start
```

Frontend will be available at: `http://localhost:3000`

## Features

### 🎥 **Multiple Input Methods**
- Upload image files
- Capture from webcam
- Real-time detection

###  **Number Plate Detection**
- YOLO-based plate detection
- High accuracy with pre-trained model
- Confidence scores for each detection

###  **OCR & Text Recognition**
- Dual OCR engines (EasyOCR + Tesseract)
- Automatic Sri Lankan plate formatting
- Raw text output for debugging

###  **Results Visualization**
- Annotated images with bounding boxes
- Formatted plate numbers
- Detection confidence levels
- Position coordinates

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                       │
│  (Image Upload, Camera, Results Display)                │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
                     ↓
┌─────────────────────────────────────────────────────────┐
│                    Flask Backend                        │
│  (SLNP API Server)                                      │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴──────────┐
         ↓                      ↓
    ┌─────────┐           ┌──────────┐
    │   YOLO  │           │   OCR    │
    │ Model   │           │ Pipeline │
    │best.pt  │           │          │
    └─────────┘           └──────────┘
```

## API Endpoints

### Health Check
```bash
GET /health
```

### Detect Plates from File
```bash
POST /detect
Content-Type: multipart/form-data

# Request
file: <image_file>

# Response
{
  "success": true,
  "detections": [
    {
      "bbox": {"x1": 45, "y1": 30, "x2": 120, "y2": 60},
      "raw_text": "ABC1234",
      "formatted_text": "ABC 1234",
      "confidence": 0.87
    }
  ],
  "image": "base64_encoded_image",
  "detected_count": 1
}
```

### Detect Plates from Base64
```bash
POST /detect-base64
Content-Type: application/json

# Request
{
  "image": "base64_string_here"
}

# Response (same as above)
```

## Component Overview

### Frontend Components

- **PlateDetection.jsx** - Main detection interface with upload/camera
- **plateDetectionService.js** - API communication service
- **App.jsx** - Integrated into main application

### Backend Services

- **api.py** - Flask REST API server
- **main.py** - Original detection script
- **best.pt** - Pre-trained YOLO model

## Configuration

### Backend Configuration (api.py)

```python
# Model path
MODEL_PATH = "best.pt"

# Tesseract OCR path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Detection confidence threshold
conf=0.4  # Modify in detect_plates_in_image()
```

### Frontend Configuration (.env)

```env
REACT_APP_API_URL=http://localhost:5000
```

## Performance

- **Detection Speed**: ~100-200ms per image
- **Resolution**: Optimized for 320x256 pixels
- **Memory**: ~2GB for YOLO model + EasyOCR

## Troubleshooting

### Issue: "Tesseract not found"
```bash
# Install Tesseract
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
# Then verify path in api.py
```

### Issue: "API connection refused"
```bash
# Ensure api.py is running:
cd slnp
python api.py

# Check if port 5000 is in use:
netstat -ano | findstr :5000
```

### Issue: "YOLO model not found"
```bash
# Ensure best.pt is in slnp directory
# Download your trained model if missing
```

### Issue: "No plates detected"
- Improve image quality
- Adjust confidence threshold in api.py
- Use well-lit, clear images
- Test with training dataset samples

## Project Structure

```
Number Plate Detection Sri Lanka/
├── frontend/                      # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── PlateDetection.jsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── plateDetectionService.js
│   │   ├── App.jsx
│   │   └── ...
│   ├── package.json
│   ├── .env.example
│   └── ...
├── slnp/                          # Python backend
│   ├── api.py                     # REST API server
│   ├── main.py                    # Original detection script
│   ├── best.pt                    # YOLO model
│   ├── requirements.txt           # Python dependencies
│   └── ...
├── setup.bat                      # Setup script
├── start.bat                      # Start script
├── INTEGRATION_GUIDE.md           # Detailed integration guide
└── README.md                      # This file
```

## Dependencies

### Backend
- Flask 3.0.0
- OpenCV 4.8.1
- PyTorch & Ultralytics
- EasyOCR 1.7.0
- Tesseract-OCR
- NumPy, Pillow

### Frontend
- React 19.2.1
- Material-UI 6.5.0
- React Router 7.10.1
- Axios (via fetch API)

## Security Notes

 **For Production Deployment:**

1. **Use HTTPS/TLS**
   ```python
   # Use Gunicorn with SSL
   gunicorn --certfile=cert.pem --keyfile=key.pem api:app
   ```

2. **Enable Authentication**
   ```python
   # Add API key validation
   @app.before_request
   def validate_api_key():
       if request.headers.get('X-API-Key') != os.getenv('API_KEY'):
           return jsonify({"error": "Unauthorized"}), 401
   ```

3. **Add Rate Limiting**
   ```bash
   pip install flask-limiter
   ```

4. **Use Production WSGI Server**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 api:app
   ```

5. **Input Validation**
   - Validate file types and sizes
   - Sanitize inputs
   - Implement request size limits

## Performance Optimization

### For Frontend
- Lazy load components
- Compress images before upload
- Use service workers for caching

### For Backend
- Implement request queuing
- Use Redis for caching
- Optimize YOLO inference
- Use GPU acceleration (if available)

## License

[Your License Here]

## Support

For issues or questions:
1. Check [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for detailed setup
2. Review troubleshooting section
3. Check API logs in terminal

## Future Enhancements

- [ ] Batch processing API
- [ ] Database integration for plate history
- [ ] Advanced filtering & search
- [ ] Multi-model support
- [ ] Real-time video stream processing
- [ ] Dashboard with statistics
- [ ] Export results to Excel/PDF
- [ ] User authentication
- [ ] API rate limiting
- [ ] Docker containerization

---

**Status**:  Ready for deployment

**Last Updated**: January 9, 2026

**Version**: 1.0.0
