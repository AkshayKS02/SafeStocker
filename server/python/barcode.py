import cv2
from pyzbar import pyzbar
import tkinter as tk
from tkinter import simpledialog
import requests

# ---------------- Settings ----------------
NODE_SERVER_URL = "http://localhost:5000/barcode"

# Tkinter root (for quantity popup)
root = tk.Tk()
root.withdraw()

# Track scanned barcodes to avoid repeated popups
scanned_history = {}

# ---------------- Send barcode to Node server ----------------
def send_to_node(barcode_value, quantity):
    try:
        res = requests.post(NODE_SERVER_URL, json={
            "barcode": barcode_value,
            "quantity": quantity
        })
        print("[Scanner] Node Response:", res.json())
    except:
        print("[Scanner Error] Could not send barcode to Node.js server")

# ---------------- Ask user for quantity ----------------
def get_quantity(barcode):
    q = simpledialog.askinteger(
        "Quantity", 
        f"Enter quantity for {barcode}:", 
        minvalue=1, maxvalue=100
    )
    return q if q else 1

# ---------------- Scan barcodes from webcam ----------------
def scan_barcodes(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    barcodes = pyzbar.decode(gray)

    for barcode in barcodes:
        data = barcode.data.decode("utf-8")

        # Ask only once for each barcode
        if data not in scanned_history:
            qty = get_quantity(data)
            scanned_history[data] = qty
            send_to_node(data, qty)

        # Draw bounding box
        x, y, w, h = barcode.rect
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 3)
        cv2.putText(frame, f"{data} x{scanned_history[data]}",
                    (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX,
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
        cv2.imshow("Scanner - Press 'q' to Quit", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

# ---------------- Main ----------------
webcam_scanner()
