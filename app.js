// URL OFICIAL DEL JSON EN RAW
const DATA_URL = "https://raw.githubusercontent.com/gelm2mil/buscador/main/placas.json";

let registros = [];
let similares = [];
let ultimoFiltro = "";

document.addEventListener("DOMContentLoaded", cargarJSON);

async function cargarJSON() {
    try {
        document.getElementById("estado").textContent = "Cargando archivo JSON...";

        const resp = await fetch(DATA_URL + "?v=" + Date.now(), { cache: "no-store" });
        if (!resp.ok) throw new Error("No se pudo descargar placas.json");

        registros = await resp.json();

        document.getElementById("estado").textContent =
            `Archivo cargado correctamente. Registros: ${registros.length}`;

    } catch (err) {
        console.error(err);
        document.getElementById("estado").textContent = "Error: " + err.message;
    }
}

function normalizar(txt) {
    return txt.toString().replace(/\s+/g, "").replace(/-/g, "").toUpperCase().trim();
}

function esc(s) {
    return s.toString().replace(/</g, "&lt;");
}

function construirTabla(r) {
    return `
        <table>
            <tr>
                <th>SERIE</th><th>BOLETA</th><th>FECHA</th><th>HORA</th>
                <th>PLACA</th><th>TIPO</th><th>MARCA</th><th>COLOR</th>
                <th>DIRECCIÓN</th><th>DEPTO</th><th>MUNI</th><th>CONDUCTOR</th>
                <th>LIC</th><th>No. LICENCIA</th><th>ARTÍCULO</th>
                <th>DESCRIPCIÓN</th><th>CHAPA</th>
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

// ====================== BUSCADOR ======================
function buscar() {

    const texto = document.getElementById("busquedaInput").value.trim();
    if (!texto) return;

    ultimoFiltro = texto;
    const limpio = normalizar(texto);

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
        if (normalizar(reg.descripcion).includes(limpio)) p = 60;

        if (p > 0) coincidencias.push({ reg, p });
    });

    if (coincidencias.length === 0) {
        divPrincipal.innerHTML = `<p>No se encontró <strong>${esc(texto)}</strong>.</p>`;
        return;
    }

    coincidencias.sort((a, b) => b.p - a.p);

    divPrincipal.innerHTML = construirTabla(coincidencias[0].reg);

    similares = coincidencias.slice(1).map(c => c.reg);

    if (similares.length > 0) {
        let ops = "<option value=''>-- seleccionar --</option>";
        similares.forEach((r, i) => {
            ops += `<option value="${i}">Placa ${r.placa} · Chapa ${r.chapa} · ${r.tipo}</option>`;
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

function mostrarSimilar(i) {
    if (isNaN(i)) return;
    document.getElementById("resultado-principal").innerHTML =
        construirTabla(similares[i]);
}

// ====================== EXPORTAR ======================
function exportarExcelPRO() {

    if (!ultimoFiltro) {
        alert("Papi, primero hacé una búsqueda.");
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

    const nombre = `MULTAS_${ultimoFiltro.toUpperCase()}.xlsx`;

    XLSX.writeFile(libro, nombre);
    alert("Archivo Excel PRO MAX descargado ✨");
}
