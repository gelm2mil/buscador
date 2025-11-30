/* ===========================
   CARGA DEL JSON COMPLETO
=========================== */
let registros = [];
let resultados = [];

// Normalizador avanzado
function normalizar(txt) {
    return String(txt || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "")
        .replace(/[-_.]/g, "");
}

// Escape HTML
function esc(t) {
    return String(t || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// Cargar JSON
fetch("placas.json")
    .then(r => r.json())
    .then(json => {
        registros = json;
        document.getElementById("estado").textContent =
            `Archivo cargado ✔ Registros: ${json.length}`;
    })
    .catch(err => {
        console.error(err);
        document.getElementById("estado").textContent =
            "Error cargando placas.json ❌";
    });

/* ===========================
   BUSCADOR PRINCIPAL
=========================== */
document.getElementById("btnBuscar").addEventListener("click", buscar);
document.getElementById("busquedaInput").addEventListener("keydown", e => {
    if (e.key === "Enter") buscar();
});

function buscar() {
    const q = document.getElementById("busquedaInput").value.trim();
    const qNorm = normalizar(q);

    if (qNorm.length < 2) {
        alert("Ingrese mínimo 2 caracteres");
        return;
    }

    resultados = [];

    registros.forEach(reg => {
        const filaCompleta = Object.values(reg).join(" ");
        const filaNorm = normalizar(filaCompleta);

        if (filaNorm.includes(qNorm)) {
            resultados.push(reg);
        }
    });

    mostrarResultadosCompactos();
}

/* ===========================
   LISTA COMPACTA PMT–FULL
=========================== */
function mostrarResultadosCompactos() {
    const cont = document.getElementById("resultadosLista");
    const detalle = document.getElementById("detalleRegistro");

    cont.innerHTML = "";
    detalle.innerHTML = "";

    if (resultados.length === 0) {
        cont.innerHTML = `<div class="nope">❌ No se encontraron resultados.</div>`;
        return;
    }

    resultados.forEach((reg, index) => {
        const placa = reg["placas"] || reg["placa"] || "SIN PLACA";
        const boleta = reg["No. Boleta"] || "—";
        const fecha = reg["fecha"] || "—";
        const art = reg["articulo"] || reg["Articulo"] || "—";

        const item = document.createElement("div");
        item.className = "itemCompacto";
        item.innerHTML = `
            <div class="item-placa">${esc(placa)}</div>
            <div class="item-info">
                <span>Boleta: ${esc(boleta)}</span> -
                <span>Fecha: ${esc(fecha)}</span> -
                <span>Art: ${esc(art)}</span>
            </div>
        `;

        item.addEventListener("click", () => mostrarDetalle(reg));

        cont.appendChild(item);
    });
}

/* ===========================
   DETALLE COMPLETO TIPO PMT
=========================== */
function mostrarDetalle(r) {
    const d = document.getElementById("detalleRegistro");

    d.innerHTML = "";

    let html = `
    <div class="detalleTitulo">
        DETALLE DEL REGISTRO
    </div>
    <table class="tablaDetalle">
    `;

    for (let k in r) {
        html += `
        <tr>
            <th>${esc(k)}</th>
            <td>${esc(r[k])}</td>
        </tr>
        `;
    }

    html += `</table>`;

    d.innerHTML = html;
}
