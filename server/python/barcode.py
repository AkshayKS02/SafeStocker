import cv2
from pyzbar import pyzbar

scanned_history = set()

def scan_barcodes(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    barcodes = pyzbar.decode(gray)

    for barcode in barcodes:
        data = barcode.data.decode("utf-8")

        if data not in scanned_history:
            scanned_history.add(data)
            print(data, flush=True)  # ONLY output

        x, y, w, h = barcode.rect
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv2.putText(frame, data, (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

    return frame


def webcam_scanner():
    cap = cv2.VideoCapture(0)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = scan_barcodes(frame)
        cv2.imshow("Scanner (press q to quit)", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


webcam_scanner()
