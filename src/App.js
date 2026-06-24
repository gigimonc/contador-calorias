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

function getTodayKey() { return new Date().toISOString().slice(0, 10); }

function getToday() {
  return new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function formatDateShort(key) {
  const [, , day] = key.split("-");
  const d = new Date(key + "T12:00:00");
  return d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric" });
}

// ── Mini bar chart component ──
function WeeklyChart({ data, dailyGoal }) {
  const maxVal = Math.max(...data.map(d => Math.max(d.net, d.burned, 10)), dailyGoal);
  const barW = 32;
  const chartH = 140;
  const pad = 10;

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={data.length * (barW + 12) + pad * 2} height={chartH + 50} style={{ display: "block" }}>
        {/* Goal line */}
        <line
          x1={pad} x2={data.length * (barW + 12) + pad}
          y1={pad + chartH - (dailyGoal / maxVal) * chartH}
          y2={pad + chartH - (dailyGoal / maxVal) * chartH}
          stroke="#E63946" strokeDasharray="4,3" strokeWidth={1.5}
        />
        <text x={pad + 2} y={pad + chartH - (dailyGoal / maxVal) * chartH - 4} fontSize={9} fill="#E63946">meta</text>

        {data.map((d, i) => {
          const x = pad + i * (barW + 12);
          const netH = Math.max((d.net / maxVal) * chartH, 2);
          const burnH = Math.max((d.burned / maxVal) * chartH, d.burned > 0 ? 2 : 0);
          const netColor = d.net === 0 ? COLORS.border : d.net <= dailyGoal ? COLORS.success : COLORS.danger;
          const isToday = d.key === getTodayKey();

          return (
            <g key={d.key}>
              {/* Eaten bar */}
              <rect x={x} y={pad + chartH - netH} width={barW} height={netH}
                fill={netColor} rx={4} opacity={isToday ? 1 : 0.75} />
              {/* Burned overlay */}
              {burnH > 0 && (
                <rect x={x} y={pad + chartH - netH - burnH} width={barW} height={burnH}
                  fill="#F59E0B" rx={4} opacity={0.85} />
              )}
              {/* Today indicator */}
              {isToday && <rect x={x} y={pad + chartH + 4} width={barW} height={3} fill={COLORS.primary} rx={2} />}
              {/* Label */}
              <text x={x + barW / 2} y={pad + chartH + 18} textAnchor="middle" fontSize={9} fill={COLORS.muted}>
                {formatDateShort(d.key)}
              </text>
              {/* Cal value */}
              {d.net > 0 && (
                <text x={x + barW / 2} y={pad + chartH - netH - burnH - 4} textAnchor="middle" fontSize={8} fill={COLORS.text}>
                  {d.net}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 11, color: COLORS.muted }}>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: COLORS.success, borderRadius: 2, marginRight: 4 }} />Calorías ingeridas</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#F59E0B", borderRadius: 2, marginRight: 4 }} />Calorías quemadas</span>
      </div>
    </div>
  );
}

export default function ContadorCalorias() {
  const [dishes, setDishes] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMeal, setSelectedMeal] = useState("desayuno");
  const [activeTab, setActiveTab] = useState("registro");
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [historyDay, setHistoryDay] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  // Exercise modal
  const [showExercise, setShowExercise] = useState(false);
  const [exMode, setExMode] = useState("manual"); // "manual" | "calcular"
  const [exManualCal, setExManualCal] = useState("");
  const [exType, setExType] = useState("funcional");
  const [exDuration, setExDuration] = useState("");
  const [exNote, setExNote] = useState("");
  // Reminder
  const [reminder, setReminder] = useState(null);
  const [dailyGoal] = useState(2400);
  const [proteinGoal] = useState(133);
  // Calculator state
  const [calcMode, setCalcMode] = useState("ia"); // "ia" | "lista"
  const [calcFood, setCalcFood] = useState("");
  const [calcAmount, setCalcAmount] = useState("");
  const [calcUnit, setCalcUnit] = useState("g");
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState("");
  const [calcSearch, setCalcSearch] = useState("");
  const [calcSelected, setCalcSelected] = useState(null);
  const inputRef = useRef(null);

  // Load today from localStorage
  useEffect(() => {
    const key = getTodayKey();
    try {
      const saved = localStorage.getItem("calorias_" + key);
      if (saved) setDishes(JSON.parse(saved));
      const savedW = localStorage.getItem("workouts_" + key);
      if (savedW) setWorkouts(JSON.parse(savedW));
    } catch (e) {}
  }, []);

  // Save dishes
  useEffect(() => {
    localStorage.setItem("calorias_" + getTodayKey(), JSON.stringify(dishes));
    if (dishes.length > 0) localStorage.setItem("lastEntry_" + getTodayKey(), Date.now().toString());
  }, [dishes]);

  // Save workouts
  useEffect(() => {
    localStorage.setItem("workouts_" + getTodayKey(), JSON.stringify(workouts));
  }, [workouts]);

  // Reminder: check every 5 min if last entry was >2.5h ago during typical eating hours
  useEffect(() => {
    function checkReminder() {
      const now = new Date();
      const hour = now.getHours();
      if (hour < 7 || hour > 21) { setReminder(null); return; }
      const lastEntry = parseInt(localStorage.getItem("lastEntry_" + getTodayKey()) || "0");
      const diffMin = lastEntry > 0 ? (Date.now() - lastEntry) / 60000 : null;
      if (diffMin !== null && diffMin > 150) {
        setReminder(`Llevas más de ${Math.floor(diffMin / 60)}h sin registrar. ¿Ya comiste algo?`);
      } else if (diffMin === null && dishes.length === 0 && hour >= 9) {
        setReminder("¡Hola! No has registrado nada hoy. ¿Empezamos?");
      } else {
        setReminder(null);
      }
    }
    checkReminder();
    const interval = setInterval(checkReminder, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dishes]);

  const totalCaloriesIn = dishes.reduce((sum, d) => sum + (d.calories || 0), 0);
  const totalBurned = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const netCalories = totalCaloriesIn - totalBurned;
  const adjustedGoal = dailyGoal + totalBurned; // eat more if you burned more
  const totalProtein = dishes.reduce((sum, d) => sum + (d.protein || 0), 0);
  const totalCarbs = dishes.reduce((sum, d) => sum + (d.carbs || 0), 0);
  const totalFat = dishes.reduce((sum, d) => sum + (d.fat || 0), 0);
  const proteinPct = Math.min((totalProtein / proteinGoal) * 100, 100);
  const proteinColor = totalProtein < proteinGoal * 0.5 ? "#EF4444" : totalProtein < proteinGoal ? "#F59E0B" : "#3B82F6";
  const progressPct = Math.min((netCalories / adjustedGoal) * 100, 100);
  const progressColor = netCalories < adjustedGoal * 0.6 ? COLORS.success : netCalories < adjustedGoal ? COLORS.accent : COLORS.danger;
  const dishesByMeal = MEAL_TIMES.reduce((acc, mt) => { acc[mt.id] = dishes.filter(d => d.meal === mt.id); return acc; }, {});

  // Weekly chart data
  const weeklyData = getLast7Days().map(key => {
    try {
      const d = JSON.parse(localStorage.getItem("calorias_" + key) || "[]");
      const w = JSON.parse(localStorage.getItem("workouts_" + key) || "[]");
      const cal = d.reduce((s, x) => s + (x.calories || 0), 0);
      const burned = w.reduce((s, x) => s + (x.calories || 0), 0);
      return { key, net: cal, burned, protein: d.reduce((s, x) => s + (x.protein || 0), 0) };
    } catch { return { key, net: 0, burned: 0, protein: 0 }; }
  });

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
              const w = JSON.parse(localStorage.getItem("workouts_" + dateKey) || "[]");
              days.push({
                dateKey, data,
                cal: data.reduce((s, d) => s + (d.calories || 0), 0),
                prot: data.reduce((s, d) => s + (d.protein || 0), 0),
                burned: w.reduce((s, x) => s + (x.calories || 0), 0),
                count: data.length,
              });
            }
          } catch (e) {}
        }
      }
    }
    return days.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }

  function addWorkout() {
    let cal = 0;
    if (exMode === "manual") {
      cal = parseInt(exManualCal);
      if (!cal || cal <= 0) return;
    } else {
      const type = EXERCISE_TYPES.find(e => e.id === exType);
      const mins = parseInt(exDuration);
      if (!mins || mins <= 0) return;
      cal = Math.round(type.cal_per_min * mins);
    }
    const type = EXERCISE_TYPES.find(e => e.id === exType);
    setWorkouts(prev => [...prev, {
      id: Date.now(), calories: cal,
      note: exNote || (exMode === "calcular" ? `${type.label} ${exDuration} min` : "Ejercicio"),
      emoji: type.emoji, duration: exMode === "calcular" ? parseInt(exDuration) : null,
    }]);
    setExManualCal(""); setExDuration(""); setExNote(""); setShowExercise(false);
  }

  function buildSummaryText() {
    const lines = [];
    lines.push("📊 RESUMEN NUTRICIONAL DEL DÍA");
    lines.push(`📅 ${getToday()}`);
    lines.push("─".repeat(36));
    lines.push(`🔥 Calorías ingeridas: ${totalCaloriesIn} kcal`);
    if (totalBurned > 0) {
      lines.push(`⚡ Calorías quemadas:  −${totalBurned} kcal`);
      lines.push(`📊 Calorías netas:     ${netCalories} / ${adjustedGoal} kcal`);
    } else {
      lines.push(`📊 Total:              ${totalCaloriesIn} / ${dailyGoal} kcal`);
    }
    lines.push(`💪 Proteína:  ${totalProtein} / ${proteinGoal} g`);
    lines.push(`🍞 Carbos:    ${totalCarbs} g`);
    lines.push(`🫒 Grasa:     ${totalFat} g`);
    lines.push("─".repeat(36));
    MEAL_TIMES.forEach(mt => {
      const mds = dishesByMeal[mt.id];
      if (!mds || mds.length === 0) return;
      const mCal = mds.reduce((s, d) => s + d.calories, 0);
      const mProt = mds.reduce((s, d) => s + d.protein, 0);
      lines.push(`\n${mt.emoji} ${mt.label.toUpperCase()}  (${mCal} kcal · ${mProt}g prot)`);
      mds.forEach(d => lines.push(`  • ${d.name} — ${d.calories} kcal, ${d.protein}g prot`));
    });
    if (workouts.length > 0) {
      lines.push(`\n⚡ EJERCICIO (−${totalBurned} kcal)`);
      workouts.forEach(w => lines.push(`  • ${w.emoji} ${w.note} — −${w.calories} kcal`));
    }
    lines.push("\n" + "─".repeat(36));
    lines.push(netCalories <= adjustedGoal ? `✅ Dentro de tu meta (faltan ${adjustedGoal - netCalories} kcal)` : `⚠️ Superaste la meta por ${netCalories - adjustedGoal} kcal`);
    lines.push(totalProtein >= proteinGoal ? "✅ ¡Meta de proteína alcanzada! 🎉" : `⚠️ Faltan ${proteinGoal - totalProtein}g de proteína`);
    return lines.join("\n");
  }

  async function analyzeDish() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setLoading(true); setError("");
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 1000,
          system: `Eres un nutricionista experto. Responde SOLO con JSON válido sin markdown:
{"name":"nombre","calories":número,"protein":número,"carbs":número,"fat":número,"portion":"porción asumida","tip":"consejo breve en español"}
Si no reconoces el alimento: {"error":"No reconozco este platillo"}`,
          messages: [{ role: "user", content: trimmed }],
        }),
      });
      const data = await response.json();
      const raw = data.content.filter(b => b.type === "text").map(b => b.text).join("");
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      if (parsed.error) setError(parsed.error);
      else { setDishes(prev => [...prev, { ...parsed, id: Date.now(), meal: selectedMeal }]); setInput(""); inputRef.current?.focus(); }
    } catch (e) { setError("Error al analizar. Intenta de nuevo."); }
    finally { setLoading(false); }
  }

  const history = getHistory();

  // ── Common foods database (per 100g or 100ml) ──
  const COMMON_FOODS = [
    { name: "Arroz blanco cocido", emoji: "🍚", cal: 130, protein: 2.7, carbs: 28, fat: 0.3, unit: "g" },
    { name: "Arroz integral cocido", emoji: "🍚", cal: 111, protein: 2.6, carbs: 23, fat: 0.9, unit: "g" },
    { name: "Pechuga de pollo", emoji: "🍗", cal: 165, protein: 31, carbs: 0, fat: 3.6, unit: "g" },
    { name: "Carne molida (90%)", emoji: "🥩", cal: 176, protein: 20, carbs: 0, fat: 10, unit: "g" },
    { name: "Salmón", emoji: "🐟", cal: 208, protein: 20, carbs: 0, fat: 13, unit: "g" },
    { name: "Atún en agua", emoji: "🐟", cal: 116, protein: 26, carbs: 0, fat: 1, unit: "g" },
    { name: "Huevo entero", emoji: "🥚", cal: 155, protein: 13, carbs: 1.1, fat: 11, unit: "g" },
    { name: "Leche entera", emoji: "🥛", cal: 61, protein: 3.2, carbs: 4.8, fat: 3.3, unit: "ml" },
    { name: "Leche descremada", emoji: "🥛", cal: 34, protein: 3.4, carbs: 5, fat: 0.1, unit: "ml" },
    { name: "Yogur griego natural", emoji: "🫙", cal: 59, protein: 10, carbs: 3.6, fat: 0.4, unit: "g" },
    { name: "Queso panela", emoji: "🧀", cal: 291, protein: 19, carbs: 3, fat: 22, unit: "g" },
    { name: "Queso oaxaca", emoji: "🧀", cal: 356, protein: 22, carbs: 2, fat: 29, unit: "g" },
    { name: "Aguacate", emoji: "🥑", cal: 160, protein: 2, carbs: 9, fat: 15, unit: "g" },
    { name: "Plátano", emoji: "🍌", cal: 89, protein: 1.1, carbs: 23, fat: 0.3, unit: "g" },
    { name: "Manzana", emoji: "🍎", cal: 52, protein: 0.3, carbs: 14, fat: 0.2, unit: "g" },
    { name: "Naranja", emoji: "🍊", cal: 47, protein: 0.9, carbs: 12, fat: 0.1, unit: "g" },
    { name: "Papa cocida", emoji: "🥔", cal: 87, protein: 1.9, carbs: 20, fat: 0.1, unit: "g" },
    { name: "Camote cocido", emoji: "🍠", cal: 90, protein: 2, carbs: 21, fat: 0.1, unit: "g" },
    { name: "Frijoles negros cocidos", emoji: "🫘", cal: 132, protein: 8.9, carbs: 24, fat: 0.5, unit: "g" },
    { name: "Lentejas cocidas", emoji: "🍲", cal: 116, protein: 9, carbs: 20, fat: 0.4, unit: "g" },
    { name: "Avena cruda", emoji: "🌾", cal: 389, protein: 17, carbs: 66, fat: 7, unit: "g" },
    { name: "Pan integral", emoji: "🍞", cal: 247, protein: 13, carbs: 41, fat: 4, unit: "g" },
    { name: "Tortilla de maíz", emoji: "🫓", cal: 218, protein: 5.7, carbs: 46, fat: 2.5, unit: "g" },
    { name: "Aceite de oliva", emoji: "🫒", cal: 884, protein: 0, carbs: 0, fat: 100, unit: "ml" },
    { name: "Mantequilla", emoji: "🧈", cal: 717, protein: 0.9, carbs: 0.1, fat: 81, unit: "g" },
    { name: "Almendras", emoji: "🌰", cal: 579, protein: 21, carbs: 22, fat: 50, unit: "g" },
    { name: "Nueces", emoji: "🌰", cal: 654, protein: 15, carbs: 14, fat: 65, unit: "g" },
    { name: "Jugo de naranja", emoji: "🍹", cal: 45, protein: 0.7, carbs: 10, fat: 0.2, unit: "ml" },
    { name: "Refresco cola", emoji: "🥤", cal: 41, protein: 0, carbs: 11, fat: 0, unit: "ml" },
    { name: "Brócoli cocido", emoji: "🥦", cal: 35, protein: 2.4, carbs: 7, fat: 0.4, unit: "g" },
    { name: "Zanahoria", emoji: "🥕", cal: 41, protein: 0.9, carbs: 10, fat: 0.2, unit: "g" },
    { name: "Espinaca", emoji: "🥬", cal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, unit: "g" },
    { name: "Tomate", emoji: "🍅", cal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, unit: "g" },
  ];

  async function calcWithAI() {
    if (!calcFood.trim() || !calcAmount || parseFloat(calcAmount) <= 0) return;
    setCalcLoading(true); setCalcError(""); setCalcResult(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 500,
          system: `Eres un nutricionista experto. El usuario te dará un alimento y una cantidad. Calcula los macronutrientes exactos para ESA cantidad. Responde SOLO con JSON válido sin markdown:
{"name":"nombre del alimento","amount":número,"unit":"g o ml","calories":número entero,"protein":número con 1 decimal,"carbs":número con 1 decimal,"fat":número con 1 decimal,"per100":número entero}
Si no reconoces el alimento: {"error":"No reconozco este alimento"}`,
          messages: [{ role: "user", content: `Alimento: ${calcFood.trim()}, Cantidad: ${calcAmount} ${calcUnit}` }],
        }),
      });
      const data = await response.json();
      const raw = data.content.filter(b => b.type === "text").map(b => b.text).join("");
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      if (parsed.error) setCalcError(parsed.error);
      else setCalcResult(parsed);
    } catch (e) { setCalcError("Error al calcular. Intenta de nuevo."); }
    finally { setCalcLoading(false); }
  }

  function calcFromList(food, amount) {
    if (!amount || parseFloat(amount) <= 0) return;
    const factor = parseFloat(amount) / 100;
    setCalcResult({
      name: food.name, amount: parseFloat(amount), unit: food.unit,
      calories: Math.round(food.cal * factor),
      protein: parseFloat((food.protein * factor).toFixed(1)),
      carbs: parseFloat((food.carbs * factor).toFixed(1)),
      fat: parseFloat((food.fat * factor).toFixed(1)),
      per100: food.cal,
    });
  }

  function addCalcResultToLog() {
    if (!calcResult) return;
    setDishes(prev => [...prev, {
      id: Date.now(), meal: selectedMeal,
      name: `${calcResult.name} (${calcResult.amount}${calcResult.unit})`,
      calories: calcResult.calories, protein: calcResult.protein,
      carbs: calcResult.carbs, fat: calcResult.fat,
      portion: `${calcResult.amount}${calcResult.unit}`, tip: "",
    }]);
    setCalcResult(null); setCalcFood(""); setCalcAmount(""); setCalcSelected(null); setCalcSearch("");
    setActiveTab("registro");
  }

  const filteredFoods = COMMON_FOODS.filter(f =>
    calcSearch.trim() === "" || f.name.toLowerCase().includes(calcSearch.toLowerCase())
  );


  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "'Segoe UI', system-ui, sans-serif", color: COLORS.text }}>

      {/* Reminder banner */}
      {reminder && (
        <div style={{ background: "#FEF3C7", borderBottom: "2px solid #F59E0B", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#92400E" }}>⏰ {reminder}</span>
          <button onClick={() => setReminder(null)} style={{ background: "none", border: "none", color: "#92400E", fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Header */}
      <div style={{ background: COLORS.primary, padding: "20px 16px 14px", color: "#fff" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 22 }}>🥗</span>
                <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Contador de Calorías</h1>
              </div>
              <p style={{ margin: 0, opacity: 0.75, fontSize: 11 }}>Meta: {dailyGoal.toLocaleString()} kcal · 133g proteína / día</p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {history.length > 0 && (
                <button onClick={() => setShowHistory(!showHistory)} style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.35)", borderRadius: 9, padding: "6px 10px", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>📅</button>
              )}
              {dishes.length > 0 && (
                <button onClick={() => setShowExport(!showExport)} style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.35)", borderRadius: 9, padding: "6px 10px", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>📤</button>
              )}
            </div>
          </div>

          {/* Quick stats in header */}
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { label: "Ingeridas", val: totalCaloriesIn, unit: "kcal", color: "#D1FAE5" },
              { label: "Quemadas", val: totalBurned, unit: "kcal", color: "#FDE68A" },
              { label: "Netas", val: netCalories, unit: "kcal", color: "#fff" },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "8px 6px", textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 9, opacity: 0.8, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
            <button onClick={() => setShowExercise(true)} style={{ flex: 1, background: "#F59E0B", border: "none", borderRadius: 10, padding: "8px 6px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 16 }}>⚡</span>
              <span style={{ fontSize: 9 }}>Ejercicio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Exercise modal */}
      {showExercise && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: COLORS.surface, borderRadius: "20px 20px 0 0", padding: "24px 20px", width: "100%", maxWidth: 600, maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>⚡ Registrar ejercicio</h2>
              <button onClick={() => setShowExercise(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: COLORS.muted }}>✕</button>
            </div>

            {/* Mode toggle */}
            <div style={{ display: "flex", background: COLORS.bg, borderRadius: 10, padding: 3, marginBottom: 18 }}>
              {[{ id: "manual", label: "📱 Desde mi reloj" }, { id: "calcular", label: "🧮 Calcular" }].map(m => (
                <button key={m.id} onClick={() => setExMode(m.id)} style={{
                  flex: 1, padding: "9px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: exMode === m.id ? COLORS.surface : "none",
                  color: exMode === m.id ? COLORS.primary : COLORS.muted,
                  boxShadow: exMode === m.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none", cursor: "pointer",
                }}>{m.label}</button>
              ))}
            </div>

            {exMode === "manual" ? (
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.muted, marginBottom: 6, textTransform: "uppercase" }}>Calorías quemadas (de tu reloj)</label>
                <input type="number" value={exManualCal} onChange={e => setExManualCal(e.target.value)}
                  placeholder="Ej: 320"
                  style={{ width: "100%", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 14px", fontSize: 18, fontWeight: 700, outline: "none", boxSizing: "border-box", color: COLORS.text }} />
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.muted, margin: "14px 0 6px", textTransform: "uppercase" }}>Tipo de ejercicio</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {EXERCISE_TYPES.map(t => (
                    <button key={t.id} onClick={() => setExType(t.id)} style={{
                      padding: "7px 12px", borderRadius: 20, border: `1.5px solid ${exType === t.id ? "#F59E0B" : COLORS.border}`,
                      background: exType === t.id ? "#FEF3C7" : COLORS.surface, fontSize: 12, fontWeight: 600,
                      color: exType === t.id ? "#92400E" : COLORS.muted, cursor: "pointer",
                    }}>{t.emoji} {t.label}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.muted, marginBottom: 8, textTransform: "uppercase" }}>Tipo de ejercicio</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {EXERCISE_TYPES.map(t => (
                    <button key={t.id} onClick={() => setExType(t.id)} style={{
                      padding: "7px 12px", borderRadius: 20, border: `1.5px solid ${exType === t.id ? "#F59E0B" : COLORS.border}`,
                      background: exType === t.id ? "#FEF3C7" : COLORS.surface, fontSize: 12, fontWeight: 600,
                      color: exType === t.id ? "#92400E" : COLORS.muted, cursor: "pointer",
                    }}>{t.emoji} {t.label}</button>
                  ))}
                </div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.muted, marginBottom: 6, textTransform: "uppercase" }}>Duración (minutos)</label>
                <input type="number" value={exDuration} onChange={e => setExDuration(e.target.value)} placeholder="Ej: 45"
                  style={{ width: "100%", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 14px", fontSize: 18, fontWeight: 700, outline: "none", boxSizing: "border-box", color: COLORS.text }} />
                {exDuration > 0 && (
                  <div style={{ marginTop: 10, padding: "10px 14px", background: "#FEF3C7", borderRadius: 10, fontSize: 13, color: "#92400E", fontWeight: 600 }}>
                    Estimado: ~{Math.round((EXERCISE_TYPES.find(t => t.id === exType)?.cal_per_min || 6) * parseInt(exDuration))} kcal quemadas
                  </div>
                )}
              </div>
            )}

            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.muted, margin: "14px 0 6px", textTransform: "uppercase" }}>Nota (opcional)</label>
            <input value={exNote} onChange={e => setExNote(e.target.value)} placeholder="Ej: Clase de funcional, mañana..."
              style={{ width: "100%", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 13px", fontSize: 14, outline: "none", boxSizing: "border-box", color: COLORS.text }} />

            <button onClick={addWorkout} style={{
              width: "100%", marginTop: 18, background: "#F59E0B", border: "none", borderRadius: 12,
              padding: "14px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
            }}>Guardar ejercicio ⚡</button>
          </div>
        </div>
      )}

      {/* History panel */}
      {showHistory && (
        <div style={{ background: "#1A1A2E", color: "#E5E7EB", padding: "14px 16px", borderBottom: "3px solid #6366F1" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>📅 Días anteriores</span>
              <button onClick={() => setShowHistory(false)} style={{ background: "none", border: "none", color: "#6B7280", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>
            {history.map(h => (
              <div key={h.dateKey} onClick={() => { setHistoryDay(h); setShowHistory(false); }}
                style={{ background: "#0F0F1A", borderRadius: 10, padding: "11px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#D1FAE5" }}>{h.dateKey}</div>
                  <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{h.count} platillos · {h.prot}g prot{h.burned > 0 ? ` · −${h.burned} kcal ej.` : ""}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: (h.cal - h.burned) <= dailyGoal ? "#52B788" : "#E63946" }}>{h.cal - h.burned}</div>
                  <div style={{ fontSize: 10, color: "#6B7280" }}>kcal netas</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History detail */}
      {historyDay && (
        <div style={{ background: "#F0FDF4", borderBottom: "2px solid #52B788", padding: "14px 16px" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.primary }}>📋 {historyDay.dateKey}</span>
              <button onClick={() => setHistoryDay(null)} style={{ background: "none", border: "none", color: COLORS.muted, fontSize: 16, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {[
                { label: "Calorías netas", val: historyDay.cal - historyDay.burned, unit: "kcal", color: (historyDay.cal - historyDay.burned) <= dailyGoal ? COLORS.success : COLORS.danger },
                { label: "Proteína", val: historyDay.prot, unit: "g", color: "#3B82F6" },
                { label: "Quemadas", val: historyDay.burned, unit: "kcal", color: "#F59E0B" },
              ].map(m => (
                <div key={m.label} style={{ flex: 1, background: "#fff", borderRadius: 10, padding: "9px 6px", textAlign: "center" }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: m.color }}>{m.val}<span style={{ fontSize: 10, fontWeight: 400 }}> {m.unit}</span></div>
                  <div style={{ fontSize: 10, color: COLORS.muted }}>{m.label}</div>
                </div>
              ))}
            </div>
            {historyDay.data.map(d => (
              <div key={d.id} style={{ background: "#fff", borderRadius: 9, padding: "8px 12px", marginBottom: 5, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span>{MEAL_TIMES.find(m => m.id === d.meal)?.emoji} {d.name}</span>
                <span style={{ color: COLORS.muted }}>{d.calories} kcal · <span style={{ color: "#3B82F6" }}>{d.protein}g</span></span>
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
            <button onClick={() => { navigator.clipboard.writeText(buildSummaryText()).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); }); }}
              style={{ width: "100%", background: copied ? "#52B788" : "#2D6A4F", color: "#fff", border: "none", borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              {copied ? "✅ ¡Copiado!" : "📋 Copiar al portapapeles"}
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: 600, margin: "0 auto", display: "flex" }}>
          {[{ id: "registro", label: "📋 Registro" }, { id: "semana", label: "📊 Semana" }, { id: "calculadora", label: "🧮 Calc" }, { id: "proteinas", label: "💪 Proteína" }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: "12px 0", border: "none", background: "none", fontSize: 12, fontWeight: 600,
              color: activeTab === tab.id ? COLORS.primary : COLORS.muted, cursor: "pointer",
              borderBottom: activeTab === tab.id ? `2px solid ${COLORS.primary}` : "2px solid transparent",
            }}>{tab.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px" }}>

        {/* ── TAB: REGISTRO ── */}
        {activeTab === "registro" && (
          <>
            {/* Summary card */}
            {(dishes.length > 0 || workouts.length > 0) && (
              <div style={{ background: COLORS.surface, borderRadius: 16, padding: "15px 17px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                {/* Net calories */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>🔥 Calorías netas</span>
                  <span style={{ fontWeight: 700, fontSize: 19, color: progressColor }}>{netCalories.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 400, color: COLORS.muted, marginLeft: 4 }}>/ {adjustedGoal} kcal</span></span>
                </div>
                {totalBurned > 0 && (
                  <div style={{ fontSize: 11, color: "#92400E", background: "#FEF3C7", borderRadius: 7, padding: "4px 10px", marginBottom: 8, display: "inline-block" }}>
                    ⚡ +{totalBurned} kcal de ejercicio sumadas a tu meta
                  </div>
                )}
                <div style={{ height: 8, background: COLORS.border, borderRadius: 6, overflow: "hidden", marginBottom: 4 }}>
                  <div style={{ height: "100%", width: `${progressPct}%`, background: progressColor, borderRadius: 6, transition: "width 0.4s ease" }} />
                </div>
                <div style={{ fontSize: 11, color: COLORS.muted, textAlign: "right", marginBottom: 13 }}>
                  {netCalories < adjustedGoal ? `Faltan ${(adjustedGoal - netCalories).toLocaleString()} kcal` : `Superaste la meta por ${(netCalories - adjustedGoal).toLocaleString()} kcal`}
                </div>
                {/* Protein */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>💪 Proteína</span>
                  <span style={{ fontWeight: 700, fontSize: 19, color: proteinColor }}>{totalProtein}g<span style={{ fontSize: 11, fontWeight: 400, color: COLORS.muted, marginLeft: 4 }}>/ {proteinGoal}g</span></span>
                </div>
                <div style={{ height: 8, background: COLORS.border, borderRadius: 6, overflow: "hidden", marginBottom: 4 }}>
                  <div style={{ height: "100%", width: `${proteinPct}%`, background: proteinColor, borderRadius: 6, transition: "width 0.4s ease" }} />
                </div>
                <div style={{ fontSize: 11, color: COLORS.muted, textAlign: "right", marginBottom: 13 }}>
                  {totalProtein < proteinGoal ? `Faltan ${proteinGoal - totalProtein}g para tu meta muscular` : "¡Meta de proteína alcanzada! 🎉"}
                </div>
                {/* Macro row */}
                <div style={{ display: "flex", gap: 7, paddingTop: 11, borderTop: `1px solid ${COLORS.border}` }}>
                  {[
                    { label: "Carbos", val: totalCarbs, color: "#F59E0B" },
                    { label: "Grasa", val: totalFat, color: "#EF4444" },
                    { label: "Quemadas", val: totalBurned, color: "#F59E0B", unit: "kcal" },
                    { label: "Platillos", val: dishes.length, color: COLORS.primary, unit: "" },
                  ].map(m => (
                    <div key={m.label} style={{ flex: 1, textAlign: "center", background: COLORS.bg, borderRadius: 9, padding: "7px 3px" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: m.color }}>{m.val}{m.unit === undefined ? "g" : m.unit === "" ? "" : ` ${m.unit}`}</div>
                      <div style={{ fontSize: 9, color: COLORS.muted }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Workouts list */}
            {workouts.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#92400E", marginBottom: 8 }}>⚡ Ejercicio de hoy</div>
                {workouts.map(w => (
                  <div key={w.id} style={{ background: "#FEF3C7", borderRadius: 11, padding: "10px 13px", marginBottom: 7, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: 16, marginRight: 6 }}>{w.emoji}</span>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{w.note}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 800, color: "#92400E", fontSize: 15 }}>−{w.calories} kcal</span>
                      <button onClick={() => setWorkouts(prev => prev.filter(x => x.id !== w.id))} style={{ background: "none", border: "none", color: "#B45309", fontSize: 14, cursor: "pointer" }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Meal selector */}
            <div style={{ display: "flex", gap: 7, marginBottom: 13, overflowX: "auto", paddingBottom: 2 }}>
              {MEAL_TIMES.map(mt => {
                const count = dishesByMeal[mt.id].length;
                const active = selectedMeal === mt.id;
                return (
                  <button key={mt.id} onClick={() => setSelectedMeal(mt.id)} style={{
                    flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "8px 12px", borderRadius: 11, border: `2px solid ${active ? mt.color : COLORS.border}`,
                    background: active ? mt.color + "18" : COLORS.surface, cursor: "pointer", gap: 2,
                  }}>
                    <span style={{ fontSize: 16 }}>{mt.emoji}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: active ? mt.color : COLORS.muted }}>{mt.label}</span>
                    {count > 0 && <span style={{ fontSize: 9, background: mt.color, color: "#fff", borderRadius: 9, padding: "1px 5px", fontWeight: 700 }}>{count}</span>}
                  </button>
                );
              })}
            </div>

            {/* Input */}
            <div style={{ background: COLORS.surface, borderRadius: 13, padding: "12px 14px", marginBottom: 15, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              {(() => { const mt = MEAL_TIMES.find(m => m.id === selectedMeal); return (
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: mt.color, marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {mt.emoji} Agregar a {mt.label}
                </label>
              ); })()}
              <div style={{ display: "flex", gap: 7 }}>
                <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !loading && analyzeDish()}
                  placeholder="Ej: 2 tacos de pollo con guacamole..."
                  style={{ flex: 1, border: `1.5px solid ${COLORS.border}`, borderRadius: 9, padding: "9px 12px", fontSize: 13, outline: "none", color: COLORS.text, background: COLORS.bg }}
                  onFocus={e => (e.target.style.borderColor = COLORS.primaryLight)}
                  onBlur={e => (e.target.style.borderColor = COLORS.border)}
                />
                <button onClick={analyzeDish} disabled={loading || !input.trim()} style={{
                  background: loading || !input.trim() ? COLORS.border : COLORS.primary,
                  color: loading || !input.trim() ? COLORS.muted : "#fff",
                  border: "none", borderRadius: 9, padding: "9px 13px", fontSize: 13, fontWeight: 600,
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer", whiteSpace: "nowrap",
                }}>{loading ? "⏳" : "Analizar"}</button>
              </div>
              {error && <p style={{ margin: "7px 0 0", fontSize: 12, color: COLORS.danger }}>⚠️ {error}</p>}
            </div>

            {/* Dishes */}
            {MEAL_TIMES.map(mt => {
              const mealDishes = dishesByMeal[mt.id];
              if (mealDishes.length === 0) return null;
              const mealCal = mealDishes.reduce((s, d) => s + d.calories, 0);
              const mealProt = mealDishes.reduce((s, d) => s + d.protein, 0);
              return (
                <div key={mt.id} style={{ marginBottom: 17 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontSize: 14 }}>{mt.emoji}</span>
                      <span style={{ fontWeight: 700, fontSize: 13, color: mt.color }}>{mt.label}</span>
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.muted }}>
                      <span style={{ fontWeight: 600, color: mt.color }}>{mealCal} kcal</span> · <span>{mealProt}g prot</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {mealDishes.map(dish => {
                      const level = getCalorieLevel(dish.calories);
                      return (
                        <div key={dish.id} style={{ background: COLORS.surface, borderRadius: 12, padding: "11px 13px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderLeft: `4px solid ${level.color}`, animation: "fadeIn 0.3s ease" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 9 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{dish.name}</div>
                              <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 6 }}>Porción: {dish.portion}</div>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {[{ label: "Prot", val: dish.protein, color: "#3B82F6" }, { label: "Carbos", val: dish.carbs, color: "#F59E0B" }, { label: "Grasa", val: dish.fat, color: "#EF4444" }].map(m => (
                                  <span key={m.label} style={{ fontSize: 10, background: COLORS.bg, borderRadius: 5, padding: "2px 7px", color: COLORS.muted }}>
                                    <span style={{ color: m.color, fontWeight: 700 }}>{m.val}g</span> {m.label}
                                  </span>
                                ))}
                              </div>
                              {dish.tip && <p style={{ margin: "6px 0 0", fontSize: 10, color: COLORS.muted, fontStyle: "italic" }}>💡 {dish.tip}</p>}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 18, fontWeight: 800, color: level.color, lineHeight: 1 }}>{dish.calories}</div>
                                <div style={{ fontSize: 9, color: COLORS.muted }}>kcal</div>
                              </div>
                              <button onClick={() => setDishes(prev => prev.filter(d => d.id !== dish.id))} style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 5, padding: "2px 7px", fontSize: 10, color: COLORS.muted, cursor: "pointer" }}>✕</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {dishes.length === 0 && workouts.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 20px", color: COLORS.muted }}>
                <div style={{ fontSize: 42, marginBottom: 10 }}>🍽️</div>
                <p style={{ margin: 0, fontSize: 13 }}>Selecciona una comida y empieza a registrar</p>
              </div>
            )}

            {(dishes.length > 0 || workouts.length > 0) && (
              <button onClick={() => { setDishes([]); setWorkouts([]); }} style={{ display: "block", margin: "14px auto 0", background: "none", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: "8px 20px", fontSize: 12, color: COLORS.muted, cursor: "pointer" }}>
                Limpiar día actual
              </button>
            )}
          </>
        )}

        {/* ── TAB: SEMANA ── */}
        {activeTab === "semana" && (
          <>
            <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>📊 Últimos 7 días</h2>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: COLORS.muted }}>La barra amarilla muestra las calorías quemadas por ejercicio</p>

            <div style={{ background: COLORS.surface, borderRadius: 16, padding: "16px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              <WeeklyChart data={weeklyData} dailyGoal={dailyGoal} />
            </div>

            {/* Weekly summary cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {[...weeklyData].reverse().map(d => {
                const isToday = d.key === getTodayKey();
                const net = d.net - d.burned;
                return (
                  <div key={d.key} style={{ background: COLORS.surface, borderRadius: 13, padding: "12px 15px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderLeft: `4px solid ${d.net === 0 ? COLORS.border : net <= dailyGoal ? COLORS.success : COLORS.danger}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                          {formatDateShort(d.key)}
                          {isToday && <span style={{ fontSize: 9, background: COLORS.primary, color: "#fff", borderRadius: 8, padding: "2px 7px" }}>HOY</span>}
                        </div>
                        <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
                          {d.protein > 0 ? `${d.protein}g proteína` : "Sin registro"}
                          {d.burned > 0 && <span style={{ color: "#F59E0B", marginLeft: 6 }}>· ⚡−{d.burned} kcal</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {d.net > 0 ? (
                          <>
                            <div style={{ fontSize: 18, fontWeight: 800, color: net <= dailyGoal ? COLORS.success : COLORS.danger, lineHeight: 1 }}>{d.net}</div>
                            <div style={{ fontSize: 9, color: COLORS.muted }}>kcal ingeridas</div>
                          </>
                        ) : (
                          <div style={{ fontSize: 12, color: COLORS.border }}>—</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Weekly averages */}
            {weeklyData.some(d => d.net > 0) && (() => {
              const activeDays = weeklyData.filter(d => d.net > 0);
              const avgCal = Math.round(activeDays.reduce((s, d) => s + d.net, 0) / activeDays.length);
              const avgProt = Math.round(activeDays.reduce((s, d) => s + d.protein, 0) / activeDays.length);
              const avgBurned = Math.round(weeklyData.reduce((s, d) => s + d.burned, 0) / 7);
              return (
                <div style={{ background: "#EFF6FF", borderRadius: 13, padding: "14px 16px", marginTop: 14, borderLeft: "4px solid #3B82F6" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#1D4ED8", marginBottom: 10 }}>📈 Promedio semanal ({activeDays.length} días registrados)</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {[
                      { label: "Calorías/día", val: avgCal, color: "#1D4ED8" },
                      { label: "Proteína/día", val: `${avgProt}g`, color: "#3B82F6" },
                      { label: "Quemadas/día", val: `${avgBurned} kcal`, color: "#F59E0B" },
                    ].map(m => (
                      <div key={m.label} style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: m.color }}>{m.val}</div>
                        <div style={{ fontSize: 10, color: "#3B82F6" }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </>
        )}


        {/* ── TAB: CALCULADORA ── */}
        {activeTab === "calculadora" && (
          <>
            <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>🧮 Calculadora de calorías</h2>
            <p style={{ margin: "0 0 14px", fontSize: 12, color: COLORS.muted }}>Ingresa el alimento y la cantidad exacta para conocer sus macros</p>

            {/* Mode toggle */}
            <div style={{ display: "flex", background: COLORS.surface, borderRadius: 12, padding: 4, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              {[{ id: "ia", label: "🤖 Buscar con IA" }, { id: "lista", label: "📋 Lista de alimentos" }].map(m => (
                <button key={m.id} onClick={() => { setCalcMode(m.id); setCalcResult(null); setCalcError(""); }} style={{
                  flex: 1, padding: "10px", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600,
                  background: calcMode === m.id ? COLORS.primary : "none",
                  color: calcMode === m.id ? "#fff" : COLORS.muted, cursor: "pointer",
                  transition: "all 0.2s",
                }}>{m.label}</button>
              ))}
            </div>

            {/* IA mode */}
            {calcMode === "ia" && (
              <div style={{ background: COLORS.surface, borderRadius: 14, padding: "15px", marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: COLORS.muted, marginBottom: 6, textTransform: "uppercase" }}>Alimento</label>
                <input value={calcFood} onChange={e => setCalcFood(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !calcLoading && calcWithAI()}
                  placeholder="Ej: pechuga de pollo, tortilla de harina, mango..."
                  style={{ width: "100%", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 13px", fontSize: 14, outline: "none", color: COLORS.text, background: COLORS.bg, boxSizing: "border-box", marginBottom: 12 }}
                  onFocus={e => (e.target.style.borderColor = COLORS.primaryLight)}
                  onBlur={e => (e.target.style.borderColor = COLORS.border)}
                />
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: COLORS.muted, marginBottom: 6, textTransform: "uppercase" }}>Cantidad</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="number" value={calcAmount} onChange={e => setCalcAmount(e.target.value)}
                    placeholder="Ej: 150"
                    style={{ flex: 1, border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 13px", fontSize: 16, fontWeight: 700, outline: "none", color: COLORS.text, background: COLORS.bg }}
                    onFocus={e => (e.target.style.borderColor = COLORS.primaryLight)}
                    onBlur={e => (e.target.style.borderColor = COLORS.border)}
                  />
                  <div style={{ display: "flex", background: COLORS.bg, borderRadius: 10, border: `1.5px solid ${COLORS.border}`, overflow: "hidden" }}>
                    {["g", "ml"].map(u => (
                      <button key={u} onClick={() => setCalcUnit(u)} style={{
                        padding: "10px 16px", border: "none", fontSize: 14, fontWeight: 700,
                        background: calcUnit === u ? COLORS.primary : "none",
                        color: calcUnit === u ? "#fff" : COLORS.muted, cursor: "pointer",
                      }}>{u}</button>
                    ))}
                  </div>
                </div>
                {calcError && <p style={{ margin: "8px 0 0", fontSize: 12, color: COLORS.danger }}>⚠️ {calcError}</p>}
                <button onClick={calcWithAI} disabled={calcLoading || !calcFood.trim() || !calcAmount} style={{
                  width: "100%", marginTop: 14, background: calcLoading || !calcFood.trim() || !calcAmount ? COLORS.border : COLORS.primary,
                  color: calcLoading || !calcFood.trim() || !calcAmount ? COLORS.muted : "#fff",
                  border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700,
                  cursor: calcLoading || !calcFood.trim() || !calcAmount ? "not-allowed" : "pointer",
                }}>{calcLoading ? "⏳ Calculando..." : "Calcular calorías"}</button>
              </div>
            )}

            {/* List mode */}
            {calcMode === "lista" && (
              <div style={{ background: COLORS.surface, borderRadius: 14, padding: "15px", marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                <input value={calcSearch} onChange={e => { setCalcSearch(e.target.value); setCalcSelected(null); setCalcResult(null); }}
                  placeholder="🔍 Buscar alimento..."
                  style={{ width: "100%", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 13px", fontSize: 14, outline: "none", color: COLORS.text, background: COLORS.bg, boxSizing: "border-box", marginBottom: 10 }}
                  onFocus={e => (e.target.style.borderColor = COLORS.primaryLight)}
                  onBlur={e => (e.target.style.borderColor = COLORS.border)}
                />
                {!calcSelected && (
                  <div style={{ maxHeight: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                    {filteredFoods.map(food => (
                      <div key={food.name} onClick={() => { setCalcSelected(food); setCalcAmount(""); setCalcResult(null); }}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, cursor: "pointer", background: COLORS.bg, transition: "background 0.15s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#E5F0EC")}
                        onMouseLeave={e => (e.currentTarget.style.background = COLORS.bg)}
                      >
                        <span style={{ fontSize: 22 }}>{food.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{food.name}</div>
                          <div style={{ fontSize: 10, color: COLORS.muted }}>{food.cal} kcal · {food.protein}g prot · por 100{food.unit}</div>
                        </div>
                        <span style={{ fontSize: 18, color: COLORS.muted }}>›</span>
                      </div>
                    ))}
                  </div>
                )}
                {calcSelected && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "10px 12px", background: COLORS.bg, borderRadius: 10 }}>
                      <span style={{ fontSize: 24 }}>{calcSelected.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{calcSelected.name}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted }}>{calcSelected.cal} kcal por 100{calcSelected.unit}</div>
                      </div>
                      <button onClick={() => { setCalcSelected(null); setCalcResult(null); }} style={{ marginLeft: "auto", background: "none", border: "none", color: COLORS.muted, fontSize: 18, cursor: "pointer" }}>✕</button>
                    </div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: COLORS.muted, marginBottom: 6, textTransform: "uppercase" }}>Cantidad ({calcSelected.unit})</label>
                    <input type="number" value={calcAmount} onChange={e => { setCalcAmount(e.target.value); if (calcSelected && parseFloat(e.target.value) > 0) calcFromList(calcSelected, e.target.value); else setCalcResult(null); }}
                      placeholder={`Ej: 150 ${calcSelected.unit}`}
                      style={{ width: "100%", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 14px", fontSize: 18, fontWeight: 700, outline: "none", color: COLORS.text, background: COLORS.bg, boxSizing: "border-box" }}
                      onFocus={e => (e.target.style.borderColor = COLORS.primaryLight)}
                      onBlur={e => (e.target.style.borderColor = COLORS.border)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Result card */}
            {calcResult && (
              <div style={{ background: COLORS.surface, borderRadius: 16, padding: "18px", marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", border: `2px solid ${COLORS.primaryLight}`, animation: "fadeIn 0.3s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{calcResult.name}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{calcResult.amount}{calcResult.unit} · ref: {calcResult.per100} kcal/100{calcResult.unit}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 30, fontWeight: 900, color: COLORS.primary, lineHeight: 1 }}>{calcResult.calories}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted }}>kcal totales</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {[
                    { label: "Proteína", val: calcResult.protein, unit: "g", color: "#3B82F6", bg: "#EFF6FF" },
                    { label: "Carbos", val: calcResult.carbs, unit: "g", color: "#F59E0B", bg: "#FFFBEB" },
                    { label: "Grasa", val: calcResult.fat, unit: "g", color: "#EF4444", bg: "#FEF2F2" },
                  ].map(m => (
                    <div key={m.label} style={{ flex: 1, background: m.bg, borderRadius: 10, padding: "10px 6px", textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: m.color }}>{m.val}<span style={{ fontSize: 11, fontWeight: 400 }}>{m.unit}</span></div>
                      <div style={{ fontSize: 10, color: m.color, fontWeight: 600 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <select value={selectedMeal} onChange={e => setSelectedMeal(e.target.value)} style={{ flex: 1, border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 13, outline: "none", color: COLORS.text, background: COLORS.bg, cursor: "pointer" }}>
                    {MEAL_TIMES.map(m => <option key={m.id} value={m.id}>{m.emoji} {m.label}</option>)}
                  </select>
                  <button onClick={addCalcResultToLog} style={{ flex: 2, background: COLORS.primary, color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                    ➕ Agregar al registro
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── TAB: PROTEÍNAS ── */}
        {activeTab === "proteinas" && (
          <>
            <div style={{ marginBottom: 13 }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>Alimentos altos en proteína</h2>
              <p style={{ margin: 0, fontSize: 12, color: COLORS.muted }}>Tu meta: <strong style={{ color: "#3B82F6" }}>{proteinGoal}g/día</strong> · Toca un alimento para añadirlo</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {HIGH_PROTEIN_FOODS.map(food => {
                const pct = Math.round((food.protein / proteinGoal) * 100);
                return (
                  <div key={food.name}
                    onClick={() => { setInput(food.name); setActiveTab("registro"); setTimeout(() => inputRef.current?.focus(), 100); }}
                    style={{ background: COLORS.surface, borderRadius: 12, padding: "11px 13px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "transform 0.1s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
                  >
                    <span style={{ fontSize: 26 }}>{food.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 1 }}>{food.name}</div>
                      <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 4 }}>{food.per} · {food.cal} kcal</div>
                      <div style={{ height: 5, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: "#3B82F6", borderRadius: 4 }} />
                      </div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 48 }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#3B82F6", lineHeight: 1 }}>{food.protein}g</div>
                      <div style={{ fontSize: 9, color: COLORS.muted }}>proteína</div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "#3B82F6", marginTop: 1 }}>{pct}% meta</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ margin: "14px 0 4px", padding: "12px 14px", background: "#EFF6FF", borderRadius: 12, borderLeft: "4px solid #3B82F6" }}>
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
