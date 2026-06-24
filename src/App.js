import { useState, useRef, useEffect } from "react";

const COLORS = {
  bg: "#F7F5F0", surface: "#FFFFFF", primary: "#2D6A4F",
  primaryLight: "#52B788", accent: "#F4A261", text: "#1A1A2E",
  muted: "#6B7280", border: "#E5E7EB", danger: "#E63946", success: "#52B788",
};

const MEAL_TIMES = [
  { id: "desayuno", label: "Desayuno", emoji: "🌅", color: "#F59E0B" },
  { id: "almuerzo", label: "Almuerzo", emoji: "☀️", color: "#2D6A4F" },
  { id: "cena", label: "Cena", emoji: "🌙", color: "#6366F1" },
  { id: "snack", label: "Snack", emoji: "🍎", color: "#EC4899" },
];

const HIGH_PROTEIN_FOODS = [
  { name: "Pechuga de pollo", emoji: "🍗", protein: 31, cal: 165, per: "100g" },
  { name: "Atún en agua", emoji: "🐟", protein: 30, cal: 132, per: "100g" },
  { name: "Huevo entero", emoji: "🥚", protein: 6, cal: 78, per: "1 pieza" },
  { name: "Claras de huevo", emoji: "🍳", protein: 11, cal: 52, per: "3 claras" },
  { name: "Yogur griego", emoji: "🥛", protein: 17, cal: 100, per: "1 taza" },
  { name: "Frijoles negros", emoji: "🫘", protein: 15, cal: 227, per: "1 taza cocida" },
  { name: "Salmón", emoji: "🐠", protein: 25, cal: 208, per: "100g" },
  { name: "Queso cottage", emoji: "🧀", protein: 14, cal: 110, per: "½ taza" },
  { name: "Pavo molido", emoji: "🦃", protein: 29, cal: 189, per: "100g" },
  { name: "Edamame", emoji: "🌱", protein: 17, cal: 188, per: "1 taza" },
  { name: "Lentejas", emoji: "🍲", protein: 18, cal: 230, per: "1 taza cocida" },
  { name: "Camarón", emoji: "🦐", protein: 24, cal: 99, per: "100g" },
];

const CALORIE_COLORS = [
  { max: 200, color: "#52B788", label: "Ligero" },
  { max: 500, color: "#F4A261", label: "Moderado" },
  { max: 900, color: "#E09F3E", label: "Alto" },
  { max: Infinity, color: "#E63946", label: "Muy alto" },
];

function getCalorieLevel(cal) {
  return CALORIE_COLORS.find((c) => cal <= c.max) || CALORIE_COLORS[3];
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getToday() {
  return new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export default function ContadorCalorias() {
  const [dishes, setDishes] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMeal, setSelectedMeal] = useState("desayuno");
  const [activeTab, setActiveTab] = useState("registro");
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [historyDay, setHistoryDay] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [dailyGoal] = useState(2400);
  const [proteinGoal] = useState(133);
  const inputRef = useRef(null);

  // Load today's dishes from localStorage on mount
  useEffect(() => {
    const key = getTodayKey();
    const saved = localStorage.getItem("calorias_" + key);
    if (saved) {
      try { setDishes(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  // Save to localStorage whenever dishes change
  useEffect(() => {
    const key = getTodayKey();
    localStorage.setItem("calorias_" + key, JSON.stringify(dishes));
  }, [dishes]);

  const totalCalories = dishes.reduce((sum, d) => sum + (d.calories || 0), 0);
  const totalProtein = dishes.reduce((sum, d) => sum + (d.protein || 0), 0);
  const totalCarbs = dishes.reduce((sum, d) => sum + (d.carbs || 0), 0);
  const totalFat = dishes.reduce((sum, d) => sum + (d.fat || 0), 0);
  const proteinPct = Math.min((totalProtein / proteinGoal) * 100, 100);
  const proteinColor = totalProtein < proteinGoal * 0.5 ? "#EF4444" : totalProtein < proteinGoal ? "#F59E0B" : "#3B82F6";
  const progressPct = Math.min((totalCalories / dailyGoal) * 100, 100);
  const progressColor = totalCalories < dailyGoal * 0.6 ? COLORS.success : totalCalories < dailyGoal ? COLORS.accent : COLORS.danger;

  const dishesByMeal = MEAL_TIMES.reduce((acc, mt) => {
    acc[mt.id] = dishes.filter((d) => d.meal === mt.id);
    return acc;
  }, {});

  // Get all past days from localStorage
  function getHistory() {
    const today = getTodayKey();
    const days = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("calorias_")) {
        const dateKey = k.replace("calorias_", "");
        if (dateKey !== today) {
          try {
            const data = JSON.parse(localStorage.getItem(k));
            if (data && data.length > 0) {
              const cal = data.reduce((s, d) => s + (d.calories || 0), 0);
              const prot = data.reduce((s, d) => s + (d.protein || 0), 0);
              days.push({ dateKey, cal, prot, count: data.length, data });
            }
          } catch (e) {}
        }
      }
    }
    return days.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }

  function buildSummaryText(ds = dishes) {
    const cal = ds.reduce((s, d) => s + d.calories, 0);
    const prot = ds.reduce((s, d) => s + d.protein, 0);
    const carbs = ds.reduce((s, d) => s + d.carbs, 0);
    const fat = ds.reduce((s, d) => s + d.fat, 0);
    const byMeal = MEAL_TIMES.reduce((acc, mt) => { acc[mt.id] = ds.filter(d => d.meal === mt.id); return acc; }, {});
    const lines = [];
    lines.push("📊 RESUMEN NUTRICIONAL DEL DÍA");
    lines.push(`📅 ${getToday()}`);
    lines.push("─".repeat(36));
    lines.push(`🔥 Calorías:  ${cal} / ${dailyGoal} kcal`);
    lines.push(`💪 Proteína:  ${prot} / ${proteinGoal} g`);
    lines.push(`🍞 Carbos:    ${carbs} g`);
    lines.push(`🫒 Grasa:     ${fat} g`);
    lines.push("─".repeat(36));
    MEAL_TIMES.forEach((mt) => {
      const mds = byMeal[mt.id];
      if (!mds || mds.length === 0) return;
      const mCal = mds.reduce((s, d) => s + d.calories, 0);
      const mProt = mds.reduce((s, d) => s + d.protein, 0);
      lines.push(`\n${mt.emoji} ${mt.label.toUpperCase()}  (${mCal} kcal · ${mProt}g prot)`);
      mds.forEach((d) => lines.push(`  • ${d.name} — ${d.calories} kcal, ${d.protein}g prot`));
    });
    lines.push("\n" + "─".repeat(36));
    lines.push(cal <= dailyGoal ? `✅ Dentro de tu meta (faltan ${dailyGoal - cal} kcal)` : `⚠️ Superaste la meta por ${cal - dailyGoal} kcal`);
    lines.push(prot >= proteinGoal ? "✅ ¡Meta de proteína alcanzada! 🎉" : `⚠️ Faltan ${proteinGoal - prot}g de proteína`);
    return lines.join("\n");
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(buildSummaryText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  async function analyzeDish() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: `Eres un nutricionista experto. Responde SOLO con JSON válido sin markdown:
{"name":"nombre","calories":número,"protein":número,"carbs":número,"fat":número,"portion":"porción asumida","tip":"consejo breve en español"}
Si no reconoces el alimento: {"error":"No reconozco este platillo"}`,
          messages: [{ role: "user", content: trimmed }],
        }),
      });
      const data = await response.json();
      const raw = data.content.filter(b => b.type === "text").map(b => b.text).join("");
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      if (parsed.error) { setError(parsed.error); }
      else {
        setDishes(prev => [...prev, { ...parsed, id: Date.now(), meal: selectedMeal }]);
        setInput("");
        inputRef.current?.focus();
      }
    } catch (e) { setError("Error al analizar. Intenta de nuevo."); }
    finally { setLoading(false); }
  }

  function removeDish(id) { setDishes(prev => prev.filter(d => d.id !== id)); }

  const history = getHistory();

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "'Segoe UI', system-ui, sans-serif", color: COLORS.text }}>

      {/* Header */}
      <div style={{ background: COLORS.primary, padding: "22px 20px 14px", color: "#fff" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 24 }}>🥗</span>
              <h1 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>Contador de Calorías</h1>
            </div>
            <p style={{ margin: 0, opacity: 0.75, fontSize: 12 }}>Meta: 2,400 kcal · 133g proteína / día</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {history.length > 0 && (
              <button onClick={() => setShowHistory(!showHistory)} style={{
                background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.4)",
                borderRadius: 10, padding: "7px 11px", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>📅 Historial</button>
            )}
            {dishes.length > 0 && (
              <button onClick={() => setShowExport(!showExport)} style={{
                background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.4)",
                borderRadius: 10, padding: "7px 11px", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>📤 Exportar</button>
            )}
          </div>
        </div>
      </div>

      {/* History panel */}
      {showHistory && (
        <div style={{ background: "#1A1A2E", color: "#E5E7EB", padding: "14px 16px", borderBottom: "3px solid #6366F1" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>📅 Días anteriores</span>
              <button onClick={() => setShowHistory(false)} style={{ background: "none", border: "none", color: "#6B7280", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {history.map((h) => (
                <div key={h.dateKey}
                  onClick={() => { setHistoryDay(h); setShowHistory(false); }}
                  style={{ background: "#0F0F1A", borderRadius: 10, padding: "11px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#D1FAE5" }}>{h.dateKey}</div>
                    <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{h.count} platillos · {h.prot}g proteína</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: h.cal <= dailyGoal ? "#52B788" : "#E63946" }}>{h.cal}</div>
                    <div style={{ fontSize: 10, color: "#6B7280" }}>kcal</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History day detail */}
      {historyDay && (
        <div style={{ background: "#F0FDF4", borderBottom: "2px solid #52B788", padding: "14px 16px" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.primary }}>📋 {historyDay.dateKey}</span>
              <button onClick={() => setHistoryDay(null)} style={{ background: "none", border: "none", color: COLORS.muted, fontSize: 16, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              {[
                { label: "Calorías", val: historyDay.cal, unit: "kcal", color: historyDay.cal <= dailyGoal ? COLORS.success : COLORS.danger },
                { label: "Proteína", val: historyDay.prot, unit: "g", color: "#3B82F6" },
              ].map(m => (
                <div key={m.label} style={{ flex: 1, background: "#fff", borderRadius: 10, padding: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: m.color }}>{m.val}<span style={{ fontSize: 11, fontWeight: 400 }}> {m.unit}</span></div>
                  <div style={{ fontSize: 11, color: COLORS.muted }}>{m.label}</div>
                </div>
              ))}
            </div>
            {historyDay.data.map(d => (
              <div key={d.id} style={{ background: "#fff", borderRadius: 9, padding: "8px 12px", marginBottom: 6, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span>{MEAL_TIMES.find(m => m.id === d.meal)?.emoji} {d.name}</span>
                <span style={{ color: COLORS.muted }}>{d.calories} kcal · <span style={{ color: "#3B82F6" }}>{d.protein}g prot</span></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export panel */}
      {showExport && dishes.length > 0 && (
        <div style={{ background: "#1A1A2E", color: "#E5E7EB", padding: "14px 16px", borderBottom: "3px solid #2D6A4F" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>📋 Resumen del día</span>
              <button onClick={() => setShowExport(false)} style={{ background: "none", border: "none", color: "#6B7280", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>
            <pre style={{ background: "#0F0F1A", borderRadius: 10, padding: "12px", fontSize: 11, lineHeight: 1.6, overflowX: "auto", whiteSpace: "pre-wrap", color: "#D1FAE5", margin: "0 0 10px", fontFamily: "monospace" }}>
              {buildSummaryText()}
            </pre>
            <button onClick={copyToClipboard} style={{
              width: "100%", background: copied ? "#52B788" : "#2D6A4F", color: "#fff",
              border: "none", borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>
              {copied ? "✅ ¡Copiado!" : "📋 Copiar al portapapeles"}
            </button>
            <p style={{ margin: "8px 0 0", fontSize: 11, color: "#6B7280", textAlign: "center" }}>Pega este resumen en WhatsApp o Notas para guardarlo</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: 600, margin: "0 auto", display: "flex" }}>
          {[{ id: "registro", label: "📋 Registro" }, { id: "proteinas", label: "💪 Guía proteína" }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: "13px 0", border: "none", background: "none", fontSize: 13, fontWeight: 600,
              color: activeTab === tab.id ? COLORS.primary : COLORS.muted, cursor: "pointer",
              borderBottom: activeTab === tab.id ? `2px solid ${COLORS.primary}` : "2px solid transparent",
            }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px" }}>

        {activeTab === "registro" && (
          <>
            {/* Summary */}
            {dishes.length > 0 && (
              <div style={{ background: COLORS.surface, borderRadius: 16, padding: "16px 18px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>🔥 Calorías del día</span>
                  <span style={{ fontWeight: 700, fontSize: 20, color: progressColor }}>{totalCalories.toLocaleString()}<span style={{ fontSize: 12, fontWeight: 400, color: COLORS.muted, marginLeft: 4 }}>/ {dailyGoal} kcal</span></span>
                </div>
                <div style={{ height: 9, background: COLORS.border, borderRadius: 6, overflow: "hidden", marginBottom: 5 }}>
                  <div style={{ height: "100%", width: `${progressPct}%`, background: progressColor, borderRadius: 6, transition: "width 0.4s ease" }} />
                </div>
                <div style={{ fontSize: 12, color: COLORS.muted, textAlign: "right", marginBottom: 14 }}>
                  {totalCalories < dailyGoal ? `Faltan ${(dailyGoal - totalCalories).toLocaleString()} kcal` : `Superaste la meta por ${(totalCalories - dailyGoal).toLocaleString()} kcal`}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>💪 Proteína</span>
                  <span style={{ fontWeight: 700, fontSize: 20, color: proteinColor }}>{totalProtein}g<span style={{ fontSize: 12, fontWeight: 400, color: COLORS.muted, marginLeft: 4 }}>/ {proteinGoal}g</span></span>
                </div>
                <div style={{ height: 9, background: COLORS.border, borderRadius: 6, overflow: "hidden", marginBottom: 5 }}>
                  <div style={{ height: "100%", width: `${proteinPct}%`, background: proteinColor, borderRadius: 6, transition: "width 0.4s ease" }} />
                </div>
                <div style={{ fontSize: 12, color: COLORS.muted, textAlign: "right", marginBottom: 14 }}>
                  {totalProtein < proteinGoal ? `Faltan ${proteinGoal - totalProtein}g para tu meta muscular` : "¡Meta de proteína alcanzada! 🎉"}
                </div>
                <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
                  {[{ label: "Carbos", val: totalCarbs, color: "#F59E0B" }, { label: "Grasa", val: totalFat, color: "#EF4444" }, { label: "Platillos", val: dishes.length, color: COLORS.primary }].map(m => (
                    <div key={m.label} style={{ flex: 1, textAlign: "center", background: COLORS.bg, borderRadius: 10, padding: "8px 4px" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: m.color }}>{m.val}{m.label !== "Platillos" ? "g" : ""}</div>
                      <div style={{ fontSize: 10, color: COLORS.muted }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meal selector */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto", paddingBottom: 2 }}>
              {MEAL_TIMES.map((mt) => {
                const count = dishesByMeal[mt.id].length;
                const active = selectedMeal === mt.id;
                return (
                  <button key={mt.id} onClick={() => setSelectedMeal(mt.id)} style={{
                    flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "9px 13px", borderRadius: 12, border: `2px solid ${active ? mt.color : COLORS.border}`,
                    background: active ? mt.color + "18" : COLORS.surface, cursor: "pointer", gap: 2,
                  }}>
                    <span style={{ fontSize: 17 }}>{mt.emoji}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: active ? mt.color : COLORS.muted }}>{mt.label}</span>
                    {count > 0 && <span style={{ fontSize: 10, background: mt.color, color: "#fff", borderRadius: 10, padding: "1px 6px", fontWeight: 700 }}>{count}</span>}
                  </button>
                );
              })}
            </div>

            {/* Input */}
            <div style={{ background: COLORS.surface, borderRadius: 14, padding: "13px 15px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              {(() => { const mt = MEAL_TIMES.find(m => m.id === selectedMeal); return (
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mt.color, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {mt.emoji} Agregar a {mt.label}
                </label>
              ); })()}
              <div style={{ display: "flex", gap: 8 }}>
                <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !loading && analyzeDish()}
                  placeholder="Ej: 2 tacos de pollo con guacamole..."
                  style={{ flex: 1, border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 13px", fontSize: 14, outline: "none", color: COLORS.text, background: COLORS.bg }}
                  onFocus={e => (e.target.style.borderColor = COLORS.primaryLight)}
                  onBlur={e => (e.target.style.borderColor = COLORS.border)}
                />
                <button onClick={analyzeDish} disabled={loading || !input.trim()} style={{
                  background: loading || !input.trim() ? COLORS.border : COLORS.primary,
                  color: loading || !input.trim() ? COLORS.muted : "#fff",
                  border: "none", borderRadius: 10, padding: "10px 15px", fontSize: 14, fontWeight: 600,
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer", whiteSpace: "nowrap",
                }}>{loading ? "⏳" : "Analizar"}</button>
              </div>
              {error && <p style={{ margin: "8px 0 0", fontSize: 13, color: COLORS.danger }}>⚠️ {error}</p>}
            </div>

            {/* Dishes grouped by meal */}
            {MEAL_TIMES.map((mt) => {
              const mealDishes = dishesByMeal[mt.id];
              if (mealDishes.length === 0) return null;
              const mealCal = mealDishes.reduce((s, d) => s + d.calories, 0);
              const mealProt = mealDishes.reduce((s, d) => s + d.protein, 0);
              return (
                <div key={mt.id} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 15 }}>{mt.emoji}</span>
                      <span style={{ fontWeight: 700, fontSize: 14, color: mt.color }}>{mt.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.muted }}>
                      <span style={{ fontWeight: 600, color: mt.color }}>{mealCal} kcal</span> · <span>{mealProt}g prot</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {mealDishes.map((dish) => {
                      const level = getCalorieLevel(dish.calories);
                      return (
                        <div key={dish.id} style={{ background: COLORS.surface, borderRadius: 13, padding: "12px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderLeft: `4px solid ${level.color}`, animation: "fadeIn 0.3s ease" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{dish.name}</div>
                              <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 7 }}>Porción: {dish.portion}</div>
                              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                                {[{ label: "Prot", val: dish.protein, color: "#3B82F6" }, { label: "Carbos", val: dish.carbs, color: "#F59E0B" }, { label: "Grasa", val: dish.fat, color: "#EF4444" }].map(m => (
                                  <span key={m.label} style={{ fontSize: 11, background: COLORS.bg, borderRadius: 6, padding: "3px 8px", color: COLORS.muted }}>
                                    <span style={{ color: m.color, fontWeight: 700 }}>{m.val}g</span> {m.label}
                                  </span>
                                ))}
                              </div>
                              {dish.tip && <p style={{ margin: "7px 0 0", fontSize: 11, color: COLORS.muted, fontStyle: "italic" }}>💡 {dish.tip}</p>}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 19, fontWeight: 800, color: level.color, lineHeight: 1 }}>{dish.calories}</div>
                                <div style={{ fontSize: 10, color: COLORS.muted }}>kcal</div>
                              </div>
                              <button onClick={() => removeDish(dish.id)} style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "3px 8px", fontSize: 11, color: COLORS.muted, cursor: "pointer" }}>✕</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {dishes.length === 0 && (
              <div style={{ textAlign: "center", padding: "36px 20px", color: COLORS.muted }}>
                <div style={{ fontSize: 44, marginBottom: 10 }}>🍽️</div>
                <p style={{ margin: 0, fontSize: 14 }}>Selecciona una comida y empieza a registrar</p>
              </div>
            )}

            {dishes.length > 0 && (
              <button onClick={() => setDishes([])} style={{ display: "block", margin: "16px auto 0", background: "none", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: "9px 22px", fontSize: 13, color: COLORS.muted, cursor: "pointer" }}>
                Limpiar día actual
              </button>
            )}
          </>
        )}

        {activeTab === "proteinas" && (
          <>
            <div style={{ marginBottom: 14 }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>Alimentos altos en proteína</h2>
              <p style={{ margin: 0, fontSize: 13, color: COLORS.muted }}>Tu meta: <strong style={{ color: "#3B82F6" }}>{proteinGoal}g/día</strong> · Toca un alimento para añadirlo</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {HIGH_PROTEIN_FOODS.map((food) => {
                const pct = Math.round((food.protein / proteinGoal) * 100);
                return (
                  <div key={food.name}
                    onClick={() => { setInput(food.name); setActiveTab("registro"); setTimeout(() => inputRef.current?.focus(), 100); }}
                    style={{ background: COLORS.surface, borderRadius: 13, padding: "12px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", cursor: "pointer", display: "flex", alignItems: "center", gap: 11, transition: "transform 0.1s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
                  >
                    <span style={{ fontSize: 28 }}>{food.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 1 }}>{food.name}</div>
                      <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 5 }}>{food.per} · {food.cal} kcal</div>
                      <div style={{ height: 5, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: "#3B82F6", borderRadius: 4 }} />
                      </div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 50 }}>
                      <div style={{ fontSize: 19, fontWeight: 800, color: "#3B82F6", lineHeight: 1 }}>{food.protein}g</div>
                      <div style={{ fontSize: 10, color: COLORS.muted }}>proteína</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#3B82F6", marginTop: 2 }}>{pct}% meta</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ margin: "16px 0 4px", padding: "13px 15px", background: "#EFF6FF", borderRadius: 13, borderLeft: "4px solid #3B82F6" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1D4ED8", marginBottom: 4 }}>💡 Consejo para tu objetivo</div>
              <div style={{ fontSize: 12, color: "#1E40AF", lineHeight: 1.5 }}>Distribuye tu proteína en 4 comidas (~33g cada una). Consumir proteína dentro de los 30 min post-entrenamiento ayuda a la recuperación muscular.</div>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
