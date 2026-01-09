# SLNP Frontend Integration Guide

This guide explains how to connect your Sri Lanka Number Plate Detection system to the React frontend.

## Architecture Overview

```
Frontend (React)
    ↓ HTTP Requests
Backend API (Flask)
    ↓
YOLO Detection Model (best.pt)
    ↓
OCR (EasyOCR + Tesseract)
```

## Setup Instructions

### 1. Backend Setup (Python)

#### Install Dependencies

Navigate to the `slnp` directory and install required packages:

```bash
cd slnp
pip install -r requirements.txt
```

**Required System Dependencies:**
- **Tesseract-OCR**: Download and install from https://github.com/UB-Mannheim/tesseract/wiki
  - During installation, note the installation path (usually `C:\Program Files\Tesseract-OCR`)
  - The path is already set in `api.py`, but verify it matches your installation

#### Start the API Server

```bash
python api.py
```

The API will start on `http://localhost:5000`

You should see:
```
Starting SLNP Detection API on http://localhost:5000
 * Running on http://0.0.0.0:5000
```

#### API Endpoints

- **GET `/health`** - Check if API is running
- **POST `/detect`** - Detect plates from image file (multipart/form-data)
- **POST `/detect-base64`** - Detect plates from base64 image (JSON)

Example cURL commands:

```bash
# Health check
curl http://localhost:5000/health

# Image file detection
curl -X POST -F "image=@path/to/image.jpg" http://localhost:5000/detect

# Base64 detection
curl -X POST -H "Content-Type: application/json" \
  -d '{"image":"base64_image_string"}' \
  http://localhost:5000/detect-base64
```

### 2. Frontend Setup (React)

#### Install Dependencies

Navigate to the `frontend` directory and install required packages:

```bash
cd frontend
npm install
```

#### Configuration

The frontend automatically connects to `http://localhost:5000` by default.

To use a different API URL, create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000
```

Or set it to your server's address:

```env
REACT_APP_API_URL=http://your-server-ip:5000
```

#### Start the Frontend

```bash
npm start
```

The React app will open on `http://localhost:3000`

## Features

### 1. Image Upload
- Upload an image file from your computer
- Click "Detect Plates" to process
- View results with confidence scores

### 2. Camera Capture
- Click "Open Camera" to access device camera
- Click "Capture & Detect" to take a photo and detect plates
- View detected plates with bounding boxes

### 3. Results Display
- Formatted number plate (e.g., "ABC 1234")
- Raw OCR text for debugging
- Confidence scores
- Bounding box coordinates
- Annotated image with detection boxes

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── PlateDetection.jsx    (Main detection component)
│   │   └── ...
│   ├── services/
│   │   └── plateDetectionService.js  (API communication)
│   ├── App.jsx                   (Updated with PlateDetection)
│   └── ...
└── ...

slnp/
├── api.py                        (Flask API server)
├── main.py                       (Original detection script)
├── best.pt                       (YOLO model)
├── requirements.txt              (Python dependencies)
└── ...
```

## Troubleshooting

### API Connection Issues

**Error: "Cannot connect to localhost:5000"**
- Ensure `python api.py` is running in the slnp directory
- Check if port 5000 is not in use: `netstat -ano | findstr :5000`
- Try accessing http://localhost:5000/health in a browser

### Tesseract Not Found

**Error: "TesseractNotFoundError"**
- Install Tesseract-OCR from: https://github.com/UB-Mannheim/tesseract/wiki
- Verify installation path in `api.py` line 22:
  ```python
  pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
  ```

### YOLO Model Not Found

**Error: "best.pt not found"**
- Ensure `best.pt` is in the `slnp` directory
- Check file path is correct in `api.py` line 21:
  ```python
  MODEL_PATH = "best.pt"
  ```

### Camera Permission Denied

**Error: "Camera access denied"**
- Grant camera permissions to your browser
- Use HTTPS for production (camera requires secure context)
- Try a different browser

### No Plates Detected

- Ensure the image quality is good
- Try different confidence thresholds (modify `conf=0.4` in `api.py` line 87)
- Test with sample images from your training dataset

## Running Both Services Simultaneously

**Option 1: Two Terminal Windows**

Terminal 1 (Backend):
```bash
cd slnp
python api.py
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

**Option 2: Using a Process Manager (Optional)**

Install `concurrently` to run both from one terminal:

```bash
npm install -g concurrently
concurrently "cd slnp && python api.py" "cd frontend && npm start"
```

## API Response Examples

### Successful Detection

```json
{
  "success": true,
  "detections": [
    {
      "bbox": {
        "x1": 45,
        "y1": 30,
        "x2": 120,
        "y2": 60
      },
      "raw_text": "ABC1234",
      "formatted_text": "ABC 1234",
      "confidence": 0.87
    }
  ],
  "image": "data:image/jpeg;base64,...",
  "detected_count": 1
}
```

### Error Response

```json
{
  "error": "No image provided"
}
```

## Performance Optimization

For better performance:

1. **Resize images**: The API automatically resizes to 320x256
2. **JPEG compression**: Use JPEG format instead of PNG for faster processing
3. **Batch processing**: Process multiple images efficiently

## Security Considerations

 **For Production:**
- Enable HTTPS/TLS
- Add authentication/API keys
- Implement rate limiting
- Validate file uploads
- Store results securely
- Run Flask with a production WSGI server (Gunicorn, uWSGI)

Example for production:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 api:app
```

## Next Steps

1. Start the Flask API: `python api.py`
2. Start the React frontend: `npm start`
3. Navigate to http://localhost:3000
4. Test with sample images or your camera

Enjoy your integrated SLNP Detection System!
