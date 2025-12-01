// =====================================================
//                ⚡ CONFIGURACIÓN ⚡
// =====================================================
const DATA_URL = "placas.json";   // LOCAL - SIEMPRE FUNCIONA

let registros = [];
let similares = [];
let ultimoFiltro = "";  // Para exportar EXCEL


document.addEventListener("DOMContentLoaded", cargarJSON);

// =====================================================
//                ⚡ CARGAR JSON ⚡
// =====================================================
async function cargarJSON() {
    try {
        document.getElementById("estado").textContent = "Cargando archivo JSON...";

        const resp = await fetch(DATA_URL, { cache: "no-store" });

        if (!resp.ok) throw new Error("No se pudo cargar placas.json");

        registros = await resp.json();

        document.getElementById("estado").textContent =
            "Archivo cargado correctamente. Registros: " + registros.length;

    } catch (err) {
        console.error("ERROR JSON:", err);
        document.getElementById("estado").textContent = "Error: " + err.message;
    }
}



// =====================================================
//           ⚡ NORMALIZADOR ANTI-ERRORES ⚡
// =====================================================
function normalizar(txt) {

    // Si viene undefined, null, número, vacío → SIEMPRE devolver string limpia
    if (!txt) return "";

    return String(txt)
        .replace(/\s+/g, "")   // quitar espacios
        .replace(/-/g, "")     // quitar guiones
        .toUpperCase()
        .trim();
}



// =====================================================
//                  ⚡ ESCAPAR HTML ⚡
// =====================================================
function esc(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}



// =====================================================
//            ⚡ TABLA ULTRA COMPLETA ⚡
// =====================================================
function construirTabla(r) {
    return `
        <table>
            <tr>
                <th>SERIE</th>
                <th>BOLETA</th>
                <th>FECHA</th>
                <th>HORA</th>
                <th>PLACA</th>
                <th>TIPO</th>
                <th>MARCA</th>
                <th>COLOR</th>
                <th>DIRECCIÓN</th>
                <th>DEPARTAMENTO</th>
                <th>MUNICIPIO</th>
                <th>CONDUCTOR</th>
                <th>LIC</th>
                <th>No. LICENCIA</th>
                <th>ARTÍCULO</th>
                <th>DESCRIPCIÓN</th>
                <th>CHAPA</th>
            </tr>
            <tr>
                <td>${esc(r.serie)}</td>
                <td>${esc(r.boleta)}</td>
                <td>${esc(r.fecha)}</td>
                <td>${esc(r.hora)}</td>
                <td>${esc(r.placa)}</td>
                <td>${esc(r.tipo)}</td>
                <td>${esc(r.marca)}</td>
                <td>${esc(r.color)}</td>
                <td>${esc(r.direccion)}</td>
                <td>${esc(r.departamento)}</td>
                <td>${esc(r.municipio)}</td>
                <td>${esc(r.conductor)}</td>
                <td>${esc(r.licTipo)}</td>
                <td>${esc(r.licencia)}</td>
                <td>${esc(r.articulo)}</td>
                <td>${esc(r.descripcion)}</td>
                <td>${esc(r.chapa)}</td>
            </tr>
        </table>
    `;
}



// =====================================================
//                  ⚡ BUSCADOR PRO MAX ⚡
// =====================================================
function buscar() {

    const texto = document.getElementById("busquedaInput").value.trim();

    if (!texto) {
        document.getElementById("resultado-principal").innerHTML =
            "<p>Ingrese algo para buscar.</p>";
        return;
    }

    const limpio = normalizar(texto);
    ultimoFiltro = texto;

    const divPrincipal = document.getElementById("resultado-principal");
    const divSim = document.getElementById("similares-contenedor");

    divSim.innerHTML = "";
    similares = [];

    const coincidencias = [];

    registros.forEach(reg => {

        let p = 0;

        if (normalizar(reg.chapa) === limpio) p = 110;
        if (normalizar(reg.placa) === limpio) p = 100;
        if (normalizar(reg.licencia) === limpio) p = 90;
        if (normalizar(reg.boleta) === limpio) p = 80;
        if (normalizar(reg.dpi) === limpio) p = 70;

        // búsqueda por descripción parcial
        if (normalizar(reg.descripcion).includes(limpio)) p = 60;

        if (p > 0)
            coincidencias.push({ reg, p });

    });

    if (coincidencias.length === 0) {
        divPrincipal.innerHTML =
            `<p>No se encontró <strong>${esc(texto)}</strong>.</p>`;
        return;
    }

    coincidencias.sort((a, b) => b.p - a.p);

    const principal = coincidencias[0].reg;
    const otros = coincidencias.slice(1).map(c => c.reg);

    divPrincipal.innerHTML = construirTabla(principal);

    if (otros.length > 0) {

        similares = otros;

        let ops = "<option value=''>-- seleccionar --</option>";

        otros.forEach((r, i) => {
            ops += `<option value="${i}">Placa ${r.placa} · Chapa ${r.chapa}</option>`;
        });

        divSim.innerHTML = `
            <div class="similares-box">
                <label>SIMILARES:</label>
                <select id="similaresSelect" onchange="mostrarSimilar(this.value)">
                    ${ops}
                </select>
            </div>
        `;
    }
}



// =====================================================
//        ⚡ MOSTRAR SIMILAR (PRO MAX SEGURO) ⚡
// =====================================================
function mostrarSimilar(i) {
    if (i === "" || isNaN(i)) return;
    document.getElementById("resultado-principal").innerHTML =
        construirTabla(similares[i]);
}



// =====================================================
//           ⚡ EXPORTAR EXCEL PRO MAX ⚡
// =====================================================
function exportarExcelPRO() {

    if (!ultimoFiltro) {
        alert("Primero realiza una búsqueda, papi 🙏");
        return;
    }

    const limpio = normalizar(ultimoFiltro);

    const datos = registros.filter(reg =>
        normalizar(reg.chapa) === limpio ||
        normalizar(reg.placa) === limpio ||
        normalizar(reg.licencia) === limpio ||
        normalizar(reg.boleta) === limpio ||
        normalizar(reg.dpi) === limpio ||
        normalizar(reg.descripcion).includes(limpio)
    );

    if (datos.length === 0) {
        alert("No hay datos para exportar 😢");
        return;
    }

    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "MULTAS");

    const nombre = `MULTAS_${ultimoFiltro.toUpperCase()}_${new Date().toLocaleDateString("es-GT")}.xlsx`;

    XLSX.writeFile(libro, nombre);

    alert("Archivo Excel descargado ✨");
}
