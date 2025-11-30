// =============================
//  CARGA DEL JSON
// =============================
let datos = [];
let resultadosActuales = [];

const estadoEl = document.getElementById("estado");
const inputEl  = document.getElementById("busquedaInput");
const btnBuscar = document.getElementById("btnBuscar");
const resultadoEl = document.getElementById("resultado");
const similaresBox = document.getElementById("similaresBox");
const similaresSelect = document.getElementById("similaresSelect");

// ====== Cargar JSON ======
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
//  NORMALIZADOR
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
const aliasProfesionales = {
  placa: ["placa", "placas", "no placa", "numplaca", "noplaca"],
  piloto: ["piloto", "conductor", "nombre", "nombrecompleto"],
  concesionario: ["concesionario", "propietario", "dueño", "dueno"],
  telefono: ["telefono", "tel", "numtelefono"],
  dpi: ["dpi", "documento"],
  licencia: ["licencia", "nolicencia"],
  boleta: ["boleta", "noboleta"],
  articulo: ["articulo", "faltas"],
  tipo: ["tipo", "clase"],
  marca: ["marca"],
  color: ["color"],
  ruta: ["ruta", "zona", "sector"],
  direccion: ["direccion", "ubicacion", "dir"],
  serie: ["serie"],
};

// ====== Detectar campo según alias ======
function matchField(key) {
  const clean = normalizacionClave(key);
  for (let campo in aliasProfesionales) {
    for (let a of aliasProfesionales[campo]) {
      if (clean.includes(normalizacionClave(a))) return campo;
    }
  }
  return null;
}

function normalizacionClave(t) {
  return t.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// =============================
// BÚSQUEDA
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

  const encontrados = datos.filter(row => {
    const texto = Object.values(row).join(" ");
    return normalizar(texto).includes(qNorm);
  });

  mostrarResultados(encontrados);
}

// =============================
// MOSTRAR RESULTADOS
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
    resultadoEl.innerHTML = generarTarjetaProfesional(lista[0]);
    return;
  }

  similaresBox.classList.remove("oculto");

  lista.forEach((r, i) => {
    const placa = r.placa || r.placas || "N/D";
    const dpi = r.dpi || r.documento || "";
    const pil = r.piloto || "";

    const texto = [placa, dpi, pil].filter(Boolean).join(" — ");

    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = texto;
    similaresSelect.appendChild(opt);
  });

  resultadoEl.innerHTML = generarTarjetaProfesional(lista[0]);
}

// =============================
// TARJETA ESTILO PMT PROFESIONAL
// =============================
function generarTarjetaProfesional(row) {
  const limpio = {};

  // Convertir claves usando alias
  for (let key in row) {
    const campo = matchField(key);
    if (campo) limpio[campo] = row[key];
  }

  // FORMATO DE TARJETA VISUAL
  let html = `<div class="tarjeta">`;

  const orden = [
    "placa", "piloto", "concesionario", "telefono",
    "dpi", "licencia", "boleta", "articulo",
    "tipo", "marca", "color", "serie", "ruta", "direccion"
  ];

  orden.forEach(campo => {
    if (limpio[campo]) {
      html += `<div class="campo"><b>${campo.toUpperCase()}:</b> ${limpio[campo]}</div>`;
    }
  });

  html += `</div>`;
  return html;
}

// =============================
// EVENTOS
// =============================
btnBuscar.addEventListener("click", buscar);
inputEl.addEventListener("keydown", e => { if (e.key === "Enter") buscar(); });

similaresSelect.addEventListener("change", () => {
  const idx = similaresSelect.value;
  if (idx === "") return;
  resultadoEl.innerHTML = generarTarjetaProfesional(resultadosActuales[idx]);
});
