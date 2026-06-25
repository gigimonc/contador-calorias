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
  { id: "yoga", label: "Yoga Pilates", emoji: "\uD83E\uDDD8", cal_per_min: 4 },
  { id: "hiit", label: "HIIT", emoji: "\u26A1", cal_per_min: 13 },
  { id: "otro", label: "Otro", emoji: "\uD83C\uDFC5", cal_per_min: 6 },
];

const HIGH_PROTEIN_FOODS = [
  { name: "Pechuga de pollo", emoji: "\uD83C\uDF57", protein: 31, cal: 165, fat: 3.6, carbs: 0, per: "100g" },
  { name: "Atun en agua", emoji: "\uD83D\uDC1F", protein: 30, cal: 132, fat: 1, carbs: 0, per: "100g" },
  { name: "Huevo entero", emoji: "\uD83E\uDD5A", protein: 6, cal: 78, fat: 5, carbs: 0.6, per: "1 pieza" },
  { name: "Claras de huevo", emoji: "\uD83C\uDF73", protein: 11, cal: 52, fat: 0.2, carbs: 0.7, per: "3 claras" },
  { name: "Yogur griego", emoji: "\uD83E\uDD5B", protein: 17, cal: 100, fat: 0.7, carbs: 6, per: "1 taza" },
  { name: "Salmon", emoji: "\uD83D\uDC20", protein: 25, cal: 208, fat: 13, carbs: 0, per: "100g" },
  { name: "Queso cottage", emoji: "\uD83E\uDDC0", protein: 14, cal: 110, fat: 5, carbs: 3, per: "1/2 taza" },
  { name: "Pavo molido", emoji: "\uD83E\uDD83", protein: 29, cal: 189, fat: 10, carbs: 0, per: "100g" },
  { name: "Camaron", emoji: "\uD83E\uDD90", protein: 24, cal: 99, fat: 1.7, carbs: 0.9, per: "100g" },
  { name: "Sardinas en agua", emoji: "\uD83D\uDC1F", protein: 25, cal: 150, fat: 6, carbs: 0, per: "100g" },
  { name: "Carne molida 90pct", emoji: "\uD83E\uDD69", protein: 20, cal: 176, fat: 10, carbs: 0, per: "100g" },
  { name: "Queso panela", emoji: "\uD83E\uDDC0", protein: 19, cal: 291, fat: 22, carbs: 3, per: "100g" },
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
  return CALORIE_COLORS.find(function(c) { return cal <= c.max; }) || CALORIE_COLORS[3];
}
function getTodayKey() { return new Date().toISOString().slice(0, 10); }
function getToday() {
  return new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}
function getLast7Days() {
  var days = [];
  for (var i = 6; i >= 0; i--) {
    var d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}
function formatDateShort(key) {
  var d = new Date(key + "T12:00:00");
  return d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric" });
}

function WeeklyChart({ data, dailyGoal }) {
  var maxVal = Math.max.apply(null, data.map(function(d) { return Math.max(d.net, d.burned, 10); }).concat([dailyGoal]));
  var barW = 32;
  var chartH = 140;
  var pad = 10;
  var goalY = pad + chartH - (dailyGoal / maxVal) * chartH;
  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={data.length * (barW + 12) + pad * 2} height={chartH + 50} style={{ display: "block" }}>
        <line x1={pad} x2={data.length * (barW + 12) + pad} y1={goalY} y2={goalY} stroke="#E63946" strokeDasharray="4,3" strokeWidth={1.5} />
        <text x={pad + 2} y={goalY - 4} fontSize={9} fill="#E63946">meta</text>
        {data.map(function(d, i) {
          var x = pad + i * (barW + 12);
          var netH = Math.max((d.net / maxVal) * chartH, 2);
          var burnH = Math.max((d.burned / maxVal) * chartH, d.burned > 0 ? 2 : 0);
          var netColor = d.net === 0 ? "#E5E7EB" : d.net <= dailyGoal ? "#52B788" : "#E63946";
          var isToday = d.key === getTodayKey();
          return (
            <g key={d.key}>
              <rect x={x} y={pad + chartH - netH} width={barW} height={netH} fill={netColor} rx={4} opacity={isToday ? 1 : 0.75} />
              {burnH > 0 && <rect x={x} y={pad + chartH - netH - burnH} width={barW} height={burnH} fill="#F59E0B" rx={4} opacity={0.85} />}
              {isToday && <rect x={x} y={pad + chartH + 4} width={barW} height={3} fill="#2D6A4F" rx={2} />}
              <text x={x + barW / 2} y={pad + chartH + 18} textAnchor="middle" fontSize={9} fill="#6B7280">{formatDateShort(d.key)}</text>
              {d.net > 0 && <text x={x + barW / 2} y={pad + chartH - netH - burnH - 4} textAnchor="middle" fontSize={8} fill="#1A1A2E">{d.net}</text>}
            </g>
          );
        })}
      </svg>
      <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 11, color: "#6B7280" }}>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#52B788", borderRadius: 2, marginRight: 4 }} />Calorias ingeridas</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#F59E0B", borderRadius: 2, marginRight: 4 }} />Calorias quemadas</span>
      </div>
    </div>
  );
}

export default function ContadorCalorias() {
  var _useState0 = useState([]); var dishes = _useState0[0]; var setDishes = _useState0[1];
  var _useState1 = useState([]); var workouts = _useState1[0]; var setWorkouts = _useState1[1];
  var _useState2 = useState(""); var input = _useState2[0]; var setInput = _useState2[1];
  var _useState3 = useState(false); var loading = _useState3[0]; var setLoading = _useState3[1];
  var _useState4 = useState(""); var error = _useState4[0]; var setError = _useState4[1];
  var _useState5 = useState("desayuno"); var selectedMeal = _useState5[0]; var setSelectedMeal = _useState5[1];
  var _useState6 = useState("registro"); var activeTab = _useState6[0]; var setActiveTab = _useState6[1];
  var _useState7 = useState(false); var showExport = _useState7[0]; var setShowExport = _useState7[1];
  var _useState8 = useState(false); var copied = _useState8[0]; var setCopied = _useState8[1];
  var _useState9 = useState(null); var historyDay = _useState9[0]; var setHistoryDay = _useState9[1];
  var _useState10 = useState(false); var showHistory = _useState10[0]; var setShowHistory = _useState10[1];
  var _useState11 = useState(false); var showExercise = _useState11[0]; var setShowExercise = _useState11[1];
  var _useState12 = useState("manual"); var exMode = _useState12[0]; var setExMode = _useState12[1];
  var _useState13 = useState(""); var exManualCal = _useState13[0]; var setExManualCal = _useState13[1];
  var _useState14 = useState("funcional"); var exType = _useState14[0]; var setExType = _useState14[1];
  var _useState15 = useState(""); var exDuration = _useState15[0]; var setExDuration = _useState15[1];
  var _useState16 = useState(""); var exNote = _useState16[0]; var setExNote = _useState16[1];
  var _useState17 = useState(null); var reminder = _useState17[0]; var setReminder = _useState17[1];
  var _useState18 = useState("ia"); var calcMode = _useState18[0]; var setCalcMode = _useState18[1];
  var _useState19 = useState(""); var calcFood = _useState19[0]; var setCalcFood = _useState19[1];
  var _useState20 = useState(""); var calcAmount = _useState20[0]; var setCalcAmount = _useState20[1];
  var _useState21 = useState("g"); var calcUnit = _useState21[0]; var setCalcUnit = _useState21[1];
  var _useState22 = useState(null); var calcResult = _useState22[0]; var setCalcResult = _useState22[1];
  var _useState23 = useState(false); var calcLoading = _useState23[0]; var setCalcLoading = _useState23[1];
  var _useState24 = useState(""); var calcError = _useState24[0]; var setCalcError = _useState24[1];
  var _useState25 = useState(""); var calcSearch = _useState25[0]; var setCalcSearch = _useState25[1];
  var _useState26 = useState(null); var calcSelected = _useState26[0]; var setCalcSelected = _useState26[1];
  var dailyGoal = 1800;
  var proteinGoal = 130;
  var fatGoal = 80;
  var carbGoal = 45;
  var inputRef = useRef(null);
  var photoInputRef = useRef(null);
  var cameraInputRef = useRef(null);
  var _usStateP1 = useState(false); var showPhotoModal = _usStateP1[0]; var setShowPhotoModal = _usStateP1[1];
  var _usStateP2 = useState(false); var photoLoading = _usStateP2[0]; var setPhotoLoading = _usStateP2[1];
  var _usStateP3 = useState(null); var photoPreview = _usStateP3[0]; var setPhotoPreview = _usStateP3[1];
  var _usStateP4 = useState(""); var photoError = _usStateP4[0]; var setPhotoError = _usStateP4[1];

  useEffect(function() {
    var key = getTodayKey();
    try {
      var saved = localStorage.getItem("calorias_" + key);
      if (saved) setDishes(JSON.parse(saved));
      var savedW = localStorage.getItem("workouts_" + key);
      if (savedW) setWorkouts(JSON.parse(savedW));
    } catch(e) {}
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
      var now = new Date();
      var hour = now.getHours();
      if (hour < 7 || hour > 21) { setReminder(null); return; }
      var lastEntry = parseInt(localStorage.getItem("lastEntry_" + getTodayKey()) || "0");
      var diffMin = lastEntry > 0 ? (Date.now() - lastEntry) / 60000 : null;
      if (diffMin !== null && diffMin > 150) {
        setReminder("Llevas mas de " + Math.floor(diffMin / 60) + "h sin registrar");
      } else if (diffMin === null && dishes.length === 0 && hour >= 9) {
        setReminder("No has registrado nada hoy. Empezamos?");
      } else {
        setReminder(null);
      }
    }
    checkReminder();
    var interval = setInterval(checkReminder, 5 * 60 * 1000);
    return function() { clearInterval(interval); };
  }, [dishes]);

  var totalCaloriesIn = dishes.reduce(function(s, d) { return s + (d.calories || 0); }, 0);
  var totalBurned = workouts.reduce(function(s, w) { return s + (w.calories || 0); }, 0);
  var netCalories = totalCaloriesIn - totalBurned;
  var adjustedGoal = dailyGoal + totalBurned;
  var totalProtein = dishes.reduce(function(s, d) { return s + (d.protein || 0); }, 0);
  var totalCarbs = dishes.reduce(function(s, d) { return s + (d.carbs || 0); }, 0);
  var totalFat = dishes.reduce(function(s, d) { return s + (d.fat || 0); }, 0);
  var proteinPct = Math.min((totalProtein / proteinGoal) * 100, 100);
  var proteinColor = totalProtein < proteinGoal * 0.5 ? "#EF4444" : totalProtein < proteinGoal ? "#F59E0B" : "#3B82F6";
  var fatPct = Math.min((totalFat / fatGoal) * 100, 100);
  var fatColor = totalFat > fatGoal ? "#E63946" : totalFat > fatGoal * 0.8 ? "#F59E0B" : "#52B788";
  var carbPct = Math.min((totalCarbs / carbGoal) * 100, 100);
  var carbColor = totalCarbs > carbGoal ? "#E63946" : totalCarbs > carbGoal * 0.8 ? "#F59E0B" : "#52B788";
  var progressPct = Math.min((netCalories / adjustedGoal) * 100, 100);
  var progressColor = netCalories < adjustedGoal * 0.6 ? "#52B788" : netCalories < adjustedGoal ? "#F4A261" : "#E63946";

  var dishesByMeal = MEAL_TIMES.reduce(function(acc, mt) {
    acc[mt.id] = dishes.filter(function(d) { return d.meal === mt.id; });
    return acc;
  }, {});

  var weeklyData = getLast7Days().map(function(key) {
    try {
      var d = JSON.parse(localStorage.getItem("calorias_" + key) || "[]");
      var w = JSON.parse(localStorage.getItem("workouts_" + key) || "[]");
      return {
        key: key,
        net: d.reduce(function(s, x) { return s + (x.calories || 0); }, 0),
        burned: w.reduce(function(s, x) { return s + (x.calories || 0); }, 0),
        protein: d.reduce(function(s, x) { return s + (x.protein || 0); }, 0),
      };
    } catch(e) { return { key: key, net: 0, burned: 0, protein: 0 }; }
  });

  function getHistory() {
    var today = getTodayKey();
    var days = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.startsWith("calorias_")) {
        var dateKey = k.replace("calorias_", "");
        if (dateKey !== today) {
          try {
            var data = JSON.parse(localStorage.getItem(k));
            if (data && data.length > 0) {
              var w = JSON.parse(localStorage.getItem("workouts_" + dateKey) || "[]");
              days.push({
                dateKey: dateKey, data: data,
                cal: data.reduce(function(s, d) { return s + (d.calories || 0); }, 0),
                prot: data.reduce(function(s, d) { return s + (d.protein || 0); }, 0),
                burned: w.reduce(function(s, x) { return s + (x.calories || 0); }, 0),
                count: data.length,
              });
            }
          } catch(e2) {}
        }
      }
    }
    return days.sort(function(a, b) { return b.dateKey.localeCompare(a.dateKey); });
  }


  function analyzePhoto(file) {
    if (!file) return;
    setPhotoLoading(true); setPhotoError("");
    var reader = new FileReader();
    reader.onload = function(e) {
      var base64 = e.target.result.split(",")[1];
      var mediaType = file.type || "image/jpeg";
      setPhotoPreview(e.target.result);
      fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 1000,
          system: "Eres nutricionista. Analiza la imagen. Responde SOLO JSON sin markdown: {name:platillo,calories:numero,protein:numero,carbs:numero,fat:numero,portion:porcion,ingredients:[ing],tip:consejo}. Si no hay comida: {error:No identifico alimentos}",
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: "Analiza este platillo" }
          ]}],
        }),
      }).then(function(r) { return r.json(); }).then(function(data) {
        var raw = data.content.filter(function(b) { return b.type === "text"; }).map(function(b) { return b.text; }).join("");
        var parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
        if (parsed.error) { setPhotoError(parsed.error); }
        else {
          setDishes(function(prev) {
            return prev.concat([Object.assign({}, parsed, { id: Date.now(), meal: selectedMeal, fromPhoto: true, tip: parsed.tip || "" })]);
          });
          setShowPhotoModal(false); setPhotoPreview(null);
        }
      }).catch(function() { setPhotoError("Error al analizar. Intenta de nuevo."); })
        .finally(function() { setPhotoLoading(false); });
    };
    reader.readAsDataURL(file);
  }

  function analyzeDish() {
    var trimmed = input.trim();
    if (!trimmed) return;
    setLoading(true); setError("");
    fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6", max_tokens: 1000,
        system: "Eres nutricionista. Responde SOLO JSON sin markdown: {\"name\":\"nombre\",\"calories\":numero,\"protein\":numero,\"carbs\":numero,\"fat\":numero,\"portion\":\"porcion\",\"tip\":\"consejo\"}. Si no reconoces: {\"error\":\"No reconozco\"}",
        messages: [{ role: "user", content: trimmed }],
      }),
    }).then(function(r) { return r.json(); }).then(function(data) {
      var raw = data.content.filter(function(b) { return b.type === "text"; }).map(function(b) { return b.text; }).join("");
      var parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      if (parsed.error) setError(parsed.error);
      else {
        setDishes(function(prev) { return prev.concat([Object.assign({}, parsed, { id: Date.now(), meal: selectedMeal })]); });
        setInput("");
        if (inputRef.current) inputRef.current.focus();
      }
    }).catch(function() { setError("Error al analizar. Intenta de nuevo."); })
      .finally(function() { setLoading(false); });
  }

  function calcWithAI() {
    if (!calcFood.trim() || !calcAmount || parseFloat(calcAmount) <= 0) return;
    setCalcLoading(true); setCalcError(""); setCalcResult(null);
    fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6", max_tokens: 500,
        system: "Eres nutricionista. Calcula macros para la cantidad dada. Responde SOLO JSON sin markdown: {\"name\":\"nombre\",\"amount\":numero,\"unit\":\"g o ml\",\"calories\":numero,\"protein\":numero,\"carbs\":numero,\"fat\":numero,\"per100\":numero}. Si no reconoces: {\"error\":\"No reconozco\"}",
        messages: [{ role: "user", content: "Alimento: " + calcFood.trim() + ", Cantidad: " + calcAmount + " " + calcUnit }],
      }),
    }).then(function(r) { return r.json(); }).then(function(data) {
      var raw = data.content.filter(function(b) { return b.type === "text"; }).map(function(b) { return b.text; }).join("");
      var parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      if (parsed.error) setCalcError(parsed.error);
      else setCalcResult(parsed);
    }).catch(function() { setCalcError("Error al calcular."); })
      .finally(function() { setCalcLoading(false); });
  }

  function calcFromList(food, amount) {
    if (!amount || parseFloat(amount) <= 0) return;
    var factor = parseFloat(amount) / 100;
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
      return prev.concat([{
        id: Date.now(), meal: selectedMeal,
        name: calcResult.name + " (" + calcResult.amount + calcResult.unit + ")",
        calories: calcResult.calories, protein: calcResult.protein,
        carbs: calcResult.carbs, fat: calcResult.fat,
        portion: calcResult.amount + calcResult.unit, tip: "",
      }]);
    });
    setCalcResult(null); setCalcFood(""); setCalcAmount(""); setCalcSelected(null); setCalcSearch("");
    setActiveTab("registro");
  }

  function addWorkout() {
    var cal = 0;
    if (exMode === "manual") {
      cal = parseInt(exManualCal);
      if (!cal || cal <= 0) return;
    } else {
      var type = EXERCISE_TYPES.find(function(e) { return e.id === exType; });
      var mins = parseInt(exDuration);
      if (!mins || mins <= 0) return;
      cal = Math.round(type.cal_per_min * mins);
    }
    var exTypeObj = EXERCISE_TYPES.find(function(e) { return e.id === exType; });
    setWorkouts(function(prev) {
      return prev.concat([{
        id: Date.now(), calories: cal,
        note: exNote || exTypeObj.label + (exMode === "calcular" ? " " + exDuration + " min" : ""),
        emoji: exTypeObj.emoji,
      }]);
    });
    setExManualCal(""); setExDuration(""); setExNote(""); setShowExercise(false);
  }

  function buildSummaryText() {
    var lines = ["RESUMEN DEL DIA", getToday(), "---"];
    lines.push("Calorias: " + totalCaloriesIn + (totalBurned > 0 ? " | Quemadas: -" + totalBurned + " | Netas: " + netCalories : "") + " / " + adjustedGoal + " kcal");
    lines.push("Proteina: " + totalProtein + "/" + proteinGoal + "g | Carbos: " + totalCarbs + "/" + carbGoal + "g | Grasa: " + totalFat + "/" + fatGoal + "g");
    lines.push("---");
    MEAL_TIMES.forEach(function(mt) {
      var mds = dishesByMeal[mt.id];
      if (!mds || mds.length === 0) return;
      lines.push(mt.label + ": " + mds.reduce(function(s,d){return s+d.calories;},0) + "kcal");
      mds.forEach(function(d) { lines.push("  - " + d.name + " " + d.calories + "kcal"); });
    });
    return lines.join("\n");
  }

  var filteredFoods = COMMON_FOODS.filter(function(f) {
    return calcSearch.trim() === "" || f.name.toLowerCase().includes(calcSearch.toLowerCase());
  });

  var history = getHistory();

  var C = COLORS;
  var borderBase = "1.5px solid " + C.border;
  var cardStyle = { background: C.surface, borderRadius: 14, padding: "15px", marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" };
  var inputStyle = { width: "100%", border: borderBase, borderRadius: 10, padding: "10px 13px", fontSize: 14, outline: "none", color: C.text, background: C.bg, boxSizing: "border-box" };
  var labelStyle = { display: "block", fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: "uppercase" };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Segoe UI',system-ui,sans-serif", color: C.text }}>
      <input ref={photoInputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={function(e) { if (e.target.files[0]) { setShowPhotoModal(true); analyzePhoto(e.target.files[0]); e.target.value = ""; } }} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
        onChange={function(e) { if (e.target.files[0]) { setShowPhotoModal(true); analyzePhoto(e.target.files[0]); e.target.value = ""; } }} />

      {showPhotoModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "24px 20px", width: "100%", maxWidth: 440, textAlign: "center" }}>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Analizando platillo...</div>
            {photoPreview && <img src={photoPreview} alt="platillo" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 12, marginBottom: 14 }} />}
            {photoLoading && <p style={{ color: "#6B7280", fontSize: 13 }}>Identificando ingredientes y estimando calorias...</p>}
            {photoError && (
              <div>
                <p style={{ color: "#E63946", fontSize: 13, marginBottom: 10 }}>{photoError}</p>
                <button onClick={function() { setShowPhotoModal(false); setPhotoPreview(null); setPhotoError(""); }}
                  style={{ background: "#E5E7EB", border: "none", borderRadius: 10, padding: "9px 20px", cursor: "pointer" }}>Cerrar</button>
              </div>
            )}
            {!photoLoading && !photoError && <p style={{ color: "#52B788", fontWeight: 700 }}>Platillo agregado al registro!</p>}
          </div>
        </div>
      )}

      {showExercise && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: C.surface, borderRadius: "20px 20px 0 0", padding: "22px 18px", width: "100%", maxWidth: 600, maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>Registrar ejercicio</span>
              <button onClick={function() { setShowExercise(false); }} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>x</button>
            </div>
            <div style={{ display: "flex", background: C.bg, borderRadius: 10, padding: 3, marginBottom: 16 }}>
              {[{ id: "manual", label: "Desde mi reloj" }, { id: "calcular", label: "Calcular" }].map(function(m) {
                return (
                  <button key={m.id} onClick={function() { setExMode(m.id); }} style={{ flex: 1, padding: "9px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, background: exMode === m.id ? C.primary : "none", color: exMode === m.id ? "#fff" : C.muted, cursor: "pointer" }}>
                    {m.label}
                  </button>
                );
              })}
            </div>
            {exMode === "manual" ? (
              <div>
                <label style={labelStyle}>Calorias quemadas</label>
                <input type="number" value={exManualCal} onChange={function(e) { setExManualCal(e.target.value); }}
                  placeholder="Ej: 320" style={Object.assign({}, inputStyle, { fontSize: 18, fontWeight: 700 })} />
              </div>
            ) : (
              <div>
                <label style={labelStyle}>Tipo de ejercicio</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
                  {EXERCISE_TYPES.map(function(t) {
                    return (
                      <button key={t.id} onClick={function() { setExType(t.id); }} style={{ padding: "6px 11px", borderRadius: 20, border: "1.5px solid " + (exType === t.id ? "#F59E0B" : C.border), background: exType === t.id ? "#FEF3C7" : C.surface, fontSize: 12, fontWeight: 600, color: exType === t.id ? "#92400E" : C.muted, cursor: "pointer" }}>
                        {t.emoji} {t.label}
                      </button>
                    );
                  })}
                </div>
                <label style={labelStyle}>Duracion (minutos)</label>
                <input type="number" value={exDuration} onChange={function(e) { setExDuration(e.target.value); }}
                  placeholder="Ej: 45" style={Object.assign({}, inputStyle, { fontSize: 18, fontWeight: 700 })} />
                {exDuration > 0 && (
                  <div style={{ marginTop: 8, padding: "9px 12px", background: "#FEF3C7", borderRadius: 9, fontSize: 13, color: "#92400E", fontWeight: 600 }}>
                    Estimado: ~{Math.round((EXERCISE_TYPES.find(function(t) { return t.id === exType; }) || { cal_per_min: 6 }).cal_per_min * parseInt(exDuration))} kcal
                  </div>
                )}
              </div>
            )}
            <label style={Object.assign({}, labelStyle, { marginTop: 12 })}>Nota (opcional)</label>
            <input value={exNote} onChange={function(e) { setExNote(e.target.value); }} placeholder="Ej: Clase funcional..." style={inputStyle} />
            <button onClick={addWorkout} style={{ width: "100%", marginTop: 16, background: "#F59E0B", border: "none", borderRadius: 12, padding: "13px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              Guardar ejercicio
            </button>
          </div>
        </div>
      )}

      {reminder && (
        <div style={{ background: "#FEF3C7", borderBottom: "2px solid #F59E0B", padding: "9px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#92400E" }}>{reminder}</span>
          <button onClick={function() { setReminder(null); }} style={{ background: "none", border: "none", color: "#92400E", cursor: "pointer" }}>x</button>
        </div>
      )}

      <div style={{ background: C.primary, padding: "18px 14px 12px", color: "#fff" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 11 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                <span style={{ fontSize: 20 }}>&#x1F957;</span>
                <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Contador de Calorias</h1>
              </div>
              <p style={{ margin: 0, opacity: 0.75, fontSize: 11 }}>Meta: 2,400 kcal - 133g proteina / dia</p>
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              {history.length > 0 && (
                <button onClick={function() { setShowHistory(!showHistory); }} style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.35)", borderRadius: 8, padding: "5px 9px", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Historial</button>
              )}
              {dishes.length > 0 && (
                <button onClick={function() { setShowExport(!showExport); }} style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.35)", borderRadius: 8, padding: "5px 9px", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Exportar</button>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            {[
              { label: "Ingeridas", val: totalCaloriesIn, color: "#D1FAE5" },
              { label: "Quemadas", val: totalBurned, color: "#FDE68A" },
              { label: "Netas", val: netCalories, color: "#fff" },
            ].map(function(s) {
              return (
                <div key={s.label} style={{ flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 9, padding: "7px 5px", textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 9, opacity: 0.8, marginTop: 2 }}>{s.label}</div>
                </div>
              );
            })}
            <button onClick={function() { setShowExercise(true); }} style={{ flex: 1, background: "#F59E0B", border: "none", borderRadius: 9, padding: "7px 5px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 14 }}>&#x26A1;</span>
              <span style={{ fontSize: 9 }}>Ejercicio</span>
            </button>
          </div>
        </div>
      </div>

      {showHistory && (
        <div style={{ background: "#1A1A2E", color: "#E5E7EB", padding: "12px 14px", borderBottom: "3px solid #6366F1" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>Dias anteriores</span>
              <button onClick={function() { setShowHistory(false); }} style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer" }}>x</button>
            </div>
            {history.map(function(h) {
              return (
                <div key={h.dateKey} onClick={function() { setHistoryDay(h); setShowHistory(false); }}
                  style={{ background: "#0F0F1A", borderRadius: 9, padding: "10px 13px", cursor: "pointer", display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 12, color: "#D1FAE5" }}>{h.dateKey}</div>
                    <div style={{ fontSize: 10, color: "#6B7280" }}>{h.count} platillos - {h.prot}g prot</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: (h.cal - h.burned) <= dailyGoal ? "#52B788" : "#E63946" }}>{h.cal - h.burned}</div>
                    <div style={{ fontSize: 9, color: "#6B7280" }}>kcal netas</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {historyDay && (
        <div style={{ background: "#F0FDF4", borderBottom: "2px solid #52B788", padding: "12px 14px" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: C.primary }}>{historyDay.dateKey}</span>
              <button onClick={function() { setHistoryDay(null); }} style={{ background: "none", border: "none", cursor: "pointer" }}>x</button>
            </div>
            <div style={{ display: "flex", gap: 7, marginBottom: 9 }}>
              {[
                { label: "Netas", val: historyDay.cal - historyDay.burned, color: (historyDay.cal - historyDay.burned) <= dailyGoal ? C.success : C.danger },
                { label: "Proteina", val: historyDay.prot + "g", color: "#3B82F6" },
                { label: "Ejercicio", val: historyDay.burned + "kcal", color: "#F59E0B" },
              ].map(function(m) {
                return (
                  <div key={m.label} style={{ flex: 1, background: "#fff", borderRadius: 9, padding: "8px 5px", textAlign: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: m.color }}>{m.val}</div>
                    <div style={{ fontSize: 9, color: C.muted }}>{m.label}</div>
                  </div>
                );
              })}
            </div>
            {historyDay.data.map(function(d) {
              var mt = MEAL_TIMES.find(function(m) { return m.id === d.meal; });
              return (
                <div key={d.id} style={{ background: "#fff", borderRadius: 8, padding: "7px 11px", marginBottom: 5, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span>{mt ? mt.emoji : ""} {d.name}</span>
                  <span style={{ color: C.muted }}>{d.calories}kcal</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showExport && dishes.length > 0 && (
        <div style={{ background: "#1A1A2E", color: "#E5E7EB", padding: "12px 14px", borderBottom: "3px solid #2D6A4F" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>Resumen del dia</span>
              <button onClick={function() { setShowExport(false); }} style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer" }}>x</button>
            </div>
            <pre style={{ background: "#0F0F1A", borderRadius: 9, padding: "11px", fontSize: 11, lineHeight: 1.6, overflowX: "auto", whiteSpace: "pre-wrap", color: "#D1FAE5", margin: "0 0 9px", fontFamily: "monospace" }}>
              {buildSummaryText()}
            </pre>
            <button onClick={function() { navigator.clipboard.writeText(buildSummaryText()).then(function() { setCopied(true); setTimeout(function() { setCopied(false); }, 2500); }); }}
              style={{ width: "100%", background: copied ? "#52B788" : "#2D6A4F", color: "#fff", border: "none", borderRadius: 9, padding: "10px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {copied ? "Copiado!" : "Copiar al portapapeles"}
            </button>
          </div>
        </div>
      )}

      <div style={{ background: C.surface, borderBottom: "1px solid " + C.border }}>
        <div style={{ maxWidth: 600, margin: "0 auto", display: "flex" }}>
          {[{ id: "registro", label: "Registro" }, { id: "semana", label: "Semana" }, { id: "calculadora", label: "Calcular" }, { id: "proteinas", label: "Proteina" }].map(function(tab) {
            return (
              <button key={tab.id} onClick={function() { setActiveTab(tab.id); }} style={{ flex: 1, padding: "11px 0", border: "none", background: "none", fontSize: 11, fontWeight: 600, color: activeTab === tab.id ? C.primary : C.muted, cursor: "pointer", borderBottom: activeTab === tab.id ? "2px solid " + C.primary : "2px solid transparent" }}>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "14px" }}>

        {activeTab === "registro" && (
          <>
            {(dishes.length > 0 || workouts.length > 0) && (
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>Calorias netas</span>
                  <span style={{ fontWeight: 700, fontSize: 18, color: progressColor }}>{netCalories.toLocaleString()} <span style={{ fontSize: 11, color: C.muted }}>/ {adjustedGoal}</span></span>
                </div>
                {totalBurned > 0 && <div style={{ fontSize: 11, color: "#92400E", background: "#FEF3C7", borderRadius: 6, padding: "3px 9px", marginBottom: 7, display: "inline-block" }}>+{totalBurned} kcal ejercicio sumadas</div>}
                <div style={{ height: 8, background: C.border, borderRadius: 6, overflow: "hidden", marginBottom: 4 }}>
                  <div style={{ height: "100%", width: progressPct + "%", background: progressColor, borderRadius: 6, transition: "width 0.4s" }} />
                </div>
                <div style={{ fontSize: 11, color: C.muted, textAlign: "right", marginBottom: 12 }}>
                  {netCalories < adjustedGoal ? "Faltan " + (adjustedGoal - netCalories) + " kcal" : "Superaste la meta por " + (netCalories - adjustedGoal) + " kcal"}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>Proteina</span>
                  <span style={{ fontWeight: 700, fontSize: 18, color: proteinColor }}>{totalProtein}g <span style={{ fontSize: 11, color: C.muted }}>/ {proteinGoal}g</span></span>
                </div>
                <div style={{ height: 8, background: C.border, borderRadius: 6, overflow: "hidden", marginBottom: 4 }}>
                  <div style={{ height: "100%", width: proteinPct + "%", background: proteinColor, borderRadius: 6, transition: "width 0.4s" }} />
                </div>
                <div style={{ fontSize: 11, color: C.muted, textAlign: "right", marginBottom: 12 }}>
                  {totalProtein < proteinGoal ? "Faltan " + (proteinGoal - totalProtein) + "g proteina" : "Meta de proteina alcanzada!"}
                </div>

                {/* Grasa */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>Grasa</span>
                  <span style={{ fontWeight: 700, fontSize: 18, color: fatColor }}>{totalFat}g <span style={{ fontSize: 11, color: C.muted }}>/ {fatGoal}g</span></span>
                </div>
                <div style={{ height: 8, background: C.border, borderRadius: 6, overflow: "hidden", marginBottom: 4 }}>
                  <div style={{ height: "100%", width: fatPct + "%", background: fatColor, borderRadius: 6, transition: "width 0.4s" }} />
                </div>
                <div style={{ fontSize: 11, color: C.muted, textAlign: "right", marginBottom: 12 }}>
                  {totalFat <= fatGoal ? "Faltan " + (fatGoal - totalFat) + "g de grasa" : "Superaste grasa por " + (totalFat - fatGoal) + "g"}
                </div>

                {/* Carbos */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>Carbos netos</span>
                  <span style={{ fontWeight: 700, fontSize: 18, color: carbColor }}>{totalCarbs}g <span style={{ fontSize: 11, color: C.muted }}>/ {carbGoal}g</span></span>
                </div>
                <div style={{ height: 8, background: C.border, borderRadius: 6, overflow: "hidden", marginBottom: 4 }}>
                  <div style={{ height: "100%", width: carbPct + "%", background: carbColor, borderRadius: 6, transition: "width 0.4s" }} />
                </div>
                <div style={{ fontSize: 11, color: C.muted, textAlign: "right", marginBottom: 12 }}>
                  {totalCarbs <= carbGoal ? "Faltan " + (carbGoal - totalCarbs) + "g de carbos" : "Superaste carbos por " + (totalCarbs - carbGoal) + "g"}
                </div>
                <div style={{ display: "flex", gap: 6, paddingTop: 10, borderTop: "1px solid " + C.border }}>
                  {[{ l: "Carbos", v: totalCarbs + "g", c: "#F59E0B" }, { l: "Grasa", v: totalFat + "g", c: "#EF4444" }, { l: "Quemadas", v: totalBurned, c: "#F59E0B" }, { l: "Platillos", v: dishes.length, c: C.primary }].map(function(m) {
                    return (
                      <div key={m.l} style={{ flex: 1, textAlign: "center", background: C.bg, borderRadius: 8, padding: "6px 2px" }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: m.c }}>{m.v}</div>
                        <div style={{ fontSize: 9, color: C.muted }}>{m.l}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {workouts.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#92400E", marginBottom: 7 }}>Ejercicio de hoy</div>
                {workouts.map(function(w) {
                  return (
                    <div key={w.id} style={{ background: "#FEF3C7", borderRadius: 10, padding: "9px 12px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 14, marginRight: 6 }}>{w.emoji}</span>
                      <span style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{w.note}</span>
                      <span style={{ fontWeight: 800, color: "#92400E", fontSize: 14 }}>-{w.calories} kcal</span>
                      <button onClick={function() { setWorkouts(function(prev) { return prev.filter(function(x) { return x.id !== w.id; }); }); }} style={{ background: "none", border: "none", color: "#B45309", cursor: "pointer", marginLeft: 7 }}>x</button>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", paddingBottom: 2 }}>
              {MEAL_TIMES.map(function(mt) {
                var count = dishesByMeal[mt.id].length;
                var active = selectedMeal === mt.id;
                return (
                  <button key={mt.id} onClick={function() { setSelectedMeal(mt.id); }} style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", padding: "7px 11px", borderRadius: 10, border: "2px solid " + (active ? mt.color : C.border), background: active ? mt.color + "18" : C.surface, cursor: "pointer", gap: 2 }}>
                    <span style={{ fontSize: 15 }}>{mt.emoji}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: active ? mt.color : C.muted }}>{mt.label}</span>
                    {count > 0 && <span style={{ fontSize: 9, background: mt.color, color: "#fff", borderRadius: 8, padding: "1px 5px", fontWeight: 700 }}>{count}</span>}
                  </button>
                );
              })}
            </div>

            <div style={Object.assign({}, cardStyle, { marginBottom: 13 })}>
              {(function() {
                var mt = MEAL_TIMES.find(function(m) { return m.id === selectedMeal; });
                return (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: mt.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{mt.emoji} Agregar a {mt.label}</label>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button onClick={function() { if (photoInputRef.current) photoInputRef.current.click(); }}
                        style={{ background: "#F0FDF4", border: "1.5px solid #52B788", borderRadius: 7, padding: "4px 8px", fontSize: 12, cursor: "pointer", color: "#2D6A4F", fontWeight: 700 }}>Galeria</button>
                      <button onClick={function() { if (cameraInputRef.current) cameraInputRef.current.click(); }}
                        style={{ background: "#F0FDF4", border: "1.5px solid #52B788", borderRadius: 7, padding: "4px 8px", fontSize: 12, cursor: "pointer", color: "#2D6A4F", fontWeight: 700 }}>Camara</button>
                    </div>
                  </div>
                );
              })()}
              <div style={{ display: "flex", gap: 6 }}>
                <input ref={inputRef} value={input} onChange={function(e) { setInput(e.target.value); }}
                  onKeyDown={function(e) { if (e.key === "Enter" && !loading) analyzeDish(); }}
                  placeholder="Describe tu platillo o usa la camara..."
                  style={{ flex: 1, border: "1.5px solid " + C.border, borderRadius: 8, padding: "8px 11px", fontSize: 13, outline: "none", color: C.text, background: C.bg }}
                  onFocus={function(e) { e.target.style.borderColor = C.primaryLight; }}
                  onBlur={function(e) { e.target.style.borderColor = C.border; }}
                />
                <button onClick={analyzeDish} disabled={loading || !input.trim()} style={{ background: loading || !input.trim() ? C.border : C.primary, color: loading || !input.trim() ? C.muted : "#fff", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontWeight: 600, cursor: loading || !input.trim() ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                  {loading ? "..." : "Analizar"}
                </button>
              </div>
              {error && <p style={{ margin: "6px 0 0", fontSize: 12, color: C.danger }}>{error}</p>}
            </div>

            {MEAL_TIMES.map(function(mt) {
              var mealDishes = dishesByMeal[mt.id];
              if (mealDishes.length === 0) return null;
              var mCal = mealDishes.reduce(function(s, d) { return s + d.calories; }, 0);
              var mProt = mealDishes.reduce(function(s, d) { return s + d.protein; }, 0);
              return (
                <div key={mt.id} style={{ marginBottom: 15 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: mt.color }}>{mt.emoji} {mt.label}</span>
                    <span style={{ fontSize: 11, color: C.muted }}><span style={{ fontWeight: 600, color: mt.color }}>{mCal} kcal</span> - {mProt}g prot</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {mealDishes.map(function(dish) {
                      var level = getCalorieLevel(dish.calories);
                      return (
                        <div key={dish.id} style={{ background: C.surface, borderRadius: 11, padding: "10px 12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderLeft: "4px solid " + level.color }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, display: "flex", alignItems: "center", gap: 5 }}>
                                {dish.name}
                                {dish.fromPhoto && <span style={{ fontSize: 9, background: "#52B788", color: "#fff", borderRadius: 5, padding: "1px 5px", marginLeft: 4 }}>foto</span>}
                              </div>
                              <div style={{ fontSize: 10, color: C.muted, marginBottom: 5 }}>Porcion: {dish.portion}</div>
                              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                {[{ l: "Prot", v: dish.protein, c: "#3B82F6" }, { l: "Carbos", v: dish.carbs, c: "#F59E0B" }, { l: "Grasa", v: dish.fat, c: "#EF4444" }].map(function(m) {
                                  return <span key={m.l} style={{ fontSize: 10, background: C.bg, borderRadius: 5, padding: "2px 6px", color: C.muted }}><span style={{ color: m.c, fontWeight: 700 }}>{m.v}g</span> {m.l}</span>;
                                })}
                              </div>
                              {dish.tip && <p style={{ margin: "5px 0 0", fontSize: 10, color: C.muted, fontStyle: "italic" }}>{dish.tip}</p>}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                              <div style={{ fontSize: 17, fontWeight: 800, color: level.color, lineHeight: 1 }}>{dish.calories}</div>
                              <div style={{ fontSize: 9, color: C.muted }}>kcal</div>
                              <button onClick={function() { setDishes(function(prev) { return prev.filter(function(d) { return d.id !== dish.id; }); }); }} style={{ background: "none", border: "1px solid " + C.border, borderRadius: 5, padding: "2px 6px", fontSize: 10, color: C.muted, cursor: "pointer" }}>x</button>
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
              <div style={{ textAlign: "center", padding: "30px 16px", color: C.muted }}>
                <div style={{ fontSize: 38, marginBottom: 9 }}>&#x1F37D;&#xFE0F;</div>
                <p style={{ margin: 0, fontSize: 13 }}>Selecciona una comida y empieza a registrar</p>
              </div>
            )}
            {(dishes.length > 0 || workouts.length > 0) && (
              <button onClick={function() { setDishes([]); setWorkouts([]); }} style={{ display: "block", margin: "12px auto 0", background: "none", border: "1.5px solid " + C.border, borderRadius: 9, padding: "7px 18px", fontSize: 12, color: C.muted, cursor: "pointer" }}>
                Limpiar dia actual
              </button>
            )}
          </>
        )}

        {activeTab === "semana" && (
          <>
            <h2 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700 }}>Ultimos 7 dias</h2>
            <p style={{ margin: "0 0 14px", fontSize: 12, color: C.muted }}>Amarillo = calorias quemadas por ejercicio</p>
            <div style={cardStyle}>
              <WeeklyChart data={weeklyData} dailyGoal={dailyGoal} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[].concat(weeklyData).reverse().map(function(d) {
                var isToday = d.key === getTodayKey();
                var net = d.net - d.burned;
                return (
                  <div key={d.key} style={{ background: C.surface, borderRadius: 12, padding: "11px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderLeft: "4px solid " + (d.net === 0 ? C.border : net <= dailyGoal ? C.success : C.danger) }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
                          {formatDateShort(d.key)}
                          {isToday && <span style={{ fontSize: 9, background: C.primary, color: "#fff", borderRadius: 7, padding: "1px 6px" }}>HOY</span>}
                        </div>
                        <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                          {d.protein > 0 ? d.protein + "g prot" : "Sin registro"}
                          {d.burned > 0 ? " - ejercicio -" + d.burned + "kcal" : ""}
                        </div>
                      </div>
                      {d.net > 0 ? (
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 17, fontWeight: 800, color: net <= dailyGoal ? C.success : C.danger, lineHeight: 1 }}>{d.net}</div>
                          <div style={{ fontSize: 9, color: C.muted }}>kcal</div>
                        </div>
                      ) : <div style={{ fontSize: 12, color: C.border }}>-</div>}
                    </div>
                  </div>
                );
              })}
            </div>
            {weeklyData.some(function(d) { return d.net > 0; }) && (function() {
              var activeDays = weeklyData.filter(function(d) { return d.net > 0; });
              var avgCal = Math.round(activeDays.reduce(function(s, d) { return s + d.net; }, 0) / activeDays.length);
              var avgProt = Math.round(activeDays.reduce(function(s, d) { return s + d.protein; }, 0) / activeDays.length);
              var avgBurned = Math.round(weeklyData.reduce(function(s, d) { return s + d.burned; }, 0) / 7);
              return (
                <div style={{ background: "#EFF6FF", borderRadius: 12, padding: "13px 14px", marginTop: 13, borderLeft: "4px solid #3B82F6" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#1D4ED8", marginBottom: 9 }}>Promedio semanal ({activeDays.length} dias)</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {[{ l: "Calorias/dia", v: avgCal, c: "#1D4ED8" }, { l: "Proteina/dia", v: avgProt + "g", c: "#3B82F6" }, { l: "Quemadas/dia", v: avgBurned + "kcal", c: "#F59E0B" }].map(function(m) {
                      return (
                        <div key={m.l} style={{ flex: 1, textAlign: "center" }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: m.c }}>{m.v}</div>
                          <div style={{ fontSize: 10, color: "#3B82F6" }}>{m.l}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </>
        )}

        {activeTab === "calculadora" && (
          <>
            <h2 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700 }}>Calculadora de calorias</h2>
            <p style={{ margin: "0 0 13px", fontSize: 12, color: C.muted }}>Ingresa el alimento y cantidad exacta</p>
            <div style={{ display: "flex", background: C.surface, borderRadius: 11, padding: 3, marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              {[{ id: "ia", label: "Buscar con IA" }, { id: "lista", label: "Lista de alimentos" }].map(function(m) {
                return (
                  <button key={m.id} onClick={function() { setCalcMode(m.id); setCalcResult(null); setCalcError(""); }} style={{ flex: 1, padding: "9px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, background: calcMode === m.id ? C.primary : "none", color: calcMode === m.id ? "#fff" : C.muted, cursor: "pointer" }}>
                    {m.label}
                  </button>
                );
              })}
            </div>

            {calcMode === "ia" && (
              <div style={cardStyle}>
                <label style={labelStyle}>Alimento</label>
                <input value={calcFood} onChange={function(e) { setCalcFood(e.target.value); }}
                  onKeyDown={function(e) { if (e.key === "Enter" && !calcLoading) calcWithAI(); }}
                  placeholder="Ej: pechuga de pollo, mango..."
                  style={Object.assign({}, inputStyle, { marginBottom: 11 })}
                  onFocus={function(e) { e.target.style.borderColor = C.primaryLight; }}
                  onBlur={function(e) { e.target.style.borderColor = C.border; }}
                />
                <label style={labelStyle}>Cantidad</label>
                <div style={{ display: "flex", gap: 7 }}>
                  <input type="number" value={calcAmount} onChange={function(e) { setCalcAmount(e.target.value); }}
                    placeholder="Ej: 150"
                    style={{ flex: 1, border: "1.5px solid " + C.border, borderRadius: 9, padding: "9px 12px", fontSize: 16, fontWeight: 700, outline: "none", color: C.text, background: C.bg }}
                    onFocus={function(e) { e.target.style.borderColor = C.primaryLight; }}
                    onBlur={function(e) { e.target.style.borderColor = C.border; }}
                  />
                  <div style={{ display: "flex", background: C.bg, borderRadius: 9, border: "1.5px solid " + C.border, overflow: "hidden" }}>
                    {["g", "ml"].map(function(u) {
                      return (
                        <button key={u} onClick={function() { setCalcUnit(u); }} style={{ padding: "9px 14px", border: "none", fontSize: 13, fontWeight: 700, background: calcUnit === u ? C.primary : "none", color: calcUnit === u ? "#fff" : C.muted, cursor: "pointer" }}>{u}</button>
                      );
                    })}
                  </div>
                </div>
                {calcError && <p style={{ margin: "7px 0 0", fontSize: 12, color: C.danger }}>{calcError}</p>}
                <button onClick={calcWithAI} disabled={calcLoading || !calcFood.trim() || !calcAmount} style={{ width: "100%", marginTop: 12, background: calcLoading || !calcFood.trim() || !calcAmount ? C.border : C.primary, color: calcLoading || !calcFood.trim() || !calcAmount ? C.muted : "#fff", border: "none", borderRadius: 9, padding: "11px", fontSize: 13, fontWeight: 700, cursor: calcLoading || !calcFood.trim() || !calcAmount ? "not-allowed" : "pointer" }}>
                  {calcLoading ? "Calculando..." : "Calcular calorias"}
                </button>
              </div>
            )}

            {calcMode === "lista" && (
              <div style={cardStyle}>
                <input value={calcSearch} onChange={function(e) { setCalcSearch(e.target.value); setCalcSelected(null); setCalcResult(null); }}
                  placeholder="Buscar alimento..."
                  style={Object.assign({}, inputStyle, { marginBottom: 9 })}
                  onFocus={function(e) { e.target.style.borderColor = C.primaryLight; }}
                  onBlur={function(e) { e.target.style.borderColor = C.border; }}
                />
                {!calcSelected && (
                  <div style={{ maxHeight: 230, overflowY: "auto", display: "flex", flexDirection: "column", gap: 5 }}>
                    {filteredFoods.map(function(food) {
                      return (
                        <div key={food.name} onClick={function() { setCalcSelected(food); setCalcAmount(""); setCalcResult(null); }}
                          style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 11px", borderRadius: 9, cursor: "pointer", background: C.bg }}>
                          <span style={{ fontSize: 20 }}>{food.emoji}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 12 }}>{food.name}</div>
                            <div style={{ fontSize: 10, color: C.muted }}>{food.cal} kcal - {food.protein}g prot / 100{food.unit}</div>
                          </div>
                          <span style={{ color: C.muted }}>{">"}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                {calcSelected && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 11, padding: "9px 11px", background: C.bg, borderRadius: 9 }}>
                      <span style={{ fontSize: 22 }}>{calcSelected.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{calcSelected.name}</div>
                        <div style={{ fontSize: 10, color: C.muted }}>{calcSelected.cal} kcal por 100{calcSelected.unit}</div>
                      </div>
                      <button onClick={function() { setCalcSelected(null); setCalcResult(null); }} style={{ background: "none", border: "none", color: C.muted, fontSize: 16, cursor: "pointer" }}>x</button>
                    </div>
                    <label style={labelStyle}>Cantidad ({calcSelected.unit})</label>
                    <input type="number" value={calcAmount}
                      onChange={function(e) { setCalcAmount(e.target.value); if (parseFloat(e.target.value) > 0) calcFromList(calcSelected, e.target.value); else setCalcResult(null); }}
                      placeholder={"Ej: 150 " + calcSelected.unit}
                      style={{ width: "100%", border: "1.5px solid " + C.border, borderRadius: 9, padding: "11px 13px", fontSize: 18, fontWeight: 700, outline: "none", color: C.text, background: C.bg, boxSizing: "border-box" }}
                      onFocus={function(e) { e.target.style.borderColor = C.primaryLight; }}
                      onBlur={function(e) { e.target.style.borderColor = C.border; }}
                    />
                  </div>
                )}
              </div>
            )}

            {calcResult && (
              <div style={{ background: C.surface, borderRadius: 15, padding: "16px", marginBottom: 13, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", border: "2px solid " + C.primaryLight }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 13 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{calcResult.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{calcResult.amount}{calcResult.unit} - ref: {calcResult.per100} kcal/100{calcResult.unit}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: C.primary, lineHeight: 1 }}>{calcResult.calories}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>kcal</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 7, marginBottom: 14 }}>
                  {[{ l: "Proteina", v: calcResult.protein, c: "#3B82F6", bg: "#EFF6FF" }, { l: "Carbos", v: calcResult.carbs, c: "#F59E0B", bg: "#FFFBEB" }, { l: "Grasa", v: calcResult.fat, c: "#EF4444", bg: "#FEF2F2" }].map(function(m) {
                    return (
                      <div key={m.l} style={{ flex: 1, background: m.bg, borderRadius: 9, padding: "9px 5px", textAlign: "center" }}>
                        <div style={{ fontSize: 17, fontWeight: 800, color: m.c }}>{m.v}<span style={{ fontSize: 10, fontWeight: 400 }}>g</span></div>
                        <div style={{ fontSize: 10, color: m.c, fontWeight: 600 }}>{m.l}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 7 }}>
                  <select value={selectedMeal} onChange={function(e) { setSelectedMeal(e.target.value); }} style={{ flex: 1, border: "1.5px solid " + C.border, borderRadius: 9, padding: "9px 11px", fontSize: 12, outline: "none", color: C.text, background: C.bg, cursor: "pointer" }}>
                    {MEAL_TIMES.map(function(m) { return <option key={m.id} value={m.id}>{m.emoji} {m.label}</option>; })}
                  </select>
                  <button onClick={addCalcResultToLog} style={{ flex: 2, background: C.primary, color: "#fff", border: "none", borderRadius: 9, padding: "9px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    Agregar al registro
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "proteinas" && (
          <>
            <h2 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700 }}>Alimentos altos en proteina</h2>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: C.muted }}>Meta: <strong style={{ color: "#3B82F6" }}>{proteinGoal}g/dia</strong> - Toca para agregar</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {HIGH_PROTEIN_FOODS.map(function(food) {
                var pct = Math.round((food.protein / proteinGoal) * 100);
                return (
                  <div key={food.name}
                    onClick={function() { setInput(food.name); setActiveTab("registro"); setTimeout(function() { if (inputRef.current) inputRef.current.focus(); }, 100); }}
                    style={{ background: C.surface, borderRadius: 11, padding: "10px 12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", cursor: "pointer", display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={{ fontSize: 24 }}>{food.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 1 }}>{food.name}</div>
                      <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>{food.per} · {food.cal} kcal · {food.fat}g grasa · {food.carbs}g carbos</div>
                      <div style={{ height: 4, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: Math.min(pct, 100) + "%", background: "#3B82F6", borderRadius: 3 }} />
                      </div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 46 }}>
                      <div style={{ fontSize: 17, fontWeight: 800, color: "#3B82F6", lineHeight: 1 }}>{food.protein}g</div>
                      <div style={{ fontSize: 9, color: C.muted }}>{pct}% meta</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ margin: "13px 0 4px", padding: "11px 13px", background: "#EFF6FF", borderRadius: 11, borderLeft: "4px solid #3B82F6" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1D4ED8", marginBottom: 3 }}>Consejo para tu objetivo</div>
              <div style={{ fontSize: 11, color: "#1E40AF", lineHeight: 1.5 }}>Con tu dieta de deficit calorico (1,800 kcal), distribuye tus 130g de proteina en 4 comidas (~33g cada una). Prioriza proteinas magras para mantenerte en tu meta de 80g de grasa. Los carbos netos de 45g al dia favorecen la quema de grasa — prefiere verduras, aguacate y nueces como fuente de energia.</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
