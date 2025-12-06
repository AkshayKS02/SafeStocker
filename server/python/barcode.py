import cv2
from pyzbar import pyzbar
import requests

# ---------------- Settings ----------------
NODE_SERVER_URL = "http://localhost:5000/barcode"

# Track scanned barcodes to avoid repeated sending
scanned_history = set()

# ---------------- Send barcode to Node server ----------------
def send_to_node(barcode_value):
    try:
        res = requests.post(
            NODE_SERVER_URL,
            json={"barcode": barcode_value},
            timeout=2
        )

        if res.status_code == 200:
            print(barcode_value)           # Success → print barcode
        else:
            print("ERROR")                 # Node responded with error

    except Exception as e:
        print("ERROR")                     # Network error



# ---------------- Scan barcodes from webcam ----------------
def scan_barcodes(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)
    barcodes = pyzbar.decode(gray)

    for barcode in barcodes:
        data = barcode.data.decode("utf-8")

        if data not in scanned_history:
            scanned_history.add(data)
            send_to_node(data)

        # Draw bounding box and text
        x, y, w, h = barcode.rect
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 3)
        cv2.putText(frame, f"{data}", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX,
                    0.7, (0, 255, 0), 2)

    return frame

# ---------------- Webcam Scanner ----------------
def webcam_scanner():
    cap = cv2.VideoCapture(0)
    cap.set(3, 1280)
    cap.set(4, 720)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = scan_barcodes(frame)

        # Draw center rectangle for guidance
        height, width, _ = frame.shape
        box_width = 400
        box_height = 300
        x1 = (width - box_width) // 2
        y1 = (height - box_height) // 2
        x2 = x1 + box_width
        y2 = y1 + box_height
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 3)

        cv2.imshow("Scanner - Press 'q' to Quit", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

# ---------------- Barcode Scanner Device Mode ----------------
def scanner_device_mode():
    print("Scanner device mode: Scan items (type 'quit' to stop)")

    while True:
        barcode_data = input("Scan barcode: ").strip()
        if barcode_data.lower() == 'quit':
            break

        if barcode_data not in scanned_history:
            scanned_history.add(barcode_data)
            send_to_node(barcode_data)
            print(f"Scanned: {barcode_data}")
        else:
            print("Already scanned.")

# ---------------- Run Scanner ----------------
webcam_scanner()

