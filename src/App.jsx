import { useState, useEffect } from "react";

const SUPABASE_URL = "https://fjzrcvuivtpevxzadwfy.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqenJjdnVpdnRwZXZ4emFkd2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NDg0NDEsImV4cCI6MjA5NTUyNDQ0MX0.lMOCRTaj3xeaTagohksZgZrXa-0PCwUmRZYdGQ7Luq4";
const HEADERS = { "Content-Type": "application/json", "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` };
const TIMESLOTS = ["14:00 - 16:00", "16:00 - 19:00"];
const ACTIVITIES = ["Workshop nước hoa", "Workshop cắm hoa", "Cả 2", "Chưa xác định"];
const ADMIN_PASSWORD = "Nh@u2005";

async function fetchGuests() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/guests?select=*&order=registered_at.desc`, { headers: HEADERS });
  return res.json();
}
async function dbUpdateGuest(id, fields) {
  await fetch(`${SUPABASE_URL}/rest/v1/guests?id=eq.${id}`, { method: "PATCH", headers: { ...HEADERS, "Prefer": "return=minimal" }, body: JSON.stringify(fields) });
}
async function dbDeleteOne(id) {
  await fetch(`${SUPABASE_URL}/rest/v1/guests?id=eq.${id}`, { method: "DELETE", headers: { ...HEADERS, "Prefer": "return=minimal" } });
}

function StatCard({ label, value, color, sub }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", borderLeft: `4px solid ${color}`, flex: 1 }}>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function EditModal({ guest, onConfirm, onCancel }) {
  const [pw, setPw] = useState(""); const [pwOk, setPwOk] = useState(false); const [pwError, setPwError] = useState("");
  const [name, setName] = useState(guest.name); const [activity, setActivity] = useState(guest.activity); const [timeslot, setTimeslot] = useState(guest.timeslot);
  function handleAuth() { if (pw === ADMIN_PASSWORD) { setPwOk(true); } else { setPwError("Mật khẩu không đúng."); } }
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, maxWidth: 380, width: "94%", boxSizing: "border-box" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>✏️</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a2e" }}>Chỉnh sửa thông tin</div>
          <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>#{guest.id} · QR không thay đổi</div>
        </div>
        {!pwOk ? (
          <>
            <input type="password" value={pw} onChange={e => { setPw(e.target.value); setPwError(""); }} onKeyDown={e => e.key === "Enter" && handleAuth()} placeholder="Mật khẩu Admin..."
              style={{ width: "100%", padding: "11px 14px", borderRadius: 8, fontSize: 14, boxSizing: "border-box", border: `2px solid ${pwError ? "#e24b4a" : "#ddd"}`, outline: "none", marginBottom: 8 }} autoFocus />
            {pwError && <div style={{ color: "#a32d2d", fontSize: 12, marginBottom: 8 }}>⚠️ {pwError}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onCancel} style={{ flex: 1, padding: "10px 0", border: "1px solid #ddd", borderRadius: 8, background: "#f5f5f5", cursor: "pointer" }}>Hủy</button>
              <button onClick={handleAuth} style={{ flex: 1, padding: "10px 0", background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>Xác nhận</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              <div><label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Họ và tên</label>
                <input value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }} /></div>
              <div><label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Activity</label>
                <select value={activity} onChange={e => setActivity(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, background: "#fff" }}>
                  {ACTIVITIES.map(a => <option key={a}>{a}</option>)}</select></div>
              <div><label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Timeslot</label>
                <select value={timeslot} onChange={e => setTimeslot(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, background: "#fff" }}>
                  {TIMESLOTS.map(t => <option key={t}>{t}</option>)}</select></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onCancel} style={{ flex: 1, padding: "10px 0", border: "1px solid #ddd", borderRadius: 8, background: "#f5f5f5", cursor: "pointer" }}>Hủy</button>
              <button onClick={() => onConfirm({ name: name.trim(), activity, timeslot })} style={{ flex: 1, padding: "10px 0", background: "#3B6D11", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>💾 Lưu</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DeleteModal({ guest, onConfirm, onCancel }) {
  const [pw, setPw] = useState(""); const [error, setError] = useState("");
  function handleConfirm() { if (pw === ADMIN_PASSWORD) { onConfirm(); } else { setError("Mật khẩu không đúng."); } }
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, maxWidth: 360, width: "94%", boxSizing: "border-box" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🗑️</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#a32d2d" }}>Xóa khách hàng?</div>
          <div style={{ fontSize: 14, color: "#555", marginTop: 6 }}><b>{guest.name}</b> — #{guest.id}</div>
          <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>Hành động này không thể hoàn tác.</div>
        </div>
        <input type="password" value={pw} onChange={e => { setPw(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && handleConfirm()} placeholder="Nhập mật khẩu Admin..."
          style={{ width: "100%", padding: "11px 14px", borderRadius: 8, fontSize: 14, boxSizing: "border-box", border: `2px solid ${error ? "#e24b4a" : "#ddd"}`, outline: "none", marginBottom: 8 }} autoFocus />
        {error && <div style={{ color: "#a32d2d", fontSize: 12, marginBottom: 8 }}>⚠️ {error}</div>}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "10px 0", border: "1px solid #ddd", borderRadius: 8, background: "#f5f5f5", cursor: "pointer" }}>Hủy</button>
          <button onClick={handleConfirm} style={{ flex: 1, padding: "10px 0", background: "#e24b4a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>Xóa</button>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({ label, total, checkedIn, expandKey, expanded, onToggle, absentList, onEdit, onDelete }) {
  const absent = total - checkedIn;
  const pct = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", boxShadow: "0 1px 5px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>{label}</div>
          <div style={{ display: "flex", gap: 8, fontSize: 13 }}>
            <span style={{ background: "#e8f0fb", color: "#185FA5", borderRadius: 20, padding: "2px 10px", fontWeight: 600 }}>Đăng ký: {total}</span>
            <span style={{ background: "#eaf3de", color: "#3B6D11", borderRadius: 20, padding: "2px 10px", fontWeight: 600 }}>Đã tới: {checkedIn}</span>
            <span onClick={absent > 0 ? onToggle : undefined}
              style={{ background: absent > 0 ? "#fdecea" : "#f5f5f5", color: absent > 0 ? "#e24b4a" : "#aaa", borderRadius: 20, padding: "2px 10px", fontWeight: 600, cursor: absent > 0 ? "pointer" : "default", userSelect: "none" }}>
              Chưa tới: {absent} {absent > 0 ? (expanded ? "▲" : "▼") : ""}
            </span>
          </div>
        </div>
        <div style={{ background: "#f0f0f0", borderRadius: 99, height: 10, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, background: pct === 100 ? "#3B6D11" : "linear-gradient(90deg,#185FA5,#3B6D11)", height: "100%", borderRadius: 99, transition: "width 0.4s" }} />
        </div>
        <div style={{ fontSize: 11, color: "#aaa", marginTop: 5, textAlign: "right" }}>{pct}% đã check-in</div>
      </div>
      {expanded && absent > 0 && (
        <div style={{ background: "#fff8f8", border: "1px solid #fdd", borderRadius: 10, padding: "10px 14px", marginTop: 4 }}>
          <div style={{ fontSize: 12, color: "#e24b4a", fontWeight: 700, marginBottom: 8 }}>Chưa check-in ({absent} người):</div>
          {absentList.map(g => (
            <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "0.5px solid #fdd" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a2e" }}>{g.name}</div>
                <div style={{ fontSize: 12, color: "#888" }}>#{g.id} · {g.activity} · {g.timeslot}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => onEdit(g)} style={{ padding: "4px 10px", border: "none", borderRadius: 6, background: "#F5A623", color: "#fff", cursor: "pointer", fontSize: 12 }}>✏️</button>
                <button onClick={() => onDelete(g)} style={{ padding: "4px 10px", border: "none", borderRadius: 6, background: "#e24b4a", color: "#fff", cursor: "pointer", fontSize: 12 }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function load() {
    setLoading(true);
    const data = await fetchGuests();
    setGuests(Array.isArray(data) ? data : []);
    setLastUpdated(new Date().toLocaleTimeString("vi-VN"));
    setLoading(false);
  }

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  function toggle(key) { setExpanded(prev => ({ ...prev, [key]: !prev[key] })); }
  function togglePresent(key) { setExpanded(prev => ({ ...prev, [`p_${key}`]: !prev[`p_${key}`] })); }

  const total = guests.length;
  const checkedIn = guests.filter(g => g.checked_in).length;
  const absent = total - checkedIn;
  const pct = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 14px", fontFamily: "sans-serif", background: "#f4f6fb", minHeight: "100vh" }}>
      {editTarget && (
        <EditModal guest={editTarget}
          onConfirm={async (fields) => {
            await dbUpdateGuest(editTarget.id, { name: fields.name, activity: fields.activity, timeslot: fields.timeslot });
            setGuests(prev => prev.map(g => g.id === editTarget.id ? { ...g, ...fields } : g));
            setEditTarget(null);
          }}
          onCancel={() => setEditTarget(null)} />
      )}
      {deleteTarget && (
        <DeleteModal guest={deleteTarget}
          onConfirm={async () => {
            await dbDeleteOne(deleteTarget.id);
            setGuests(prev => prev.filter(g => g.id !== deleteTarget.id));
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)} />
      )}

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1a2e" }}>📊 Dashboard Sự kiện</div>
        <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>
          Tự động cập nhật mỗi 30 giây {lastUpdated && `· Lần cuối: ${lastUpdated}`}
        </div>
        <button onClick={load} style={{ marginTop: 8, padding: "6px 20px", background: "#185FA5", color: "#fff", border: "none", borderRadius: 20, cursor: "pointer", fontSize: 13 }}>🔄 Làm mới</button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#888", fontSize: 16 }}>⏳ Đang tải dữ liệu...</div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <StatCard label="Tổng đăng ký" value={total} color="#185FA5" sub="100%" />
            <StatCard label="Đã check-in" value={checkedIn} color="#3B6D11" sub={`${pct}%`} />
            <StatCard label="Chưa tới" value={absent} color="#e24b4a" sub={`${100 - pct}%`} />
          </div>

          <div style={{ background: "#fff", borderRadius: 12, padding: "14px 20px", marginBottom: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: "#1a1a2e" }}>Tiến độ check-in tổng thể</span>
              <span style={{ color: "#3B6D11", fontWeight: 800 }}>{pct}%</span>
            </div>
            <div style={{ background: "#f0f0f0", borderRadius: 99, height: 14, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, background: "linear-gradient(90deg,#185FA5,#3B6D11)", height: "100%", borderRadius: 99, transition: "width 0.5s" }} />
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>📅 Theo Timeslot</div>
          <div style={{ marginBottom: 20 }}>
            {TIMESLOTS.map(ts => {
              const group = guests.filter(g => g.timeslot === ts);
              const ci = group.filter(g => g.checked_in).length;
              const absentList = group.filter(g => !g.checked_in);
              const key = `ts_${ts}`;
              return <BreakdownRow key={ts} label={ts} total={group.length} checkedIn={ci} expandKey={key} expanded={!!expanded[key]} onToggle={() => toggle(key)} absentList={absentList} onEdit={setEditTarget} onDelete={setDeleteTarget} />;
            })}
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>🎨 Theo Activity</div>
          <div style={{ marginBottom: 20 }}>
            {ACTIVITIES.map(act => {
              const group = guests.filter(g => g.activity === act);
              if (group.length === 0) return null;
              const ci = group.filter(g => g.checked_in).length;
              const absentList = group.filter(g => !g.checked_in);
              const key = `act_${act}`;
              return <BreakdownRow key={act} label={act} total={group.length} checkedIn={ci} expandKey={key} expanded={!!expanded[key]} onToggle={() => toggle(key)} absentList={absentList} onEdit={setEditTarget} onDelete={setDeleteTarget} />;
            })}
          </div>
        </>
      )}
    </div>
  );
}
