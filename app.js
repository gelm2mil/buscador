// =============================
//  CONFIGURACIÓN GENERAL
// =============================
let datos = [];
let resultadosActuales = [];

const estadoEl = document.getElementById("estado");
const inputEl  = document.getElementById("busquedaInput");
const btnBuscar = document.getElementById("btnBuscar");
const resultadoEl = document.getElementById("resultado");
const similaresBox = document.getElementById("similaresBox");
const similaresSelect = document.getElementById("similaresSelect");

// =============================
//  CARGAR JSON
// =============================
fetch("placas.json")
  .then(res => res.json())
  .then(json => {
    datos = json;
    estadoEl.textContent = "Archivo cargado ✔️";
  })
  .catch(err => {
    console.error(err);
    estadoEl.textContent = "Error cargando información ❌";
  });

// =============================
//  NORMALIZAR TEXTO
// =============================
function normalizar(txt) {
  return String(txt || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .replace(/[-_.]/g, "");
}

// =============================
//  ALIAS INTELIGENTES
// =============================
const aliases = {
  placa: ["placa", "placas", "numplaca", "nop", "numeroplaca"],
  dpi: ["dpi", "documento", "nodocumento"],
  licencia: ["licencia", "nolicencia", "numlicencia", "lic"],
  boleta: ["boleta", "noboleta", "numeroboleta"],
  conductor: ["conductor", "nombre", "nombredelconductor"],
  direccion: ["direccion", "ubicacion", "dir"],
  articulo: ["articulo", "faltas", "art"],
};

// Encontrar columna por alias
function matchField(key) {
  const cleanKey = normalizar(key);
  for (let campo in aliases) {
    for (let alias of aliases[campo]) {
      if (cleanKey.includes(normalizar(alias))) return campo;
    }
  }
  return key;
}

// =============================
//  BÚSQUEDA ULTRA COMPLETA
// =============================
function buscar() {
  if (datos.length === 0) {
    alert("Aún no se han cargado los datos.");
    return;
  }

  const q = inputEl.value.trim();
  if (q.length < 2) {
    alert("Ingrese mínimo 2 caracteres.");
    return;
  }

  const qNorm = normalizar(q);

  const resultados = datos.filter(row => {
    const texto = Object.values(row).join(" ");
    return normalizar(texto).includes(qNorm);
  });

  mostrarResultados(resultados);
}

// =============================
//  MOSTRAR RESULTADOS
// =============================
function mostrarResultados(lista) {
  resultadosActuales = lista;
  resultadoEl.innerHTML = "";
  similaresSelect.innerHTML = "<option value=''>-- seleccionar --</option>";
  similaresBox.classList.add("oculto");

  if (lista.length === 0) {
    resultadoEl.innerHTML = "<div class='nope'>❓ Sin resultados</div>";
    return;
  }

  if (lista.length === 1) {
    resultadoEl.innerHTML = generarTarjeta(lista[0]);
    return;
  }

  similaresBox.classList.remove("oculto");

  lista.forEach((row, idx) => {
    const placa = row.placa || row.placas || "N/D";
    const dpi   = row.dpi || row.documento || "";
    const lic   = row.licencia || row.no_licencia || "";

    const opcion = [placa, dpi, lic].filter(Boolean).join(" — ");

    const opt = document.createElement("option");
    opt.value = idx;
    opt.textContent = opcion || `Registro ${idx + 1}`;
    similaresSelect.appendChild(opt);
  });

  resultadoEl.innerHTML = generarTarjeta(lista[0]);
}

// =============================
//  GENERAR TARJETA PROFESIONAL
// =============================
function generarTarjeta(row) {
  const datosLimpios = {};

  // Detectar campos por alias
  for (let key in row) {
    const campo = matchField(key);
    datosLimpios[campo] = row[key];
  }

  let html = `<div class="tarjeta">`;

  for (let campo in datosLimpios) {
    html += `<div class="campo"><b>${campo.toUpperCase()}:</b> ${datosLimpios[campo]}</div>`;
  }

  html += `</div>`;
  return html;
}

// =============================
//  EVENTOS
// =============================
btnBuscar.addEventListener("click", buscar);

inputEl.addEventListener("keydown", e => {
  if (e.key === "Enter") buscar();
});

similaresSelect.addEventListener("change", () => {
  const idx = similaresSelect.value;
  if (idx === "") return;
  resultadoEl.innerHTML = generarTarjeta(resultadosActuales[idx]);
});
