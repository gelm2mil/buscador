let registros = [];
let columnas = [];

// =======================
// CARGAR JSON AUTOMÁTICAMENTE
// =======================
fetch("placas.json")
    .then(r => r.json())
    .then(data => {
        registros = data;
        columnas = Object.keys(data[0] || {});
        document.getElementById("estado").innerText =
            "Archivo cargado. Registros: " + registros.length;
    })
    .catch(err => {
        console.error(err);
        document.getElementById("estado").innerText = "Error cargando JSON";
    });

// Normalizar texto
const clean = t =>
    t.toString().replace(/\s+/g, "").replace(/-/g, "").toUpperCase();

// =======================
// FUNCIÓN PRINCIPAL DE BÚSQUEDA
// =======================
document.getElementById("btnBuscar").addEventListener("click", buscar);

function buscar() {
    const texto = document.getElementById("busquedaInput").value.trim();
    if (!texto) return;

    const limpio = clean(texto);
    const mayus = texto.toUpperCase();

    const cont = document.getElementById("contenidoResultados");
    cont.innerHTML = "";

    let coincidencias = [];

    registros.forEach((reg) => {
        let prio = 0;

        let placa = reg["placas"] || reg["placa"] || "";
        let licencia = reg["No. Licencia"] || "";
        let dpi = reg["dpi"] || "";
        let documento = reg["documento"] || "";
        let calcom = reg["No. Calcomania"] || "";

        if (clean(placa) === limpio) prio = 100;
        if (clean(licencia) === limpio) prio = 90;
        if (clean(dpi) === limpio) prio = 80;
        if (clean(documento) === limpio) prio = 70;
        if (clean(calcom) === limpio) prio = 60;

        if (prio > 0) coincidencias.push({ reg, prio });
    });

    if (coincidencias.length === 0) {
        cont.innerHTML = `<div class="noExiste">No encontrado: ${texto}</div>`;
        return;
    }

    coincidencias.sort((a, b) => b.prio - a.prio);

    coincidencias.forEach(obj => {
        crearTarjeta(obj.reg);
    });
}

// =======================
// TARJETAS PROFESIONALES
// =======================
function crearTarjeta(reg) {
    const cont = document.getElementById("contenidoResultados");

    let placa = reg["placas"] || reg["placa"] || "SIN PLACA";
    let nombre = reg["nombre del conductor"] || "SIN NOMBRE";
    let fecha = reg["fecha"] || "";
    let hora = reg["hora"] || "";
    let tipo = reg["tipo"] || "";

    let card = document.createElement("div");
    card.className = "tarjeta";

    card.innerHTML = `
        <div class="tarjetaHead">
            <span class="placa">${placa}</span>
            <span class="info">${tipo} — ${fecha} ${hora}</span>
        </div>

        <div class="detalle" style="display:none;">
            ${generarDetalle(reg)}
        </div>
    `;

    // Abrir/cerrar detalle
    card.querySelector(".tarjetaHead").addEventListener("click", () => {
        let d = card.querySelector(".detalle");
        d.style.display = d.style.display === "none" ? "block" : "none";
    });

    cont.appendChild(card);
}

// =======================
// DETALLE LIMPIO
// =======================
function generarDetalle(reg) {
    let html = `<div class="detalleBox">`;

    columnas.forEach(c => {
        let valor = reg[c];
        if (valor === null || valor === "" || c.includes("Unnamed")) return;

        html += `
            <div class="fila">
                <span class="campo">${c}:</span>
                <span class="valor">${valor}</span>
            </div>
        `;
    });

    html += "</div>";
    return html;
}
