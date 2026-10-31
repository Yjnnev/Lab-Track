import { useEffect, useMemo, useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { watchItems } from "../lib/items";
import { createSlip } from "../lib/slips";
import { submitSurvey } from "../lib/surveys";
import { useCurrentUser } from "../lib/currentUser";
import { ItemRow } from "../components/ItemRow";
import { InstallAppButton } from "../components/InstallAppButton";

const emptyDetails = {
  groupNumber: "",
  leaderName: "",
  leaderIdNumber: "",
  instructorName: "",
};

export function Borrow() {
  const { user } = useCurrentUser();
  const { route } = useLocation();

  const [step, setStep] = useState("items"); // items -> details -> review
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(() => typeof navigator === "undefined" ? true : navigator.onLine);
  const [catalogFromCache, setCatalogFromCache] = useState(false);
  const offline = !isOnline || catalogFromCache;
  const [search, setSearch] = useState("");
  const [qty, setQty] = useState({}); // { itemId: number }
  const [details, setDetails] = useState(emptyDetails);
  const [members, setMembers] = useState([{ name: "", idNumber: "" }]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [autoFillSurvey, setAutoFillSurvey] = useState(false);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    return watchItems(
      (list, metadata) => {
        setItems(list);
        setCatalogFromCache(metadata.fromCache);
        setLoading(false);
      },
      { onlyActive: true }
    );
  }, []);

  const selected = useMemo(() => items.filter((i) => (qty[i.id] || 0) > 0), [items, qty]);
  const totalUnits = selected.reduce((sum, i) => sum + qty[i.id], 0);
  const visible = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  function setQuantity(item, value) {
    const maxQty = offline ? item.totalQty : item.availableQty;
    const n = Math.max(0, Math.min(maxQty, Math.floor(Number(value)) || 0));
    setQty((q) => ({ ...q, [item.id]: n }));
  }

  // Shortcut so each input is one line: <input {...field("leaderName")} />
  const field = (key) => ({
    value: details[key],
    onInput: (e) => setDetails({ ...details, [key]: e.currentTarget.value }),
  });

  function updateMember(i, key, value) {
    setMembers(members.map((m, idx) => (idx === i ? { ...m, [key]: value } : m)));
  }
  const addMember = () => setMembers([...members, { name: "", idNumber: "" }]);
  const removeMember = (i) => setMembers(members.filter((_, idx) => idx !== i));

  function toDetails() {
    if (selected.length === 0) return setError("Pick at least one item.");
    setError("");
    setStep("details");
  }

  function toReview() {
    const n = Number(details.groupNumber);
    if (!Number.isInteger(n) || n <= 0) return setError("Enter a valid group number.");
    if (!details.leaderName.trim() || !details.leaderIdNumber.trim()) {
      return setError("Enter the leader's name and ID number.");
    }
    if (!details.instructorName.trim()) return setError("Enter your instructor's name.");
    setError("");
    setStep("review");
  }

  async function submit() {
    if (submitting) return;
    setSubmitting(true);

    const { id, done } = createSlip({
      groupNumber: Number(details.groupNumber),
      leaderName: details.leaderName.trim(),
      leaderIdNumber: details.leaderIdNumber.trim(),
      leaderEmail: user.email,
      members: members
        .filter((m) => m.name.trim())
        .map((m) => ({ name: m.name.trim(), idNumber: m.idNumber.trim() })),
      items: selected.map((i) => ({
        itemId: i.id,
        name: i.name,
        qtyRequested: qty[i.id],
        qtyReleased: 0,
        qtyReturned: 0,
        remarks: "",
      })),
      instructorName: details.instructorName.trim(),
      leaderSignature: "", // signatures come in the next step
      instructorSignature: "",
    });

    // Not awaited on purpose, so it works offline. Go straight to the next page.
    done.catch((err) => console.error("Slip was not saved:", err));

    if (offline) {
      route(`/slips/${id}`);
      return;
    }

    if (autoFillSurvey) {
      try {
        await submitSurvey(id, { name: details.leaderName.trim(), college: "", improvement: "" }, true);
        route(`/slips/${id}`);
      } catch (err) {
        console.error("Survey was not saved:", err);
        route(`/survey/${id}`);
      }
    } else {
      route(`/survey/${id}`);
    }
  }

  // ---------- Step 1: pick items ----------
  if (step === "items") {
    return (
      <div class="borrow">
        <h2>Pick equipment</h2>
        <InstallAppButton />
        {offline && (
          <div class="notice offline-notice" role="status">
            <strong>Offline catalog</strong>
            <p>You are viewing the last catalog saved on this device. You can still prepare a borrow request; item availability will be confirmed by the lab admin when it syncs.</p>
          </div>
        )}
        <input class="search" placeholder="Search items" value={search}
          onInput={(e) => setSearch(e.currentTarget.value)} />

        {loading && <p>Loading...</p>}
        {!loading && items.length === 0 && (
          <p>{offline ? "No saved catalog is available yet. Connect to the internet once to download the equipment list." : "No equipment is listed yet."}</p>
        )}

        <ul class="item-list">
          {visible.map((item) => (
            <ItemRow key={item.id} item={item} qty={qty[item.id] || 0}
              onChange={(v) => setQuantity(item, v)} offline={offline} />
          ))}
        </ul>

        {error && <p class="error">{error}</p>}
        <div class="actions">
          <span>{totalUnits} item(s) selected</span>
          <button class="btn" onClick={toDetails}>Next</button>
        </div>
      </div>
    );
  }

  // ---------- Step 2: group details ----------
  if (step === "details") {
    return (
      <div class="borrow">
        <h2>Group details</h2>

        <label>Group number
          <input type="number" inputMode="numeric" min="1" {...field("groupNumber")} />
        </label>
        <label>Leader's name
          <input {...field("leaderName")} />
        </label>
        <label>Leader's ID number
          <input {...field("leaderIdNumber")} />
        </label>
        <label>Instructor's name
          <input {...field("instructorName")} />
        </label>

        <h3>Other members</h3>
        {members.map((m, i) => (
          <div class="member-row" key={i}>
            <input placeholder="Name" value={m.name}
              onInput={(e) => updateMember(i, "name", e.currentTarget.value)} />
            <input placeholder="ID number" value={m.idNumber}
              onInput={(e) => updateMember(i, "idNumber", e.currentTarget.value)} />
            {members.length > 1 && (
              <button type="button" class="btn-link" onClick={() => removeMember(i)}>Remove</button>
            )}
          </div>
        ))}
        <button type="button" class="btn-link" onClick={addMember}>+ Add member</button>

        {error && <p class="error">{error}</p>}
        <div class="actions">
          <button class="btn-link" onClick={() => { setError(""); setStep("items"); }}>Back</button>
          <button class="btn" onClick={toReview}>Review</button>
        </div>
      </div>
    );
  }

  // ---------- Step 3: review and submit ----------
  return (
    <div class="borrow">
      <h2>Review your slip</h2>

      <p>
        <strong>Group {details.groupNumber}</strong><br />
        Leader: {details.leaderName} ({details.leaderIdNumber})<br />
        Instructor: {details.instructorName}
      </p>

      <h3>Items</h3>
      <ul class="review-list">
        {selected.map((i) => (
          <li key={i.id}>{qty[i.id]} × {i.name}</li>
        ))}
      </ul>

      {members.some((m) => m.name.trim()) && (
        <>
          <h3>Members</h3>
          <ul class="review-list">
            {members.filter((m) => m.name.trim()).map((m, i) => (
              <li key={i}>{m.name} {m.idNumber && `(${m.idNumber})`}</li>
            ))}
          </ul>
        </>
      )}

      <label class="survey-opt-in">
        <input
          type="checkbox"
          checked={autoFillSurvey}
          onChange={(e) => setAutoFillSurvey(e.currentTarget.checked)}
        />
        Do you want to automatically fill up the form? It gives the survey the best satisfaction rating by default.
      </label>

      <div class="actions">
        <button class="btn-link" onClick={() => setStep("details")}>Back</button>
        <button class="btn" disabled={submitting} onClick={submit}>
          {submitting ? "Submitting..." : "Submit slip"}
        </button>
      </div>
    </div>
  );
}
