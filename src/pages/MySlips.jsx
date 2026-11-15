import { useEffect, useState } from "preact/hooks";
import { useCurrentUser } from "../lib/currentUser";
import { watchMySlips } from "../lib/slips";
import { SlipCard } from "../components/SlipCard";
import "../styles/Slips.css";

export function MySlips() {
  const { user } = useCurrentUser();
  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    return watchMySlips(user.uid, (list) => {
      setSlips(list);
      setLoading(false);
    });
  }, [user?.uid]);

  return (
    <div>
      <h2>My slips</h2>
      {loading && <p>Loading...</p>}
      {!loading && slips.length === 0 && (
        <div class="empty-state">
          <p>No slips yet.</p>
          <a class="btn" href="/borrow">Borrow equipment</a>
        </div>
      )}
      <div class="slip-list">
        {slips.map((s) => (
          <SlipCard key={s.id} slip={s} href={`/slips/${s.id}`} />
        ))}
      </div>
    </div>
  );
}