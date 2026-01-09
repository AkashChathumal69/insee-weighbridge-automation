from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from ultralytics import YOLO
import pytesseract
import easyocr
import re
import os
import base64
from io import BytesIO
from PIL import Image

os.environ["YOLO_VERBOSE"] = "False"

app = Flask(__name__)
CORS(app)

# Configuration
MODEL_PATH = "best.pt"
OUTPUT_PLATE = "./Output/plate.png"
OUTPUT_CLEAN = "./Output/plate_clean.png"

# Create output directory if not exists
os.makedirs("./Output", exist_ok=True)

# Load YOLO Model + OCR
model = YOLO(MODEL_PATH)
reader = easyocr.Reader(['en'])

# Tesseract config
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def format_plate(p):
    """Format Sri Lankan number plate"""
    p = p.upper()
    p = "".join(c for c in p if c.isalnum())
    
    match = re.match(r'([A-Z]{1,3})([A-Z]{0,3})(\d{3,4})', p)
    if match:
        return " ".join([x for x in match.groups() if x])
    return p


def preprocess_for_ocr(img):
    """Preprocess image for OCR"""
    plate_big = cv2.resize(img, None, fx=3, fy=3, interpolation=cv2.INTER_CUBIC)
    gray = cv2.cvtColor(plate_big, cv2.COLOR_BGR2GRAY)
    
    gray = cv2.bilateralFilter(gray, 15, 25, 25)
    
    kernel_sharp = np.array([[0, -1, 0],
                             [-1, 5, -1],
                             [0, -1, 0]])
    sharp = cv2.filter2D(gray, -1, kernel_sharp)
    
    th = cv2.adaptiveThreshold(sharp, 255,
                               cv2.ADAPTIVE_THRESH_MEAN_C,
                               cv2.THRESH_BINARY_INV,
                               41, 15)
    
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    clean = cv2.morphologyEx(th, cv2.MORPH_CLOSE, kernel, iterations=2)
    
    cv2.imwrite(OUTPUT_CLEAN, clean)
    return clean


def read_plate_text(clean):
    """Read text from plate"""
    easy = reader.readtext(clean)
    easy_text = "".join([d[1] for d in easy])
    
    tess_text = pytesseract.image_to_string(
        clean,
        config="--oem 3 --psm 7 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    )
    
    combined = (easy_text + tess_text).upper()
    final = "".join(c for c in combined if c.isalnum())
    
    return final


def detect_plates_in_image(frame):
    """Detect number plates in image"""
    results = model.predict(frame, conf=0.4)
    detections = []
    
    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
            confidence = float(box.conf[0].cpu().numpy())
            
            plate = frame[y1:y2, x1:x2]
            if plate.size == 0:
                continue
            
            cv2.imwrite(OUTPUT_PLATE, plate)
            
            clean = preprocess_for_ocr(plate)
            raw_text = read_plate_text(clean)
            formatted = format_plate(raw_text)
            
            detections.append({
                "bbox": {"x1": int(x1), "y1": int(y1), "x2": int(x2), "y2": int(y2)},
                "raw_text": raw_text,
                "formatted_text": formatted,
                "confidence": confidence
            })
    
    return detections


def image_to_base64(image_array):
    """Convert OpenCV image to base64 string"""
    _, buffer = cv2.imencode('.jpg', image_array)
    return base64.b64encode(buffer).decode('utf-8')


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "SLNP API is running"})


@app.route('/detect', methods=['POST'])
def detect():
    """
    Detect number plates in uploaded image
    Expects multipart/form-data with 'image' file
    """
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No image selected"}), 400
        
        # Read image
        img_data = file.read()
        nparr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({"error": "Invalid image"}), 400
        
        # Resize for processing
        frame_small = cv2.resize(frame, (320, 256))
        
        # Detect plates
        detections = detect_plates_in_image(frame_small)
        
        # Prepare response image with detections drawn
        response_frame = frame_small.copy()
        for det in detections:
            bbox = det["bbox"]
            x1, y1, x2, y2 = bbox["x1"], bbox["y1"], bbox["x2"], bbox["y2"]
            cv2.rectangle(response_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(response_frame, det["formatted_text"], (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        return jsonify({
            "success": True,
            "detections": detections,
            "image": image_to_base64(response_frame),
            "detected_count": len(detections)
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/detect-base64', methods=['POST'])
def detect_base64():
    """
    Detect number plates in base64 encoded image
    Expects JSON with 'image' field containing base64 string
    """
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"error": "No image provided"}), 400
        
        # Decode base64 image
        img_data = base64.b64decode(data['image'])
        nparr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({"error": "Invalid image"}), 400
        
        # Resize for processing
        frame_small = cv2.resize(frame, (320, 256))
        
        # Detect plates
        detections = detect_plates_in_image(frame_small)
        
        # Prepare response image
        response_frame = frame_small.copy()
        for det in detections:
            bbox = det["bbox"]
            x1, y1, x2, y2 = bbox["x1"], bbox["y1"], bbox["x2"], bbox["y2"]
            cv2.rectangle(response_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(response_frame, det["formatted_text"], (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        return jsonify({
            "success": True,
            "detections": detections,
            "image": image_to_base64(response_frame),
            "detected_count": len(detections)
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    print("Starting SLNP Detection API on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
