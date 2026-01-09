import cv2
import numpy as np
from ultralytics import YOLO
import pytesseract
import easyocr
import re
import os
os.environ["YOLO_VERBOSE"] = "False"

# ------------------------------
# SET PATHS
# ------------------------------
MODEL_PATH = "best.pt"     # Your trained SL model
OUTPUT_PLATE = "./Output/plate.png"
OUTPUT_CLEAN = "./Output/plate_clean.png"

# ------------------------------
# LOAD YOLO MODEL + OCR
# ------------------------------
model = YOLO(MODEL_PATH)
reader = easyocr.Reader(['en'])

# Tesseract config
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


# ------------------------------
# FORMAT SRI LANKAN PLATE
# ------------------------------
def format_plate(p):
    p = p.upper()
    p = "".join(c for c in p if c.isalnum())

    match = re.match(r'([A-Z]{1,3})([A-Z]{0,3})(\d{3,4})', p)
    if match:
        return " ".join([x for x in match.groups() if x])
    return p


# ------------------------------
# OCR PREPROCESSING PIPELINE
# ------------------------------
def preprocess_for_ocr(img):
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

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3,3))
    clean = cv2.morphologyEx(th, cv2.MORPH_CLOSE, kernel, iterations=2)

    cv2.imwrite(OUTPUT_CLEAN, clean)
    return clean


# ------------------------------
# OCR READING
# ------------------------------
def read_plate_text(clean):
    easy = reader.readtext(clean)
    easy_text = "".join([d[1] for d in easy])

    tess_text = pytesseract.image_to_string(
        clean,
        config="--oem 3 --psm 7 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    )

    combined = (easy_text + tess_text).upper()
    final = "".join(c for c in combined if c.isalnum())

    return final


# ------------------------------
# REAL-TIME DETECTION
# ------------------------------
cap = cv2.VideoCapture(0)

print("Press 'q' to exit.")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame_small = cv2.resize(frame, (320, 256))
    results = model.predict(frame_small, conf=0.4)

    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)

            plate = frame_small[y1:y2, x1:x2]
            if plate.size == 0:
                continue

            cv2.imwrite(OUTPUT_PLATE, plate)

            clean = preprocess_for_ocr(plate)
            raw_text = read_plate_text(clean)
            formatted = format_plate(raw_text)

            print("\n--------------------------------")
            print(" RAW:", raw_text)
            print(" FORMATTED:", formatted)
            print("--------------------------------\n")

            cv2.rectangle(frame_small, (x1,y1), (x2,y2), (0,255,0), 2)
            cv2.putText(frame_small, formatted, (x1, y1-10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,255,0), 2)

    cv2.imshow("Sri Lanka Number Plate Detection", frame_small)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
