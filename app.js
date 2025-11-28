/* ============================================================
   AGENDA 2026 PRO — LÓGICA COMPLETA
   By GELM
   ============================================================ */

const fechaInput   = document.getElementById("fecha");
const categoriaSel = document.getElementById("categoria");
const servicioSel  = document.getElementById("servicio");
const lugarInput   = document.getElementById("lugar");
const detalleInput = document.getElementById("detalle");

const verMes       = document.getElementById("verMes");
const tablaBody    = document.querySelector("#tablaAgenda tbody");
const estado       = document.getElementById("estado");

const btnAgregar   = document.getElementById("btnAgregar");
const btnExcel     = document.getElementById("btnExcel");
const btnBorrar    = document.getElementById("btnBorrarTodo");

/* ============================================
   NOMBRE DEL STORAGE
   ============================================ */
const STORAGE = "agenda2026_pro";

/* ============================================
   LEER STORAGE
   ============================================ */
function cargarAgenda() {
  const data = localStorage.getItem(STORAGE);
  return data ? JSON.parse(data) : [];
}

/* ============================================
   GUARDAR STORAGE
   ============================================ */
function guardarAgenda(lista) {
  localStorage.setItem(STORAGE, JSON.stringify(lista));
}

/* ============================================
   AGREGAR ACTIVIDAD
   ============================================ */
btnAgregar.onclick = () => {

  if (!fechaInput.value) return mostrar("⚠️ Debes elegir una fecha.");
  if (!categoriaSel.value) return mostrar("⚠️ La categoría es obligatoria.");
  if (!detalleInput.value.trim()) return mostrar("⚠️ El detalle no puede estar vacío.");

  let actividades = cargarAgenda();

  const nueva = {
    fecha: fechaInput.value,
    categoria: categoriaSel.value,
    servicio: servicioSel.value,
    lugar: lugarInput.value.trim(),
    detalle: detalleInput.value.trim()
  };

  actividades.push(nueva);

  /* ORDENAR autom. por fecha */
  actividades.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  guardarAgenda(actividades);
  mostrar("✔ Actividad agregada");

  limpiarFormulario();
  mostrarTabla();
};

/* ============================================
   BORRAR TODO AÑO
   ============================================ */
btnBorrar.onclick = () => {
  if (confirm("¿Seguro que deseas borrar TODA la agenda 2026?")) {
    localStorage.removeItem(STORAGE);
    mostrarTabla();
    mostrar("🗑 Agenda borrada.");
  }
};

/* ============================================
   EXPORTAR EXCEL
   ============================================ */
btnExcel.onclick = () => {
  let actividades = cargarAgenda();
  if (actividades.length === 0) return mostrar("⚠️ No hay datos para exportar.");

  const ws = XLSX.utils.json_to_sheet(actividades);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Agenda2026");

  XLSX.writeFile(wb, "AGENDA_TRANSPORTES_2026.xlsx");

  mostrar("📄 Archivo Excel generado");
};

/* ============================================
   LIMPIAR FORMULARIO
   ============================================ */
function limpiarFormulario() {
  fechaInput.value = "";
  categoriaSel.value = "Operativo";
  servicioSel.value = "(Opcional)";
  lugarInput.value = "";
  detalleInput.value = "";
}

/* ============================================
   MOSTRAR ESTADO (animado)
   ============================================ */
function mostrar(txt) {
  estado.textContent = txt;
  estado.style.opacity = "1";
  setTimeout(() => estado.style.opacity = "0.3", 2500);
}

/* ============================================
   MOSTRAR TABLA POR MES
   ============================================ */
function mostrarTabla() {
  tablaBody.innerHTML = "";

  const actividades = cargarAgenda();
  const mesFiltro = parseInt(verMes.value); // 1-12 o 0 = todos

  let filtradas = actividades.filter(a => {
    let mes = new Date(a.fecha).getMonth() + 1;
    return mesFiltro === 0 ? true : mes === mesFiltro;
  });

  filtradas.forEach(a => {
    let fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${formatearFecha(a.fecha)}</td>
      <td>${a.categoria}</td>
      <td>${a.servicio}</td>
      <td>${a.lugar}</td>
      <td>${a.detalle}</td>
    `;
    tablaBody.appendChild(fila);
  });

  if (filtradas.length === 0) {
    tablaBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;color:#8fffff;">
          No hay actividades para este mes.
        </td>
      </tr>`;
  }
}

/* ============================================
   FORMATEAR FECHA A dd/mm/aaaa
   ============================================ */
function formatearFecha(fecha) {
  const f = new Date(fecha);
  let d = f.getDate().toString().padStart(2, "0");
  let m = (f.getMonth() + 1).toString().padStart(2, "0");
  let y = f.getFullYear();
  return `${d}/${m}/${y}`;
}

/* ============================================
   CAMBIO DE MES
   ============================================ */
verMes.onchange = mostrarTabla;

/* ============================================
   INICIO
   ============================================ */
mostrarTabla();
mostrar("Agenda lista para trabajar");
