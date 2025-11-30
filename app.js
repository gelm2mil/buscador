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

// Normalizador
function normalizar(txt) {
  return String(txt || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .replace(/[-_.]/g, "");
}

// =============================
// ALIAS INTELIGENTES
// =============================
const alias = {
  placa: ["placa", "placas"],
  piloto: ["piloto", "conductor", "nombre"],
  concesionario: ["concesionario", "propietario", "dueño", "dueno"],
  telefono: ["telefono", "tel"],
  dpi: ["dpi", "documento"],
  licencia: ["licencia"],
  boleta: ["boleta"],
  tipo: ["tipo", "clase"],
  marca: ["marca"],
  color: ["color"],
  serie: ["serie"],
  ruta: ["ruta", "zona", "direccion", "ubicacion"]
};

function limpiarClave(t) {
  return t.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function detectarCampo(key) {
  const limpio = limpiarClave(key);
  for (let campo in alias) {
    for (let a of alias[campo]) {
      if (limpio.includes(limpiarClave(a))) return campo;
    }
  }
  return null;
}

// =============================
// BÚSQUEDA
// =============================
function buscar() {
  if (!datos.length) return alert("Esperando datos…");
  
  const q = normalizar(inputEl.value.trim());
  if (q.length < 2) return alert("Mínimo 2 caracteres");

  const encontrados = datos.filter(row =>
    normalizar(Object.values(row).join(" ")).includes(q)
  );

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
    resultadoEl.innerHTML = `<div class="nope">❌ Sin resultados</div>`;
    return;
  }

  if (lista.length > 1) {
    similaresBox.classList.remove("oculto");
    lista.forEach((r, i) => {
      const placa = r.placa || r.placas || "N/D";
      const piloto = r.piloto || r.conductor || "";
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = `${placa} — ${piloto}`;
      similaresSelect.appendChild(opt);
    });
  }

  resultadoEl.innerHTML = generarTarjeta(lista[0]);
}

// =============================
// TARJETA COMPLETA PROFESIONAL
// =============================
function generarTarjeta(row) {
  let ordenados = {};
  let otros = {};

  for (let key in row) {
    const valor = row[key];
    if (valor === null || valor === "" || valor === "null") continue;

    let campo = detectarCampo(key);
    if (campo) ordenados[campo] = valor;
    else otros[key] = valor;
  }

  let html = `<div class="tarjeta">`;

  // Primero campos importantes
  const ordenImportante = [
    "placa","piloto","concesionario","telefono",
    "dpi","licencia","boleta","tipo",
    "marca","color","serie","ruta"
  ];

  ordenImportante.forEach(c => {
    if (ordenados[c]) {
      html += `<div class="campo"><b>${c.toUpperCase()}:</b> ${ordenados[c]}</div>`;
    }
  });

  // Después TODO lo que no tiene alias
  html += `<hr style="border:1px solid #0ff3; margin:10px 0;">`;
  html += `<div class="campo" style="opacity:.7;">Datos adicionales</div>`;

  for (let key in otros) {
    html += `<div class="campo"><b>${key}:</b> ${otros[key]}</div>`;
  }

  html += `</div>`;
  return html;
}

// Eventos
btnBuscar.addEventListener("click", buscar);
inputEl.addEventListener("keydown", e => { if (e.key === "Enter") buscar(); });
similaresSelect.addEventListener("change", () => {
  resultadoEl.innerHTML = generarTarjeta(resultadosActuales[similaresSelect.value]);
});
