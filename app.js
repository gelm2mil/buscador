// ================== CARGA DEL JSON ==================
let datos = [];

const estadoEl = document.getElementById("estado");
const inputEl  = document.getElementById("busquedaInput");
const btnBuscar = document.getElementById("btnBuscar");

fetch("placas.json")
    .then(res => res.json())
    .then(json => {
        datos = json;
        estadoEl.textContent = "Archivo cargado ✔️";
    })
    .catch(() => estadoEl.textContent = "Error cargando archivo ❌");


// ================== NORMALIZAR ==================
function normalizar(txt) {
    return String(txt || "")
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "")
        .replace(/[-_.]/g, "");
}


// ================== BUSCAR ==================
function buscar() {
    const q = inputEl.value.trim();
    if (q.length < 2) {
        alert("Ingrese mínimo 2 caracteres.");
        return;
    }

    const qNorm = normalizar(q);

    const encontrados = datos.filter(row =>
        Object.values(row).some(col => normalizar(col).includes(qNorm))
    );

    mostrarListaCompacta(encontrados);
}


// ================== LISTA COMPACTA ==================
function mostrarListaCompacta(lista) {
    const panel = document.getElementById("resultadosLista");
    const cont = document.getElementById("contenidoResultados");
    const det = document.getElementById("detalleRegistro");

    cont.innerHTML = "";
    det.style.display = "none";
    panel.style.display = "none";

    if (lista.length === 0) {
        panel.style.display = "block";
        cont.innerHTML = "<div style='color:red'>❌ Sin resultados</div>";
        return;
    }

    document.getElementById("tituloResultados").textContent =
        `Resultados encontrados: ${lista.length}`;

    lista.forEach(registro => {
        const linea = document.createElement("div");
        linea.classList.add("lineaRegistro");
        linea.textContent = Object.values(registro).join(" | ");
        linea.onclick = () => mostrarDetalle(registro);
        cont.appendChild(linea);
    });

    panel.style.display = "block";
}


// ================== DETALLE ==================
function mostrarDetalle(registro) {
    const panel = document.getElementById("detalleRegistro");
    panel.innerHTML = "";

    for (let [key, val] of Object.entries(registro)) {
        panel.innerHTML += `
            <div class="detCampo">
                <b>${key.toUpperCase()}:</b> ${val || "—"}
            </div>
        `;
    }

    panel.style.display = "block";
}


// ================== EVENTOS ==================
btnBuscar.addEventListener("click", buscar);

inputEl.addEventListener("keydown", e => {
    if (e.key === "Enter") buscar();
});
