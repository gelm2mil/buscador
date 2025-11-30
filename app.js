// ================== CARGA DEL JSON ==================
let datos = [];
let resultadosActuales = [];

const estadoEl = document.getElementById("estado");
const inputEl  = document.getElementById("busquedaInput");
const btnBuscar = document.getElementById("btnBuscar");
const resultadoEl = document.getElementById("resultado");
const similaresBox = document.getElementById("similaresBox");
const similaresSelect = document.getElementById("similaresSelect");
const pieFecha = document.getElementById("pie-fecha");

// Fecha en el pie
if (pieFecha) {
  const f = new Date();
  pieFecha.textContent = f.toLocaleString("es-GT");
}

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

// ================== NORMALIZAR TEXTO ==================
function normalizar(txt) {
  return String(txt || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/\s+/g, "")  // espacios
    .replace(/[-_.]/g, ""); // guiones, puntos, etc.
}

// ================== BÚSQUEDA ==================
function buscar() {
  if (!datos || datos.length === 0) {
    alert("Aún no se han cargado los datos.");
    return;
  }

  const q = inputEl.value.trim();
  if (q.length < 2) {
    alert("Ingrese mínimo 2 caracteres.");
    return;
  }

  const qNorm = normalizar(q);

  // buscar en TODOS los campos de cada registro
  const encontrados = datos.filter(row => {
    const texto = Object.values(row).join(" ");
    return normalizar(texto).includes(qNorm);
  });

  mostrarResultados(encontrados);
}

// ================== MOSTRAR RESULTADOS ==================
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

  // Varios resultados -> usamos SIMILARES
  similaresBox.classList.remove("oculto");

  lista.forEach((row, idx) => {
    const placa   = row.placa || row.placas || "N/D";
    const licencia = row.licencia || row.n_licencia || row.no_licencia || "";
    const doc     = row.documento || row.no_documento || row.dpi || "";

    const textoOpcion = [placa, licencia, doc]
      .filter(Boolean)
      .join(" — ");

    const opt = document.createElement("option");
    opt.value = idx;
    opt.textContent = textoOpcion || `Registro ${idx + 1}`;
    similaresSelect.appendChild(opt);
  });

  // opcional: mostrar el primero por defecto
  resultadoEl.innerHTML = generarTarjeta(lista[0]);
}

// ================== GENERAR TARJETA ==================
function generarTarjeta(r) {
  const placa   = r.placa || r.placas || "N/D";
  const serie   = r.serie || "";
  const boleta  = r["No. Boleta"] || r.boleta || "";
  const licencia = r.licencia || r.n_licencia || r.no_licencia || "";
  const dpi     = r.dpi || "";
  const doc     = r.documento || r.no_documento || "";
  const fecha   = r.fecha || "";
  const hora    = r.hora || "";
  const tipo    = r.tipo || "";
  const marca   = r.marca || "";
  const color   = r.color || "";
  const dir     = r.direccion || r.dirección || "";

  return `
  <div class="tarjeta">
    <div class="campo"><b>Placa:</b> ${placa}</div>
    ${serie ? `<div class="campo"><b>Serie:</b> ${serie}</div>` : ""}
    ${boleta ? `<div class="campo"><b>No. Boleta:</b> ${boleta}</div>` : ""}
    ${licencia ? `<div class="campo"><b>Licencia:</b> ${licencia}</div>` : ""}
    ${dpi ? `<div class="campo"><b>DPI:</b> ${dpi}</div>` : ""}
    ${doc ? `<div class="campo"><b>Documento:</b> ${doc}</div>` : ""}
    ${fecha ? `<div class="campo"><b>Fecha:</b> ${fecha}</div>` : ""}
    ${hora ? `<div class="campo"><b>Hora:</b> ${hora}</div>` : ""}
    ${tipo ? `<div class="campo"><b>Tipo:</b> ${tipo}</div>` : ""}
    ${marca ? `<div class="campo"><b>Marca:</b> ${marca}</div>` : ""}
    ${color ? `<div class="campo"><b>Color:</b> ${color}</div>` : ""}
    ${dir ? `<div class="campo"><b>Dirección:</b> ${dir}</div>` : ""}
  </div>
  `;
}

// ================== EVENTOS ==================
btnBuscar.addEventListener("click", buscar);

inputEl.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    buscar();
  }
});

// cambio en SIMILARES
similaresSelect.addEventListener("change", () => {
  const idx = similaresSelect.value;
  if (idx === "") return;
  const row = resultadosActuales[idx];
  if (row) {
    resultadoEl.innerHTML = generarTarjeta(row);
  }
});
