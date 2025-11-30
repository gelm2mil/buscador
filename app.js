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

// ================== GENERAR TABLA PROFESIONAL ==================
function generarTarjeta(r) {
  let html = `
    <table class="tabla-resultados">
      <thead>
        <tr><th>CAMPO</th><th>VALOR</th></tr>
      </thead>
      <tbody>
  `;

  for (let key in r) {
    const limpioKey = key
      .replace(/_/g, " ")
      .replace(/unnamed/i, "Dato")
      .toUpperCase();

    let value = r[key];
    if (value === null || value === "" || value === undefined) {
      value = "—";
    }

    html += `
      <tr>
        <td class="campo-titulo">${limpioKey}</td>
        <td class="campo-valor">${value}</td>
      </tr>
    `;
  }

  html += `
      </tbody>
    </table>
  `;

  return html;
}


// Eventos
btnBuscar.addEventListener("click", buscar);
inputEl.addEventListener("keydown", e => { if (e.key === "Enter") buscar(); });
similaresSelect.addEventListener("change", () => {
  resultadoEl.innerHTML = generarTarjeta(resultadosActuales[similaresSelect.value]);
});

