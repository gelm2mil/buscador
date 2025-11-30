let registros = [];
let columnas = [];

// ============================
// CARGAR JSON AUTOMÁTICAMENTE
// ============================
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


// ============================
//    FUNCIÓN PRINCIPAL
// ============================
document.getElementById("btnBuscar").addEventListener("click", buscar);

function buscar() {
    const texto = document.getElementById("busquedaInput").value.trim();
    if (!texto) return;

    const limpio = clean(texto);

    const divPrincipal = document.getElementById("resultadoPrincipal");
    const divSimilares = document.getElementById("similares");
    divSimilares.innerHTML = "";

    let coincidencias = [];

    registros.forEach(reg => {
        let prioridad = 0;

        const placa = (reg.placa || "").toUpperCase();
        const calco = (reg.calcomania || "").toUpperCase();
        const dpi = clean(reg.dpi || "");
        const lic = clean(reg.licencia || "");
        const doc = clean(reg.documento || "");

        if (placa === texto.toUpperCase()) prioridad = 90;
        if (clean(placa) === limpio) prioridad = 85;
        if (calco === texto || calco === limpio) prioridad = 95;
        if (dpi === limpio) prioridad = 80;
        if (lic === limpio) prioridad = 75;
        if (doc === limpio) prioridad = 70;

        if (prioridad > 0) {
            coincidencias.push({ reg, prioridad });
        }
    });

    if (coincidencias.length === 0) {
        divPrincipal.innerHTML = `<p>No se encontró <strong>${texto}</strong>.</p>`;
        return;
    }

    coincidencias.sort((a, b) => b.prioridad - a.prioridad);

    const principal = coincidencias[0].reg;
    const otros = coincidencias.slice(1).map(c => c.reg);

    divPrincipal.innerHTML = generarTabla(principal);

    if (otros.length > 0) {
        let options = `<option value="">-- seleccionar --</option>`;
        otros.forEach((r, i) => {
            const txt = `${r.calcomania} | ${r.ruta} | ${r.placa}`;
            options += `<option value="${i}">${txt}</option>`;
        });

        divSimilares.innerHTML = `
            <label>SIMILARES:</label>
            <select id="selectSimilares">${options}</select>
        `;

        document
            .getElementById("selectSimilares")
            .addEventListener("change", e => {
                if (e.target.value === "") return;
                const index = parseInt(e.target.value);
                divPrincipal.innerHTML = generarTabla(otros[index]);
            });
    }
}

// ============================
//  TABLA DETALLE COMPLETO
// ============================

function generarTabla(r) {
    return `
        <table class="tablaDetalle">
            <tr><th>NO. PLACA</th><td>${r.placa}</td></tr>
            <tr><th>NO. CALCOMANÍA</th><td>${r.calcomania}</td></tr>
            <tr><th>PLACA SALE</th><td>${r.placa_sale}</td></tr>
            <tr><th>CONCESIONARIO</th><td>${r.concesionario}</td></tr>
            <tr><th>TEL. DUEÑO</th><td>${r.tel_dueno}</td></tr>
            <tr><th>RUTA</th><td>${r.ruta}</td></tr>
            <tr><th>TEL. PILOTOS</th><td>${r.tel_pilotos}</td></tr>
            <tr><th>NOMBRE DEL PILOTO</th><td>${r.nombre_piloto}</td></tr>
            <tr><th>DPI</th><td>${r.dpi}</td></tr>
            <tr><th>DOCUMENTO</th><td>${r.documento}</td></tr>
            <tr><th>LICENCIA</th><td>${r.licencia}</td></tr>
            <tr><th>TIPO LICENCIA</th><td>${r.tipo_licencia}</td></tr>
        </table>
    `;
}
