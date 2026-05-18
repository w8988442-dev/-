import { useState, useEffect } from "react";

const REWARDS = [
  { id: 1, name: "优惠券 ¥10", points: 100, icon: "🎫", stock: 50 },
  { id: 2, name: "精美礼品袋", points: 200, icon: "🎁", stock: 30 },
  { id: 3, name: "免费午餐", points: 350, icon: "🍱", stock: 20 },
  { id: 4, name: "SPA体验券", points: 500, icon: "💆", stock: 10 },
  { id: 5, name: "豪华礼品套装", points: 800, icon: "👑", stock: 5 },
  { id: 6, name: "旅游大礼包", points: 1500, icon: "✈️", stock: 2 },
];

const PRIZE_TIERS = [
  { label: "一等奖", points: 500, color: "#FFD700", emoji: "🥇" },
  { label: "二等奖", points: 200, color: "#C0C0C0", emoji: "🥈" },
  { label: "三等奖", points: 100, color: "#CD7F32", emoji: "🥉" },
  { label: "幸运奖", points: 50, color: "#4FC3F7", emoji: "🍀" },
  { label: "参与奖", points: 10, color: "#A5D6A7", emoji: "⭐" },
];

const initialCustomers = [
  { id: 1, name: "张小明", phone: "138****8888", points: 650, history: [{ date: "2026-05-10", prize: "二等奖", pts: 200 }, { date: "2026-05-15", prize: "一等奖", pts: 500 }, { date: "2026-05-16", prize: "兑换: 精美礼品袋", pts: -200 }] },
  { id: 2, name: "李华", phone: "139****6666", points: 310, history: [{ date: "2026-05-12", prize: "三等奖", pts: 100 }, { date: "2026-05-14", prize: "幸运奖", pts: 50 }, { date: "2026-05-17", prize: "三等奖", pts: 100 }, { date: "2026-05-17", prize: "幸运奖", pts: 50 }] },
  { id: 3, name: "王芳", phone: "150****5555", points: 60, history: [{ date: "2026-05-16", prize: "参与奖", pts: 10 }, { date: "2026-05-18", prize: "幸运奖", pts: 50 }] },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [customers, setCustomers] = useState(initialCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [prizeTarget, setPrizeTarget] = useState(null);
  const [redeemTarget, setRedeemTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState(null);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);

  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const totalCustomers = customers.length;
  const totalPoints = customers.reduce((s, c) => s + c.points, 0);
  const totalWins = customers.reduce((s, c) => s + c.history.filter(h => h.pts > 0).length, 0);

  const filteredCustomers = customers.filter(c =>
    c.name.includes(searchQuery) || c.phone.includes(searchQuery)
  );

  const addCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) return;
    const nc = { id: Date.now(), name: newCustomer.name, phone: newCustomer.phone, points: 0, history: [] };
    setCustomers([...customers, nc]);
    setNewCustomer({ name: "", phone: "" });
    setShowAddModal(false);
    showNotif(`客户 ${nc.name} 添加成功！`);
  };

  const awardPrize = () => {
    if (!selectedPrize || !prizeTarget) return;
    const today = new Date().toISOString().slice(0, 10);
    setCustomers(customers.map(c => c.id === prizeTarget.id
      ? { ...c, points: c.points + selectedPrize.points, history: [{ date: today, prize: selectedPrize.label, pts: selectedPrize.points }, ...c.history] }
      : c
    ));
    showNotif(`🎉 已为 ${prizeTarget.name} 记录 ${selectedPrize.label}，+${selectedPrize.points} 积分！`);
    setShowPrizeModal(false);
    setSelectedPrize(null);
    setPrizeTarget(null);
  };

  const redeemReward = () => {
    if (!selectedReward || !redeemTarget) return;
    if (redeemTarget.points < selectedReward.points) { showNotif("积分不足！", "error"); return; }
    const today = new Date().toISOString().slice(0, 10);
    setCustomers(customers.map(c => c.id === redeemTarget.id
      ? { ...c, points: c.points - selectedReward.points, history: [{ date: today, prize: `兑换: ${selectedReward.name}`, pts: -selectedReward.points }, ...c.history] }
      : c
    ));
    showNotif(`✅ ${redeemTarget.name} 成功兑换 ${selectedReward.name}！`);
    setShowRedeemModal(false);
    setSelectedReward(null);
    setRedeemTarget(null);
  };

  const getLevel = (pts) => {
    if (pts >= 1000) return { label: "钻石会员", color: "#60A5FA", icon: "💎" };
    if (pts >= 500) return { label: "黄金会员", color: "#FBBF24", icon: "🥇" };
    if (pts >= 200) return { label: "白银会员", color: "#9CA3AF", icon: "🥈" };
    return { label: "普通会员", color: "#6EE7B7", icon: "⭐" };
  };

  return (
    <div style={{ fontFamily: "'Noto Sans SC', sans-serif", background: "#0F1117", minHeight: "100vh", color: "#E2E8F0" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap" rel="stylesheet" />

      {/* Notification */}
      {notification && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: notification.type === "error" ? "#7F1D1D" : "#064E3B",
          border: `1px solid ${notification.type === "error" ? "#EF4444" : "#10B981"}`,
          color: notification.type === "error" ? "#FCA5A5" : "#6EE7B7",
          padding: "12px 20px", borderRadius: 10, fontWeight: 500,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)", maxWidth: 320
        }}>
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1A1F2E 0%, #16213E 100%)", borderBottom: "1px solid #1E293B", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #6366F1, #8B5CF6)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎰</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: 1 }}>中奖积分管理系统</div>
              <div style={{ fontSize: 11, color: "#6B7280", letterSpacing: 2 }}>LUCKY POINTS MANAGER</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["dashboard", "customers", "rewards"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
                background: tab === t ? "linear-gradient(135deg, #6366F1, #8B5CF6)" : "transparent",
                color: tab === t ? "#fff" : "#9CA3AF",
                transition: "all .2s"
              }}>
                {t === "dashboard" ? "📊 概览" : t === "customers" ? "👥 客户" : "🎁 奖品"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px" }}>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <div>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
              {[
                { label: "总客户数", value: totalCustomers, icon: "👥", color: "#6366F1", bg: "#1E1B4B" },
                { label: "累计发放积分", value: totalPoints.toLocaleString(), icon: "⚡", color: "#F59E0B", bg: "#1C1917" },
                { label: "累计中奖次数", value: totalWins, icon: "🎯", color: "#10B981", bg: "#022C22" },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 14, padding: "20px 24px" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Prize Tiers Reference */}
            <div style={{ background: "#161B27", border: "1px solid #1E293B", borderRadius: 14, padding: 20, marginBottom: 28 }}>
              <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>🏆 奖项积分对照表</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {PRIZE_TIERS.map(p => (
                  <div key={p.label} style={{ background: "#0F1117", border: `1px solid ${p.color}44`, borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{p.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: p.color, fontSize: 14 }}>{p.label}</div>
                      <div style={{ fontSize: 12, color: "#9CA3AF" }}>+{p.points} 积分</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top customers */}
            <div style={{ background: "#161B27", border: "1px solid #1E293B", borderRadius: 14, padding: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>🌟 积分排行榜</div>
              {[...customers].sort((a, b) => b.points - a.points).slice(0, 5).map((c, i) => {
                const lvl = getLevel(c.points);
                return (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < 4 ? "1px solid #1E293B" : "none" }}>
                    <div style={{ width: 28, fontWeight: 900, color: i === 0 ? "#FBBF24" : i === 1 ? "#9CA3AF" : i === 2 ? "#CD7F32" : "#374151", textAlign: "center" }}>{i + 1}</div>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${lvl.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: `1px solid ${lvl.color}44` }}>{lvl.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: lvl.color }}>{lvl.label}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: "#6366F1", fontSize: 18 }}>{c.points.toLocaleString()} <span style={{ fontSize: 12, color: "#6B7280" }}>积分</span></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CUSTOMERS */}
        {tab === "customers" && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
              <input
                placeholder="搜索姓名或手机号..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ flex: 1, background: "#161B27", border: "1px solid #1E293B", borderRadius: 10, padding: "10px 16px", color: "#E2E8F0", fontSize: 14, outline: "none" }}
              />
              <button onClick={() => setShowAddModal(true)} style={{
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#fff", border: "none",
                borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap"
              }}>+ 新增客户</button>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {filteredCustomers.map(c => {
                const lvl = getLevel(c.points);
                return (
                  <div key={c.id} style={{ background: "#161B27", border: "1px solid #1E293B", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${lvl.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: `2px solid ${lvl.color}44` }}>{lvl.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: "#6B7280" }}>{c.phone}</div>
                      <span style={{ fontSize: 11, color: lvl.color, background: `${lvl.color}11`, border: `1px solid ${lvl.color}33`, borderRadius: 6, padding: "2px 8px", display: "inline-block", marginTop: 4 }}>{lvl.label}</span>
                    </div>
                    <div style={{ textAlign: "center", marginRight: 8 }}>
                      <div style={{ fontWeight: 900, fontSize: 22, color: "#6366F1" }}>{c.points.toLocaleString()}</div>
                      <div style={{ fontSize: 11, color: "#6B7280" }}>积分</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => { setDetailTarget(c); setShowDetailModal(true); }} style={{ background: "#1E293B", color: "#94A3B8", border: "none", borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontSize: 12 }}>📋 记录</button>
                      <button onClick={() => { setPrizeTarget(c); setShowPrizeModal(true); }} style={{ background: "#1B1F3A", color: "#818CF8", border: "1px solid #3730A3", borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontSize: 12 }}>🎯 中奖</button>
                      <button onClick={() => { setRedeemTarget(c); setShowRedeemModal(true); }} style={{ background: "#0A2818", color: "#34D399", border: "1px solid #064E3B", borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontSize: 12 }}>🎁 兑换</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* REWARDS */}
        {tab === "rewards" && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>🎁 可兑换奖品列表</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {REWARDS.map(r => (
                <div key={r.id} style={{ background: "#161B27", border: "1px solid #1E293B", borderRadius: 14, padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>{r.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{r.name}</div>
                  <div style={{ color: "#6366F1", fontWeight: 900, fontSize: 20, marginBottom: 4 }}>{r.points} <span style={{ fontSize: 12, fontWeight: 400, color: "#6B7280" }}>积分</span></div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>库存: {r.stock} 件</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add Customer */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)} title="➕ 新增客户">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, color: "#9CA3AF", display: "block", marginBottom: 6 }}>客户姓名</label>
              <input value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                placeholder="请输入姓名" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: "#9CA3AF", display: "block", marginBottom: 6 }}>手机号码</label>
              <input value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                placeholder="请输入手机号" style={inputStyle} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={() => setShowAddModal(false)} style={btnSecondary}>取消</button>
              <button onClick={addCustomer} style={btnPrimary}>确认添加</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Award Prize */}
      {showPrizeModal && prizeTarget && (
        <Modal onClose={() => { setShowPrizeModal(false); setSelectedPrize(null); }} title={`🎯 为 ${prizeTarget.name} 记录中奖`}>
          <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 14 }}>当前积分: <span style={{ color: "#6366F1", fontWeight: 700 }}>{prizeTarget.points}</span></div>
          <div style={{ display: "grid", gap: 10 }}>
            {PRIZE_TIERS.map(p => (
              <div key={p.label} onClick={() => setSelectedPrize(p)} style={{
                background: selectedPrize?.label === p.label ? `${p.color}18` : "#0F1117",
                border: `1px solid ${selectedPrize?.label === p.label ? p.color : "#1E293B"}`,
                borderRadius: 10, padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all .15s"
              }}>
                <span style={{ fontSize: 22 }}>{p.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: p.color }}>{p.label}</div>
                </div>
                <div style={{ fontWeight: 700, color: "#6366F1" }}>+{p.points} 积分</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={() => { setShowPrizeModal(false); setSelectedPrize(null); }} style={btnSecondary}>取消</button>
            <button onClick={awardPrize} style={{ ...btnPrimary, opacity: selectedPrize ? 1 : 0.4, pointerEvents: selectedPrize ? "auto" : "none" }}>确认记录</button>
          </div>
        </Modal>
      )}

      {/* Modal: Redeem */}
      {showRedeemModal && redeemTarget && (
        <Modal onClose={() => { setShowRedeemModal(false); setSelectedReward(null); }} title={`🎁 ${redeemTarget.name} 兑换奖品`}>
          <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 14 }}>当前积分: <span style={{ color: "#6366F1", fontWeight: 700 }}>{redeemTarget.points}</span></div>
          <div style={{ display: "grid", gap: 10 }}>
            {REWARDS.map(r => {
              const canRedeem = redeemTarget.points >= r.points;
              return (
                <div key={r.id} onClick={() => canRedeem && setSelectedReward(r)} style={{
                  background: selectedReward?.id === r.id ? "#0A2818" : "#0F1117",
                  border: `1px solid ${selectedReward?.id === r.id ? "#10B981" : canRedeem ? "#1E293B" : "#111"}`,
                  borderRadius: 10, padding: "12px 16px", cursor: canRedeem ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", gap: 12, opacity: canRedeem ? 1 : 0.35, transition: "all .15s"
                }}>
                  <span style={{ fontSize: 22 }}>{r.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: "#6B7280" }}>库存 {r.stock}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: canRedeem ? "#10B981" : "#4B5563" }}>{r.points} 积分</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={() => { setShowRedeemModal(false); setSelectedReward(null); }} style={btnSecondary}>取消</button>
            <button onClick={redeemReward} style={{ ...btnPrimary, background: "linear-gradient(135deg, #059669, #10B981)", opacity: selectedReward ? 1 : 0.4, pointerEvents: selectedReward ? "auto" : "none" }}>确认兑换</button>
          </div>
        </Modal>
      )}

      {/* Modal: Detail */}
      {showDetailModal && detailTarget && (
        <Modal onClose={() => setShowDetailModal(false)} title={`📋 ${detailTarget.name} 的积分记录`}>
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {detailTarget.history.length === 0 && <div style={{ color: "#6B7280", textAlign: "center", padding: 20 }}>暂无记录</div>}
            {detailTarget.history.map((h, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: "1px solid #1E293B" }}>
                <div style={{ fontSize: 20 }}>{h.pts > 0 ? "🎯" : "🎁"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{h.prize}</div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>{h.date}</div>
                </div>
                <div style={{ fontWeight: 700, color: h.pts > 0 ? "#34D399" : "#F87171", fontSize: 16 }}>
                  {h.pts > 0 ? "+" : ""}{h.pts}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9000, padding: 20 }}>
      <div style={{ background: "#161B27", border: "1px solid #1E293B", borderRadius: 16, padding: 24, width: "100%", maxWidth: 480, boxShadow: "0 24px 80px rgba(0,0,0,.6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#6B7280", fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", background: "#0F1117", border: "1px solid #1E293B",
  borderRadius: 8, padding: "10px 14px", color: "#E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box"
};
const btnPrimary = {
  flex: 1, background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#fff",
  border: "none", borderRadius: 8, padding: "10px", cursor: "pointer", fontWeight: 600, fontSize: 14
};
const btnSecondary = {
  flex: 1, background: "#1E293B", color: "#9CA3AF",
  border: "none", borderRadius: 8, padding: "10px", cursor: "pointer", fontWeight: 600, fontSize: 14
};
