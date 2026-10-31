import { QtyStepper } from "./QtyStepper";

export function ItemRow({ item, qty, onChange, offline = false }) {
  const maxQty = offline ? item.totalQty : item.availableQty;
  const soldOut = maxQty <= 0;
  return (
    <li class={`item-row ${soldOut ? "sold-out" : ""}`}>
      <div class="item-info">
        <strong>{item.name}</strong>
        <small>
          {soldOut
            ? "Not available"
            : offline
              ? `Up to ${maxQty} in catalog`
              : `${item.availableQty} available`}
        </small>
      </div>
      {!soldOut && <QtyStepper value={qty} max={maxQty} onChange={onChange} />}
    </li>
  );
}
