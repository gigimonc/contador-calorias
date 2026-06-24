              import { useState, useRef, useEffect } from "react";

const COLORS = {
  bg: "#F7F5F0", surface: "#FFFFFF", primary: "#2D6A4F",
  primaryLight: "#52B788", accent: "#F4A261", text: "#1A1A2E",
  muted: "#6B7280", border: "#E5E7EB", danger: "#E63946", success: "#52B788",
};

const MEAL_TIMES = [
  { id: "desayuno", label: "Desayuno", emoji: "\uD83C\uDF05", color: "#F59E0B" },
  { id: "almuerzo", label: "Almuerzo", emoji: "\u2600\uFE0F", color: "#2D6A4F" },
  { id: "cena", label: "Cena", emoji: "\uD83C\uDF19", color: "#6366F1" },
  { id: "snack", label: "Snack", emoji: "\uD83C\uDF4E", color: "#EC4899" },
];

const EXERCISE_TYPES = [
  { id: "funcional", label: "Ejercicio funcional", emoji: "\uD83C\uDFCB\uFE0F", cal_per_min: 8 },
  { id: "caminata", label: "Caminata", emoji: "\uD83D\uDEB6", cal_per_min: 4 },
  { id: "correr", label: "Correr", emoji: "\uD83C\uDFC3", cal_per_min: 11 },
  { id: "ciclismo", label: "Ciclismo", emoji: "\uD83D\uDEB4", cal_per_min: 9 },
  { id: "nadar", label: "Natacion", emoji: "\uD83C\uDFCA", cal_per_min: 10 },
  { id: "yoga", label: "Yoga / Pilates", emoji: "\uD83E\uDDD8", cal_per_min: 4 },
  { id: "hiit", label: "HIIT", emoji: "\u26A1", cal_per_min: 13 },
  { id: "otro", label: "Otro", emoji: "\uD83C\uDFC5", cal_per_min: 6 },
];

const HIGH_PROTEIN_FOODS = [
  { name: "Pechuga de pollo", emoji: "\uD83C\uDF57", protein: 31, cal: 165, per: "100g" },
  { name: "Atun en agua", emoji: "\uD83D\uDC1F", protein: 30, cal: 132, per: "100g" },
  { name: "Huevo entero", emoji: "\uD83E\uDD5A", protein: 6, cal: 78, per: "1 pieza" },
  { name: "Claras de huevo", emoji: "\uD83C\uDF73", protein: 11, cal: 52, per: "3 claras" },
  { name: "Yogur griego", emoji: "\uD83E\uDD5B", protein: 17, cal: 100, per: "1 taza" },
  { name: "Frijoles negros", emoji: "\uD83E\uDEB8", protein: 15, cal: 227, per: "1 taza cocida" },
  { name: "Salmon", emoji: "\uD83D\uDC20", protein: 25, cal: 208, per: "100g" },
  { name: "Queso cottage", emoji: "\uD83E\uDDC0", protein: 14, cal: 110, per: "1/2 taza" },
  { name: "Pavo molido", emoji: "\uD83E\uDD83", protein: 29, cal: 189, per: "100g" },
  { name: "Edamame", emoji: "\uD83C\uDF31", protein: 17, cal: 188, per: "1 taza" },
  { name: "Lentejas", emoji: "\uD83C\uDF72", protein: 18, cal: 230, per: "1 taza cocida" },
  { name: "Camaron", emoji: "\uD83E\uDD90", protein: 24, cal: 99, per: "100g" },
];

const COMMON_FOODS = [
  { name: "Arroz blanco cocido", emoji: "\uD83C\uDF5A", cal: 130, protein: 2.7, carbs: 28, fat: 0.3, unit: "g" },
  { name: "Arroz integral cocido", emoji: "\uD83C\uDF5A", cal: 111, protein: 2.6, carbs: 23, fat: 0.9, unit: "g" },
  { name: "Pechuga de pollo", emoji: "\uD83C\uDF57", cal: 165, protein: 31, carbs: 0, fat: 3.6, unit: "g" },
  { name: "Carne molida 90pct", emoji: "\uD83E\uDD69", cal: 176, protein: 20, carbs: 0, fat: 10, unit: "g" },
  { name: "Salmon", emoji: "\uD83D\uDC1F", cal: 208, protein: 20, carbs: 0, fat: 13, unit: "g" },
  { name: "Atun en agua", emoji: "\uD83D\uDC1F", cal: 116, protein: 26, carbs: 0, fat: 1, unit: "g" },
  { name: "Huevo entero", emoji: "\uD83E\uDD5A", cal: 155, protein: 13, carbs: 1.1, fat: 11, unit: "g" },
  { name: "Leche entera", emoji: "\uD83E\uDD5B", cal: 61, protein: 3.2, carbs: 4.8, fat: 3.3, unit: "ml" },
  { name: "Leche descremada", emoji: "\uD83E\uDD5B", cal: 34, protein: 3.4, carbs: 5, fat: 0.1, unit: "ml" },
  { name: "Yogur griego natural", emoji: "\uD83E\uDD5B", cal: 59, protein: 10, carbs: 3.6, fat: 0.4, unit: "g" },
  { name: "Queso panela", emoji: "\uD83E\uDDC0", cal: 291, protein: 19, carbs: 3, fat: 22, unit: "g" },
  { name: "Aguacate", emoji: "\uD83E\uDD51", cal: 160, protein: 2, carbs: 9, fat: 15, unit: "g" },
  { name: "Platano", emoji: "\uD83C\uDF4C", cal: 89, protein: 1.1, carbs: 23, fat: 0.3, unit: "g" },
  { name: "Manzana", emoji: "\uD83C\uDF4E", cal: 52, protein: 0.3, carbs: 14, fat: 0.2, unit: "g" },
  { name: "Naranja", emoji: "\uD83C\uDF4A", cal: 47, protein: 0.9, carbs: 12, fat: 0.1, unit: "g" },
  { name: "Papa cocida", emoji: "\uD83E\uDD54", cal: 87, protein: 1.9, carbs: 20, fat: 0.1, unit: "g" },
  { name: "Camote cocido", emoji: "\uD83C\uDF60", cal: 90, protein: 2, carbs: 21, fat: 0.1, unit: "g" },
  { name: "Frijoles negros cocidos", emoji: "\uD83E\uDEB8", cal: 132, protein: 8.9, carbs: 24, fat: 0.5, unit: "g" },
  { name: "Lentejas cocidas", emoji: "\uD83C\uDF72", cal: 116, protein: 9, carbs: 20, fat: 0.4, unit: "g" },
  { name: "Avena cruda", emoji: "\uD83C\uDF3E", cal: 389, protein: 17, carbs: 66, fat: 7, unit: "g" },
  { name: "Pan integral", emoji: "\uD83C\uDF5E", cal: 247, protein: 13, carbs: 41, fat: 4, unit: "g" },
  { name: "Tortilla de maiz", emoji: "\uD83E\uDEB3", cal: 218, protein: 5.7, carbs: 46, fat: 2.5, unit: "g" },
  { name: "Aceite de oliva", emoji: "\uD83E\uDEB2", cal: 884, protein: 0, carbs: 0, fat: 100, unit: "ml" },
  { name: "Almendras", emoji: "\uD83C\uDF30", cal: 579, protein: 21, carbs: 22, fat: 50, unit: "g" },
  { name: "Nueces", emoji: "\uD83C\uDF30", cal: 654, protein: 15, carbs: 14, fat: 65, unit: "g" },
  { name: "Brocoli cocido", emoji: "\uD83E\uDD66", cal: 35, protein: 2.4, carbs: 7, fat: 0.4, unit: "g" },
  { name: "Zanahoria", emoji: "\uD83E\uDD55", cal: 41, protein: 0.9, carbs: 10, fat: 0.2, unit: "g" },
  { name: "Espinaca", emoji: "\uD83E\uDD6C", cal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, unit: "g" },
  { name: "Tomate", emoji: "\uD83C\uDF45", cal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, unit: "g" },
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
  const d = new Date(key + "T12:00:00");
  return d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric" });
}

function WeeklyChart({ data, dailyGoal }) {
  const maxVal = Math.max(...data.map(function(d) { return Math.max(d.net, d.burned, 10); }), dailyGoal);
  const barW = 32;
  const chartH = 140;
  const pad = 10;
  const goalY = pad + chartH - (dailyGoal / maxVal) * chartH;

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={data.length * (barW + 12) + pad * 2} height={chartH + 50} style={{ display: "block" }}>
        <line x1={pad} x2={data.length * (barW + 12) + pad} y1={goalY} y2={goalY}
          stroke="#E63946" strokeDasharray="4,3" strokeWidth={1.5} />
        <text x={pad + 2} y={goalY - 4} fontSize={9} fill="#E63946">meta</text>
        {data.map(function(d, i) {
          const x = pad + i * (barW + 12);
          const netH = Math.max((d.net / maxVal) * chartH, 2);
          const burnH = Math.max((d.burned / maxVal) * chartH, d.burned > 0 ? 2 : 0);
          const netColor = d.net === 0 ? COLORS.border : d.net <= dailyGoal ? COLORS.success : COLORS.danger;
          const isToday = d.key === getTodayKey();
          return (
            <g key={d.key}>
              <rect x={x} y={pad + chartH - netH} width={barW} height={netH} fill={netColor} rx={4} opacity={isToday ? 1 : 0.75} />
              {burnH > 0 && (
                <rect x={x} y={pad + chartH - netH - burnH} width={barW} height={burnH} fill="#F59E0B" rx={4} opacity={0.85} />
              )}
              {isToday && <rect x={x} y={pad + chartH + 4} width={barW} height={3} fill={COLORS.primary} rx={2} />}
              <text x={x + barW / 2} y={pad + chartH + 18} textAnchor="middle" fontSize={9} fill={COLORS.muted}>
                {formatDateShort(d.key)}
              </text>
              {d.net > 0 && (
                <text x={x + barW / 2} y={pad + chartH - netH - burnH - 4} textAnchor="middle" fontSize={8} fill={COLORS.text}>
                  {d.net}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 11, color: COLORS.muted }}>
        <span>
          <span style={{ display: "inline-block", width: 10, height: 10, background: COLORS.success, borderRadius: 2, marginRight: 4 }} />
          Calorias ingeridas
        </span>
        <span>
          <span style={{ display: "inline-block", width: 10, height: 10, background: "#F59E0B", borderRadius: 2, marginRight: 4 }} />
          Calorias quemadas
        </span>
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
  const [showExercise, setShowExercise] = useState(false);
  const [exMode, setExMode] = useState("manual");
  const [exManualCal, setExManualCal] = useState("");
  const [exType, setExType] = useState("funcional");
  const [exDuration, setExDuration] = useState("");
  const [exNote, setExNote] = useState("");
  const [reminder, setReminder] = useState(null);
  const [calcMode, setCalcMode] = useState("ia");
  const [calcFood, setCalcFood] = useState("");
  const [calcAmount, setCalcAmount] = useState("");
  const [calcUnit, setCalcUnit] = useState("g");
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState("");
  const [calcSearch, setCalcSearch] = useState("");
  const [calcSelected, setCalcSelected] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [dailyGoal] = useState(2400);
  const [proteinGoal] = useState(133);
  const inputRef = useRef(null);
  const photoInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(function() {
    const key = getTodayKey();
    try {
      const saved = localStorage.getItem("calorias_" + key);
      if (saved) setDishes(JSON.parse(saved));
      const savedW = localStorage.getItem("workouts_" + key);
      if (savedW) setWorkouts(JSON.parse(savedW));
    } catch (e) {}
  }, []);

  useEffect(function() {
    localStorage.setItem("calorias_" + getTodayKey(), JSON.stringify(dishes));
    if (dishes.length > 0) localStorage.setItem("lastEntry_" + getTodayKey(), Date.now().toString());
  }, [dishes]);

  useEffect(function() {
    localStorage.setItem("workouts_" + getTodayKey(), JSON.stringify(workouts));
  }, [workouts]);

  useEffect(function() {
    function checkReminder() {
      const now = new Date();
      const hour = now.getHours();
      if (hour < 7 || hour > 21) { setReminder(null); return; }
      const lastEntry = parseInt(localStorage.getItem("lastEntry_" + getTodayKey()) || "0");
      const diffMin = lastEntry > 0 ? (Date.now() - lastEntry) / 60000 : null;
      if (diffMin !== null && diffMin > 150) {
        setReminder("Llevas mas de " + Math.floor(diffMin / 60) + "h sin registrar. Ya comiste algo?");
      } else if (diffMin === null && dishes.length === 0 && hour >= 9) {
        setReminder("Hola! No has registrado nada hoy. Empezamos?");
      } else {
        setReminder(null);
      }
    }
    checkReminder();
    const interval = setInterval(checkReminder, 5 * 60 * 1000);
    return function() { clearInterval(interval); };
  }, [dishes]);

  const totalCaloriesIn = dishes.reduce(function(sum, d) { return sum + (d.calories || 0); }, 0);
  const totalBurned = workouts.reduce(function(sum, w) { return sum + (w.calories || 0); }, 0);
  const netCalories = totalCaloriesIn - totalBurned;
  const adjustedGoal = dailyGoal + totalBurned;
  const totalProtein = dishes.reduce(function(sum, d) { return sum + (d.protein || 0); }, 0);
  const totalCarbs = dishes.reduce(function(sum, d) { return sum + (d.carbs || 0); }, 0);
  const totalFat = dishes.reduce(function(sum, d) { return sum + (d.fat || 0); }, 0);
  const proteinPct = Math.min((totalProtein / proteinGoal) * 100, 100);
  const proteinColor = totalProtein < proteinGoal * 0.5 ? "#EF4444" : totalProtein < proteinGoal ? "#F59E0B" : "#3B82F6";
  const progressPct = Math.min((netCalories / adjustedGoal) * 100, 100);
  const progressColor = netCalories < adjustedGoal * 0.6 ? COLORS.success : netCalories < adjustedGoal ? COLORS.accent : COLORS.danger;

  const dishesByMeal = MEAL_TIMES.reduce(function(acc, mt) {
    acc[mt.id] = dishes.filter(function(d) { return d.meal === mt.id; });
    return acc;
  }, {});

  const weeklyData = getLast7Days().map(function(key) {
    try {
      const d = JSON.parse(localStorage.getItem("calorias_" + key) || "[]");
      const w = JSON.parse(localStorage.getItem("workouts_" + key) || "[]");
      return {
        key: key,
        net: d.reduce(function(s, x) { return s + (x.calories || 0); }, 0),
        burned: w.reduce(function(s, x) { return s + (x.calories || 0); }, 0),
        protein: d.reduce(function(s, x) { return s + (x.protein || 0); }, 0),
      };
    } catch(e) { return { key: key, net: 0, burned: 0, protein: 0 }; }
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
                dateKey: dateKey, data: data,
                cal: data.reduce(function(s, d) { return s + (d.calories || 0); }, 0),
                prot: data.reduce(function(s, d) { return s + (d.protein || 0); }, 0),
                burned: w.reduce(function(s, x) { return s + (x.calories || 0); }, 0),
                count: data.length,
              });
            }
          } catch(e) {}
        }
      }
    }
    return days.sort(function(a, b) { return b.dateKey.localeCompare(a.dateKey); });
  }

  async function analyzePhoto(file) {
    if (!file) return;
    setPhotoLoading(true); setPhotoError("");
    const reader = new FileReader();
    reader.onload = async function(e) {
      const base64 = e.target.result.split(",")[1];
      const mediaType = file.type || "image/jpeg";
      setPhotoPreview(e.target.result);
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-6", max_tokens: 1000,
            system: "Eres un nutricionista experto en analisis visual de alimentos. Analiza la imagen y estima las calorias y macros. Responde SOLO con JSON valido sin markdown: {\"name\":\"descripcion del platillo\",\"calories\":numero entero,\"protein\":numero con 1 decimal,\"carbs\":numero con 1 decimal,\"fat\":numero con 1 decimal,\"portion\":\"descripcion de la porcion estimada\",\"ingredients\":[\"ingrediente 1\"],\"tip\":\"consejo nutricional breve\",\"confidence\":\"alta/media/baja\"}. Si la imagen no muestra comida: {\"error\":\"No puedo identificar alimentos en esta imagen\"}",
            messages: [{
              role: "user",
              content: [
                { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
                { type: "text", text: "Analiza este platillo y estima sus calorias y macronutrientes" }
              ]
            }],
          }),
        });
        const data = await response.json();
        const raw = data.content.filter(function(b) { return b.type === "text"; }).map(function(b) { return b.text; }).join("");
        const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
        if (parsed.error) { setPhotoError(parsed.error); setPhotoLoading(false); return; }
        setDishes(function(prev) {
          return [...prev, Object.assign({}, parsed, { id: Date.now(), meal: selectedMeal, fromPhoto: true, tip: parsed.tip || "" })];
        });
        setShowPhotoModal(false); setPhotoPreview(null);
      } catch(err) { setPhotoError("Error al analizar la imagen. Intenta de nuevo."); }
      finally { setPhotoLoading(false); }
    };
    reader.readAsDataURL(file);
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
          system: "Eres un nutricionista experto. Responde SOLO con JSON valido sin markdown: {\"name\":\"nombre\",\"calories\":numero entero,\"protein\":numero,\"carbs\":numero,\"fat\":numero,\"portion\":\"porcion asumida\",\"tip\":\"consejo breve en espanol\"}. Si no reconoces el alimento: {\"error\":\"No reconozco este platillo\"}",
          messages: [{ role: "user", content: trimmed }],
        }),
      });
      const data = await response.json();
      const raw = data.content.filter(function(b) { return b.type === "text"; }).map(function(b) { return b.text; }).join("");
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      if (parsed.error) setError(parsed.error);
      else {
        setDishes(function(prev) { return [...prev, Object.assign({}, parsed, { id: Date.now(), meal: selectedMeal })]; });
        setInput(""); inputRef.current && inputRef.current.focus();
      }
    } catch(e) { setError("Error al analizar. Intenta de nuevo."); }
    finally { setLoading(false); }
  }

  async function calcWithAI() {
    if (!calcFood.trim() || !calcAmount || parseFloat(calcAmount) <= 0) return;
    setCalcLoading(true); setCalcError(""); setCalcResult(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 500,
          system: "Eres un nutricionista experto. El usuario te da un alimento y cantidad. Calcula los macronutrientes para ESA cantidad especifica. Responde SOLO con JSON valido sin markdown: {\"name\":\"nombre\",\"amount\":numero,\"unit\":\"g o ml\",\"calories\":numero entero,\"protein\":numero con 1 decimal,\"carbs\":numero con 1 decimal,\"fat\":numero con 1 decimal,\"per100\":numero entero}. Si no reconoces: {\"error\":\"No reconozco este alimento\"}",
          messages: [{ role: "user", content: "Alimento: " + calcFood.trim() + ", Cantidad: " + calcAmount + " " + calcUnit }],
        }),
      });
      const data = await response.json();
      const raw = data.content.filter(function(b) { return b.type === "text"; }).map(function(b) { return b.text; }).join("");
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      if (parsed.error) setCalcError(parsed.error);
      else setCalcResult(parsed);
    } catch(e) { setCalcError("Error al calcular. Intenta de nuevo."); }
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
    setDishes(function(prev) {
      return [...prev, {
        id: Date.now(), meal: selectedMeal,
        name: calcResult.name + " (" + calcResult.amount + calcResult.unit + ")",
        calories: calcResult.calories, protein: calcResult.protein,
        carbs: calcResult.carbs, fat: calcResult.fat,
        portion: calcResult.amount + calcResult.unit, tip: "",
      }];
    });
    setCalcResult(null); setCalcFood(""); setCalcAmount(""); setCalcSelected(null); setCalcSearch("");
    setActiveTab("registro");
  }

  function addWorkout() {
    let cal = 0;
    if (exMode === "manual") {
      cal = parseInt(exManualCal);
      if (!cal || cal <= 0) return;
    } else {
      const type = EXERCISE_TYPES.find(function(e) { return e.id === exType; });
      const mins = parseInt(exDuration);
      if (!mins || mins <= 0) return;
      cal = Math.round(type.cal_per_min * mins);
    }
    const type = EXERCISE_TYPES.find(function(e) { return e.id === exType; });
    setWorkouts(function(prev) {
      return [...prev, {
        id: Date.now(), calories: cal,
        note: exNote || (exMode === "calcular" ? type.label + " " + exDuration + " min" : "Ejercicio"),
        emoji: type.emoji, duration: exMode === "calcular" ? parseInt(exDuration) : null,
      }];
    });
    setExManualCal(""); setExDuration(""); setExNote(""); setShowExercise(false);
  }

  function buildSummaryText() {
    const lines = [];
    lines.push("RESUMEN NUTRICIONAL DEL DIA");
    lines.push(getToday());
    lines.push("------------------------------------");
    lines.push("Calorias ingeridas: " + totalCaloriesIn + " kcal");
    if (totalBurned > 0) {
      lines.push("Calorias quemadas:  -" + totalBurned + " kcal");
      lines.push("Calorias netas:     " + netCalories + " / " + adjustedGoal + " kcal");
    } else {
      lines.push("Total:              " + totalCaloriesIn + " / " + dailyGoal + " kcal");
    }
    lines.push("Proteina: " + totalProtein + " / " + proteinGoal + " g");
    lines.push("Carbos: " + totalCarbs + " g   Grasa: " + totalFat + " g");
    lines.push("------------------------------------");
    MEAL_TIMES.forEach(function(mt) {
      const mds = dishesByMeal[mt.id];
      if (!mds || mds.length === 0) return;
      const mCal = mds.reduce(function(s, d) { return s + d.calories; }, 0);
      const mProt = mds.reduce(function(s, d) { return s + d.protein; }, 0);
      lines.push("\n" + mt.label.toUpperCase() + " (" + mCal + " kcal / " + mProt + "g prot)");
      mds.forEach(function(d) { lines.push("  - " + d.name + " - " + d.calories + " kcal, " + d.protein + "g prot"); });
    });
    if (workouts.length > 0) {
      lines.push("\nEJERCICIO (-" + totalBurned + " kcal)");
      workouts.forEach(function(w) { lines.push("  - " + w.note + " - -" + w.calories + " kcal"); });
    }
    lines.push("\n------------------------------------");
    lines.push(netCalories <= adjustedGoal ? "OK: Dentro de tu meta (faltan " + (adjustedGoal - netCalories) + " kcal)" : "ALERTA: Superaste la meta por " + (netCalories - adjustedGoal) + " kcal");
    lines.push(totalProtein >= proteinGoal ? "OK: Meta de proteina alcanzada!" : "ALERTA: Faltan " + (proteinGoal - totalProtein) + "g de proteina");
    return lines.join("\n");
  }

  const filteredFoods = COMMON_FOODS.filter(function(f) {
    return calcSearch.trim() === "" || f.name.toLowerCase().includes(calcSearch.toLowerCase());
  });

  const history = getHistory();

  const S = {
    btn: function(active, color) {
      return {
        flex: 1, padding: "10px", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600,
        background: active ? (color || COLORS.primary) : "none",
        color: active ? "#fff" : COLORS.muted, cursor: "pointer", transition: "all 0.2s",
      };
    },
    card: { background: COLORS.surface, borderRadius: 14, padding: "15px", marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
    input: { width: "100%", border: "1.5px solid " + COLORS.border, borderRadius: 10, padding: "10px 13px", fontSize: 14, outline: "none", color: COLORS.text, background: COLORS.bg, boxSizing: "border-box" },
    label: { display: "block", fontSize: 11, fontWeight: 700, color: COLORS.muted, marginBottom: 6, textTransform: "uppercase" },
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "'Segoe UI', system-ui, sans-serif", color: COLORS.text }}>

      {/* Hidden file inputs */}
      <input ref={photoInputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={function(e) { if (e.target.files[0]) { setShowPhotoModal(true); analyzePhoto(e.target.files[0]); e.target.value = ""; } }} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
        onChange={function(e) { if (e.target.files[0]) { setShowPhotoModal(true); analyzePhoto(e.target.files[0]); e.target.value = ""; } }} />

      {/* Photo modal */}
      {showPhotoModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: COLORS.surface, borderRadius: 20, padding: "24px 20px", width: "100%", maxWidth: 440, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Analizando tu platillo...</div>
            {photoPreview && (
              <img src={photoPreview} alt="Platillo" style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 12, marginBottom: 14 }} />
            )}
            {photoLoading && (
              <div>
                <div style={{ fontSize: 32, marginBottom: 8 }}>Buscando ingredientes...</div>
                <p style={{ color: COLORS.muted, fontSize: 13, margin: "0 0 10px" }}>Identificando ingredientes y estimando calorias...</p>
                <div style={{ height: 4, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "60%", background: COLORS.primary, borderRadius: 4 }} />
                </div>
              </div>
            )}
            {photoError && (
              <div>
                <p style={{ color: COLORS.danger, fontSize: 14, marginBottom: 12 }}>{photoError}</p>
                <button onClick={function() { setShowPhotoModal(false); setPhotoPreview(null); setPhotoError(""); }}
                  style={{ background: COLORS.border, border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 14, cursor: "pointer" }}>Cerrar</button>
              </div>
            )}
            {!photoLoading && !photoError && (
              <p style={{ color: COLORS.success, fontSize: 14, fontWeight: 700 }}>Platillo agregado al registro!</p>
            )}
          </div>
        </div>
      )}

      {/* Exercise modal */}
      {showExercise && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: COLORS.surface, borderRadius: "20px 20px 0 0", padding: "24px 20px", width: "100%", maxWidth: 600, maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Registrar ejercicio</h2>
              <button onClick={function() { setShowExercise(false); }} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: COLORS.muted }}>x</button>
            </div>
            <div style={{ display: "flex", background: COLORS.bg, borderRadius: 10, padding: 3, marginBottom: 18 }}>
              {[{ id: "manual", label: "Desde mi reloj" }, { id: "calcular", label: "Calcular" }].map(function(m) {
                return (
                  <button key={m.id} onClick={function() { setExMode(m.id); }} style={S.btn(exMode === m.id)}>{m.label}</button>
                );
              })}
            </div>
            {exMode === "manual" ? (
              <div>
                <label style={S.label}>Calorias quemadas (de tu reloj)</label>
                <input type="number" value={exManualCal} onChange={function(e) { setExManualCal(e.target.value); }}
                  placeholder="Ej: 320" style={Object.assign({}, S.input, { fontSize: 18, fontWeight: 700, marginBottom: 14 })} />
              </div>
            ) : (
              <div>
                <label style={S.label}>Tipo de ejercicio</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {EXERCISE_TYPES.map(function(t) {
                    return (
                      <button key={t.id} onClick={function() { setExType(t.id); }} style={{
                        padding: "7px 12px", borderRadius: 20, border: "1.5px solid " + (exType === t.id ? "#F59E0B" : COLORS.border),
                        background: exType === t.id ? "#FEF3C7" : COLORS.surface, fontSize: 12, fontWeight: 600,
                        color: exType === t.id ? "#92400E" : COLORS.muted, cursor: "pointer",
                      }}>{t.emoji} {t.label}</button>
                    );
                  })}
                </div>
                <label style={S.label}>Duracion (minutos)</label>
                <input type="number" value={exDuration} onChange={function(e) { setExDuration(e.target.value); }}
                  placeholder="Ej: 45" style={Object.assign({}, S.input, { fontSize: 18, fontWeight: 700 })} />
                {exDuration > 0 && (
                  <div style={{ marginTop: 10, padding: "10px 14px", background: "#FEF3C7", borderRadius: 10, fontSize: 13, color: "#92400E", fontWeight: 600 }}>
                    Estimado: ~{Math.round((EXERCISE_TYPES.find(function(t) { return t.id === exType; }) || { cal_per_min: 6 }).cal_per_min * parseInt(exDuration))} kcal quemadas
                  </div>
                )}
              </div>
            )}
            <label style={Object.assign({}, S.label, { marginTop: 14 })}>Nota (opcional)</label>
            <input value={exNote} onChange={function(e) { setExNote(e.target.value); }}
              placeholder="Ej: Clase de funcional..." style={S.input} />
            <button onClick={addWorkout} style={{ width: "100%", marginTop: 18, background: "#F59E0B", border: "none", borderRadius: 12, padding: "14px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              Guardar ejercicio
            </button>
          </div>
        </div>
      )}

      {/* Reminder */}
      {reminder && (
        <div style={{ background: "#FEF3C7", borderBottom: "2px solid #F59E0B", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#92400E" }}>{reminder}</span>
          <button onClick={function() { setReminder(null); }} style={{ background: "none", border: "none", color: "#92400E", fontSize: 16, cursor: "pointer" }}>x</button>
        </div>
      )}

      {/* Header */}
      <div style={{ background: COLORS.primary, padding: "20px 16px 14px", color: "#fff" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 22 }}>&#x1F957;</span>
                <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Contador de Calorias</h1>
              </div>
              <p style={{ margin: 0, opacity: 0.75, fontSize: 11 }}>Meta: 2,400 kcal - 133g proteina / dia</p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {history.length > 0 && (
                <button onClick={function() { setShowHistory(!showHistory); }} style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.35)", borderRadius: 9, padding: "6px 10px", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Historial</button>
              )}
              {dishes.length > 0 && (
                <button onClick={function() { setShowExport(!showExport); }} style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.35)", borderRadius: 9, padding: "6px 10px", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Exportar</button>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { label: "Ingeridas", val: totalCaloriesIn, color: "#D1FAE5" },
              { label: "Quemadas", val: totalBurned, color: "#FDE68A" },
              { label: "Netas", val: netCalories, color: "#fff" },
            ].map(function(s) {
              return (
                <div key={s.label} style={{ flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "8px 6px", textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 9, opacity: 0.8, marginTop: 2 }}>{s.label}</div>
                </div>
              );
            })}
            <button onClick={function() { setShowExercise(true); }} style={{ flex: 1, background: "#F59E0B", border: "none", borderRadius: 10, padding: "8px 6px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 16 }}>&#x26A1;</span>
              <span style={{ fontSize: 9 }}>Ejercicio</span>
            </button>
          </div>
        </div>
      </div>

      {/* History panel */}
      {showHistory && (
        <div style={{ background: "#1A1A2E", color: "#E5E7EB", padding: "14px 16px", borderBottom: "3px solid #6366F1" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Dias anteriores</span>
              <button onClick={function() { setShowHistory(false); }} style={{ background: "none", border: "none", color: "#6B7280", fontSize: 18, cursor: "pointer" }}>x</button>
            </div>
            {history.map(function(h) {
              return (
                <div key={h.dateKey} onClick={function() { setHistoryDay(h); setShowHistory(false); }}
                  style={{ background: "#0F0F1A", borderRadius: 10, padding: "11px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#D1FAE5" }}>{h.dateKey}</div>
                    <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{h.count} platillos - {h.prot}g prot{h.burned > 0 ? " - " + h.burned + " kcal ej." : ""}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: (h.cal - h.burned) <= dailyGoal ? "#52B788" : "#E63946" }}>{h.cal - h.burned}</div>
                    <div style={{ fontSize: 10, color: "#6B7280" }}>kcal netas</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History detail */}
      {historyDay && (
        <div style={{ background: "#F0FDF4", borderBottom: "2px solid #52B788", padding: "14px 16px" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.primary }}>{historyDay.dateKey}</span>
              <button onClick={function() { setHistoryDay(null); }} style={{ background: "none", border: "none", color: COLORS.muted, fontSize: 16, cursor: "pointer" }}>x</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {[
                { label: "Calorias netas", val: historyDay.cal - historyDay.burned, unit: "kcal", color: (historyDay.cal - historyDay.burned) <= dailyGoal ? COLORS.success : COLORS.danger },
                { label: "Proteina", val: historyDay.prot, unit: "g", color: "#3B82F6" },
                { label: "Quemadas", val: historyDay.burned, unit: "kcal", color: "#F59E0B" },
              ].map(function(m) {
                return (
                  <div key={m.label} style={{ flex: 1, background: "#fff", borderRadius: 10, padding: "9px 6px", textAlign: "center" }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: m.color }}>{m.val} <span style={{ fontSize: 10, fontWeight: 400 }}>{m.unit}</span></div>
                    <div style={{ fontSize: 10, color: COLORS.muted }}>{m.label}</div>
                  </div>
                );
              })}
            </div>
            {historyDay.data.map(function(d) {
              const mt = MEAL_TIMES.find(function(m) { return m.id === d.meal; });
              return (
                <div key={d.id} style={{ background: "#fff", borderRadius: 9, padding: "8px 12px", marginBottom: 5, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span>{mt ? mt.emoji : ""} {d.name}</span>
                  <span style={{ color: COLORS.muted }}>{d.calories} kcal - <span style={{ color: "#3B82F6" }}>{d.protein}g</span></span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Export panel */}
      {showExport && dishes.length > 0 && (
        <div style={{ background: "#1A1A2E", color: "#E5E7EB", padding: "14px 16px", borderBottom: "3px solid #2D6A4F" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Resumen del dia</span>
              <button onClick={function() { setShowExport(false); }} style={{ background: "none", border: "none", color: "#6B7280", fontSize: 18, cursor: "pointer" }}>x</button>
            </div>
            <pre style={{ background: "#0F0F1A", borderRadius: 10, padding: "12px", fontSize: 11, lineHeight: 1.6, overflowX: "auto", whiteSpace: "pre-wrap", color: "#D1FAE5", margin: "0 0 10px", fontFamily: "monospace" }}>
              {buildSummaryText()}
            </pre>
            <button onClick={function() { navigator.clipboard.writeText(buildSummaryText()).then(function() { setCopied(true); setTimeout(function() { setCopied(false); }, 2500); }); }}
              style={{ width: "100%", background: copied ? "#52B788" : "#2D6A4F", color: "#fff", border: "none", borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              {copied ? "Copiado!" : "Copiar al portapapeles"}
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ background: COLORS.surface, borderBottom: "1px solid " + COLORS.border }}>
        <div style={{ maxWidth: 600, margin: "0 auto", display: "flex" }}>
          {[{ id: "registro", label: "Registro" }, { id: "semana", label: "Semana" }, { id: "calculadora", label: "Calcular" }, { id: "proteinas", label: "Proteina" }].map(function(tab) {
            return (
              <button key={tab.id} onClick={function() { setActiveTab(tab.id); }} style={{
                flex: 1, padding: "12px 0", border: "none", background: "none", fontSize: 11, fontWeight: 600,
                color: activeTab === tab.id ? COLORS.primary : COLORS.muted, cursor: "pointer",
                borderBottom: activeTab === tab.id ? "2px solid " + COLORS.primary : "2px solid transparent",
              }}>{tab.label}</button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px" }}>

        {/* REGISTRO */}
        {activeTab === "registro" && (
          <>
            {(dishes.length > 0 || workouts.length > 0) && (
              <div style={Object.assign({}, S.card, { marginBottom: 16 })}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>Calorias netas</span>
                  <span style={{ fontWeight: 700, fontSize: 19, color: progressColor }}>{netCalories.toLocaleString()} <span style={{ fontSize: 11, fontWeight: 400, color: COLORS.muted }}>/ {adjustedGoal} kcal</span></span>
                </div>
                {totalBurned > 0 && (
                  <div style={{ fontSize: 11, color: "#92400E", background: "#FEF3C7", borderRadius: 7, padding: "4px 10px", marginBottom: 8, display: "inline-block" }}>
                    +{totalBurned} kcal de ejercicio sumadas a tu meta
                  </div>
                )}
                <div style={{ height: 8, background: COLORS.border, borderRadius: 6, overflow: "hidden", marginBottom: 4 }}>
                  <div style={{ height: "100%", width: progressPct + "%", background: progressColor, borderRadius: 6, transition: "width 0.4s" }} />
                </div>
                <div style={{ fontSize: 11, color: COLORS.muted, textAlign: "right", marginBottom: 13 }}>
                  {netCalories < adjustedGoal ? "Faltan " + (adjustedGoal - netCalories).toLocaleString() + " kcal" : "Superaste la meta por " + (netCalories - adjustedGoal).toLocaleString() + " kcal"}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>Proteina</span>
                  <span style={{ fontWeight: 700, fontSize: 19, color: proteinColor }}>{totalProtein}g <span style={{ fontSize: 11, fontWeight: 400, color: COLORS.muted }}>/ {proteinGoal}g</span></span>
                </div>
                <div style={{ height: 8, background: COLORS.border, borderRadius: 6, overflow: "hidden", marginBottom: 4 }}>
                  <div style={{ height: "100%", width: proteinPct + "%", background: proteinColor, borderRadius: 6, transition: "width 0.4s" }} />
                </div>
                <div style={{ fontSize: 11, color: COLORS.muted, textAlign: "right", marginBottom: 13 }}>
                  {totalProtein < proteinGoal ? "Faltan " + (proteinGoal - totalProtein) + "g para tu meta muscular" : "Meta de proteina alcanzada!"}
                </div>
                <div style={{ display: "flex", gap: 7, paddingTop: 11, borderTop: "1px solid " + COLORS.border }}>
                  {[{ label: "Carbos", val: totalCarbs, color: "#F59E0B", u: "g" }, { label: "Grasa", val: totalFat, color: "#EF4444", u: "g" }, { label: "Quemadas", val: totalBurned, color: "#F59E0B", u: "kcal" }, { label: "Platillos", val: dishes.length, color: COLORS.primary, u: "" }].map(function(m) {
                    return (
                      <div key={m.label} style={{ flex: 1, textAlign: "center", background: COLORS.bg, borderRadius: 9, padding: "7px 3px" }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: m.color }}>{m.val}{m.u}</div>
                        <div style={{ fontSize: 9, color: COLORS.muted }}>{m.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {workouts.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#92400E", marginBottom: 8 }}>Ejercicio de hoy</div>
                {workouts.map(function(w) {
                  return (
                    <div key={w.id} style={{ background: "#FEF3C7", borderRadius: 11, padding: "10px 13px", marginBottom: 7, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: 16, marginRight: 6 }}>{w.emoji}</span>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{w.note}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 800, color: "#92400E", fontSize: 15 }}>-{w.calories} kcal</span>
                        <button onClick={function() { setWorkouts(function(prev) { return prev.filter(function(x) { return x.id !== w.id; }); }); }} style={{ background: "none", border: "none", color: "#B45309", fontSize: 14, cursor: "pointer" }}>x</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Meal selector */}
            <div style={{ display: "flex", gap: 7, marginBottom: 13, overflowX: "auto", paddingBottom: 2 }}>
              {MEAL_TIMES.map(function(mt) {
                const count = dishesByMeal[mt.id].length;
                const active = selectedMeal === mt.id;
                return (
                  <button key={mt.id} onClick={function() { setSelectedMeal(mt.id); }} style={{
                    flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "8px 12px", borderRadius: 11, border: "2px solid " + (active ? mt.color : COLORS.border),
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
            <div style={Object.assign({}, S.card, { marginBottom: 15 })}>
              {(function() {
                const mt = MEAL_TIMES.find(function(m) { return m.id === selectedMeal; });
                return (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: mt.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {mt.emoji} Agregar a {mt.label}
                    </label>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button onClick={function() { photoInputRef.current && photoInputRef.current.click(); }} title="Subir foto"
                        style={{ background: "#F0FDF4", border: "1.5px solid " + COLORS.primaryLight, borderRadius: 8, padding: "4px 9px", fontSize: 13, cursor: "pointer", color: COLORS.primary, fontWeight: 700 }}>Galeria</button>
                      <button onClick={function() { cameraInputRef.current && cameraInputRef.current.click(); }} title="Tomar foto"
                        style={{ background: "#F0FDF4", border: "1.5px solid " + COLORS.primaryLight, borderRadius: 8, padding: "4px 9px", fontSize: 13, cursor: "pointer", color: COLORS.primary, fontWeight: 700 }}>Camara</button>
                    </div>
                  </div>
                );
              })()}
              <div style={{ display: "flex", gap: 7 }}>
                <input ref={inputRef} value={input} onChange={function(e) { setInput(e.target.value); }}
                  onKeyDown={function(e) { if (e.key === "Enter" && !loading) analyzeDish(); }}
                  placeholder="Describe tu platillo o usa la camara..."
                  style={{ flex: 1, border: "1.5px solid " + COLORS.border, borderRadius: 9, padding: "9px 12px", fontSize: 13, outline: "none", color: COLORS.text, background: COLORS.bg }}
                  onFocus={function(e) { e.target.style.borderColor = COLORS.primaryLight; }}
                  onBlur={function(e) { e.target.style.borderColor = COLORS.border; }}
                />
                <button onClick={analyzeDish} disabled={loading || !input.trim()} style={{
                  background: loading || !input.trim() ? COLORS.border : COLORS.primary,
                  color: loading || !input.trim() ? COLORS.muted : "#fff",
                  border: "none", borderRadius: 9, padding: "9px 13px", fontSize: 13, fontWeight: 600,
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer", whiteSpace: "nowrap",
                }}>{loading ? "..." : "Analizar"}</button>
              </div>
              {error && <p style={{ margin: "7px 0 0", fontSize: 12, color: COLORS.danger }}>{error}</p>}
            </div>

            {/* Dishes by meal */}
            {MEAL_TIMES.map(function(mt) {
              const mealDishes = dishesByMeal[mt.id];
              if (mealDishes.length === 0) return null;
              const mealCal = mealDishes.reduce(function(s, d) { return s + d.calories; }, 0);
              const mealProt = mealDishes.reduce(function(s, d) { return s + d.protein; }, 0);
              return (
                <div key={mt.id} style={{ marginBottom: 17 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontSize: 14 }}>{mt.emoji}</span>
                      <span style={{ fontWeight: 700, fontSize: 13, color: mt.color }}>{mt.label}</span>
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.muted }}>
                      <span style={{ fontWeight: 600, color: mt.color }}>{mealCal} kcal</span> - <span>{mealProt}g prot</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {mealDishes.map(function(dish) {
                      const level = getCalorieLevel(dish.calories);
                      return (
                        <div key={dish.id} style={{ background: COLORS.surface, borderRadius: 12, padding: "11px 13px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderLeft: "4px solid " + level.color }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 9 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, display: "flex", alignItems: "center", gap: 5 }}>
                                {dish.name}
                                {dish.fromPhoto && <span style={{ fontSize: 9, background: COLORS.primaryLight, color: "#fff", borderRadius: 6, padding: "2px 5px", fontWeight: 700 }}>foto</span>}
                              </div>
                              <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 6 }}>Porcion: {dish.portion}</div>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {[{ label: "Prot", val: dish.protein, color: "#3B82F6" }, { label: "Carbos", val: dish.carbs, color: "#F59E0B" }, { label: "Grasa", val: dish.fat, color: "#EF4444" }].map(function(m) {
                                  return (
                                    <span key={m.label} style={{ fontSize: 10, background: COLORS.bg, borderRadius: 5, padding: "2px 7px", color: COLORS.muted }}>
                                      <span style={{ color: m.color, fontWeight: 700 }}>{m.val}g</span> {m.label}
                                    </span>
                                  );
                                })}
                              </div>
                              {dish.tip && <p style={{ margin: "6px 0 0", fontSize: 10, color: COLORS.muted, fontStyle: "italic" }}>{dish.tip}</p>}
                              {dish.fromPhoto && dish.ingredients && (
                                <p style={{ margin: "4px 0 0", fontSize: 10, color: COLORS.muted }}>
                                  {dish.ingredients.slice(0, 4).join(", ")}{dish.ingredients.length > 4 ? "..." : ""}
                                </p>
                              )}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 18, fontWeight: 800, color: level.color, lineHeight: 1 }}>{dish.calories}</div>
                                <div style={{ fontSize: 9, color: COLORS.muted }}>kcal</div>
                              </div>
                              <button onClick={function() { setDishes(function(prev) { return prev.filter(function(d) { return d.id !== dish.id; }); }); }} style={{ background: "none", border: "1px solid " + COLORS.border, borderRadius: 5, padding: "2px 7px", fontSize: 10, color: COLORS.muted, cursor: "pointer" }}>x</button>
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
                <div style={{ fontSize: 42, marginBottom: 10 }}>&#x1F37D;&#xFE0F;</div>
                <p style={{ margin: 0, fontSize: 13 }}>Selecciona una comida y empieza a registrar</p>
              </div>
            )}

            {(dishes.length > 0 || workouts.length > 0) && (
              <button onClick={function() { setDishes([]); setWorkouts([]); }} style={{ display: "block", margin: "14px auto 0", background: "none", border: "1.5px solid " + COLORS.border, borderRadius: 10, padding: "8px 20px", fontSize: 12, color: COLORS.muted, cursor: "pointer" }}>
                Limpiar dia actual
              </button>
            )}
          </>
        )}

        {/* SEMANA */}
        {activeTab === "semana" && (
          <>
            <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>Ultimos 7 dias</h2>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: COLORS.muted }}>Barras amarillas = calorias quemadas por ejercicio</p>
            <div style={Object.assign({}, S.card, { marginBottom: 16 })}>
              <WeeklyChart data={weeklyData} dailyGoal={dailyGoal} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {[...weeklyData].reverse().map(function(d) {
                const isToday = d.key === getTodayKey();
                const net = d.net - d.burned;
                return (
                  <div key={d.key} style={{ background: COLORS.surface, borderRadius: 13, padding: "12px 15px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderLeft: "4px solid " + (d.net === 0 ? COLORS.border : net <= dailyGoal ? COLORS.success : COLORS.danger) }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                          {formatDateShort(d.key)}
                          {isToday && <span style={{ fontSize: 9, background: COLORS.primary, color: "#fff", borderRadius: 8, padding: "2px 7px" }}>HOY</span>}
                        </div>
                        <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
                          {d.protein > 0 ? d.protein + "g proteina" : "Sin registro"}
                          {d.burned > 0 && <span style={{ color: "#F59E0B", marginLeft: 6 }}>- " + d.burned + " kcal ej.</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {d.net > 0 ? (
                          <div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: net <= dailyGoal ? COLORS.success : COLORS.danger, lineHeight: 1 }}>{d.net}</div>
                            <div style={{ fontSize: 9, color: COLORS.muted }}>kcal</div>
                          </div>
                        ) : (
                          <div style={{ fontSize: 12, color: COLORS.border }}>-</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {weeklyData.some(function(d) { return d.net > 0; }) && (function() {
              const activeDays = weeklyData.filter(function(d) { return d.net > 0; });
              const avgCal = Math.round(activeDays.reduce(function(s, d) { return s + d.net; }, 0) / activeDays.length);
              const avgProt = Math.round(activeDays.reduce(function(s, d) { return s + d.protein; }, 0) / activeDays.length);
              const avgBurned = Math.round(weeklyData.reduce(function(s, d) { return s + d.burned; }, 0) / 7);
              return (
                <div style={{ background: "#EFF6FF", borderRadius: 13, padding: "14px 16px", marginTop: 14, borderLeft: "4px solid #3B82F6" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#1D4ED8", marginBottom: 10 }}>Promedio semanal ({activeDays.length} dias)</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {[
                      { label: "Calorias/dia", val: avgCal, color: "#1D4ED8" },
                      { label: "Proteina/dia", val: avgProt + "g", color: "#3B82F6" },
                      { label: "Quemadas/dia", val: avgBurned + " kcal", color: "#F59E0B" },
                    ].map(function(m) {
                      return (
                        <div key={m.label} style={{ flex: 1, textAlign: "center" }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: m.color }}>{m.val}</div>
                          <div style={{ fontSize: 10, color: "#3B82F6" }}>{m.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </>
        )}

        {/* CALCULADORA */}
        {activeTab === "calculadora" && (
          <>
            <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>Calculadora de calorias</h2>
            <p style={{ margin: "0 0 14px", fontSize: 12, color: COLORS.muted }}>Ingresa el alimento y la cantidad exacta para conocer sus macros</p>
            <div style={{ display: "flex", background: COLORS.surface, borderRadius: 12, padding: 4, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              {[{ id: "ia", label: "Buscar con IA" }, { id: "lista", label: "Lista de alimentos" }].map(function(m) {
                return (
                  <button key={m.id} onClick={function() { setCalcMode(m.id); setCalcResult(null); setCalcError(""); }} style={S.btn(calcMode === m.id)}>{m.label}</button>
                );
              })}
            </div>

            {calcMode === "ia" && (
              <div style={S.card}>
                <label style={S.label}>Alimento</label>
                <input value={calcFood} onChange={function(e) { setCalcFood(e.target.value); }}
                  onKeyDown={function(e) { if (e.key === "Enter" && !calcLoading) calcWithAI(); }}
                  placeholder="Ej: pechuga de pollo, mango, tortilla de harina..."
                  style={Object.assign({}, S.input, { marginBottom: 12 })}
                  onFocus={function(e) { e.target.style.borderColor = COLORS.primaryLight; }}
                  onBlur={function(e) { e.target.style.borderColor = COLORS.border; }}
                />
                <label style={S.label}>Cantidad</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="number" value={calcAmount} onChange={function(e) { setCalcAmount(e.target.value); }}
                    placeholder="Ej: 150"
                    style={{ flex: 1, border: "1.5px solid " + COLORS.border, borderRadius: 10, padding: "10px 13px", fontSize: 16, fontWeight: 700, outline: "none", color: COLORS.text, background: COLORS.bg }}
                    onFocus={function(e) { e.target.style.borderColor = COLORS.primaryLight; }}
                    onBlur={function(e) { e.target.style.borderColor = COLORS.border; }}
                  />
                  <div style={{ display: "flex", background: COLORS.bg, borderRadius: 10, border: "1.5px solid " + COLORS.border, overflow: "hidden" }}>
                    {["g", "ml"].map(function(u) {
                      return (
                        <button key={u} onClick={function() { setCalcUnit(u); }} style={{ padding: "10px 16px", border: "none", fontSize: 14, fontWeight: 700, background: calcUnit === u ? COLORS.primary : "none", color: calcUnit === u ? "#fff" : COLORS.muted, cursor: "pointer" }}>{u}</button>
                      );
                    })}
                  </div>
                </div>
                {calcError && <p style={{ margin: "8px 0 0", fontSize: 12, color: COLORS.danger }}>{calcError}</p>}
                <button onClick={calcWithAI} disabled={calcLoading || !calcFood.trim() || !calcAmount} style={{
                  width: "100%", marginTop: 14, background: calcLoading || !calcFood.trim() || !calcAmount ? COLORS.border : COLORS.primary,
                  color: calcLoading || !calcFood.trim() || !calcAmount ? COLORS.muted : "#fff",
                  border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700,
                  cursor: calcLoading || !calcFood.trim() || !calcAmount ? "not-allowed" : "pointer",
                }}>{calcLoading ? "Calculando..." : "Calcular calorias"}</button>
              </div>
            )}

            {calcMode === "lista" && (
              <div style={S.card}>
                <input value={calcSearch} onChange={function(e) { setCalcSearch(e.target.value); setCalcSelected(null); setCalcResult(null); }}
                  placeholder="Buscar alimento..."
                  style={Object.assign({}, S.input, { marginBottom: 10 })}
                  onFocus={function(e) { e.target.style.borderColor = COLORS.primaryLight; }}
                  onBlur={function(e) { e.target.style.borderColor = COLORS.border; }}
                />
                {!calcSelected && (
                  <div style={{ maxHeight: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                    {filteredFoods.map(function(food) {
                      return (
                        <div key={food.name} onClick={function() { setCalcSelected(food); setCalcAmount(""); setCalcResult(null); }}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, cursor: "pointer", background: COLORS.bg }}>
                          <span style={{ fontSize: 22 }}>{food.emoji}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{food.name}</div>
                            <div style={{ fontSize: 10, color: COLORS.muted }}>{food.cal} kcal - {food.protein}g prot - por 100{food.unit}</div>
                          </div>
                          <span style={{ fontSize: 18, color: COLORS.muted }}>{">"}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                {calcSelected && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "10px 12px", background: COLORS.bg, borderRadius: 10 }}>
                      <span style={{ fontSize: 24 }}>{calcSelected.emoji}</span>
                      <div>
                        <div st
