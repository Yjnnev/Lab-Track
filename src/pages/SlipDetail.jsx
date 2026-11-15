import { useEffect, useState } from "preact/hooks";
import QRCode from "qrcode";
import { watchSlip } from "../lib/slips";
import "../styles/Slips.css";

export function SlipDetail({ params }) {
  const [slip, setSlip] = useState(undefined); // undefined = loading, null = not found
  const [qr, setQr] = useState("");

  useEffect(() => watchSlip(params.id, setSlip), [params.id]);

  useEffect(() => {
    if (slip?.code) {
      QRCode.toDataURL(slip.code, { width: 240, margin: 1 }).then(setQr);
    }
  }, [slip?.code]);

  if (slip === undefined) return <p>Loading...</p>;
  if (slip === null) return <p>Slip not found.</p>;

  return (
    <div class="slip">
      <h2>Slip for Group {slip.groupNumber}</h2>
      <p class="status">Status: <strong>{slip.status}</strong></p>

      {slip.status === "submitted" && (
        <div class="slip-code">
          <p>Show this to the lab technician:</p>
          {qr && <img src={qr} alt={`QR code for slip ${slip.code}`} width="240" height="240" />}
          <p class="code">{slip.code}</p>
        </div>
      )}

      {slip.pendingSync && (
        <p class="notice">Saved on this phone. It will sync when you have signal.</p>
      )}

      <h3>Items</h3>
      <ul class="review-list">
        {slip.items.map((i) => (
          <li key={i.itemId}>
            {i.qtyRequested} × {i.name}
            {slip.status !== "submitted" && ` (released ${i.qtyReleased}, returned ${i.qtyReturned})`}
          </li>
        ))}
      </ul>

      <div class="slip-actions">
        <a class="btn" href="/slips">Back to my slips</a>
      </div>
    </div>
  );
}