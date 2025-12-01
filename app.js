// ==================== CONFIG ====================
const DATA_URL = "https://raw.githubusercontent.com/gelm2mil/buscador/main/placas.json";

let registros = [];
let similares = [];

document.addEventListener("DOMContentLoaded", cargarJSON);

// ==================== CARGAR JSON ====================
async function cargarJSON() {
    try {
        document.getElementById("estado").textContent = "Cargando archivo JSON...";

        const resp = await fetch(DATA_URL, { cache: "no-store" });
        if (!resp.ok) throw new Error("No se pudo descargar placas.json");

        registros = await resp.json();

        document.getElementById("estado").textContent =
            "Archivo cargado correctamente. Registros: " + registros.length;

    } catch (err) {
        console.error(err);
        document.getElementById("estado").textContent = "Error: " + err.message;
    }
}

// ==================== FUNCIONES ====================
function normalizar(txt) {
    return txt.toString()
        .replace(/\s+/g, "")
        .replace(/-/g, "")
        .toUpperCase()
        .trim();
}

function esc(str) {
    return str.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// ==================== TABLA ====================
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

// ==================== BUSCADOR ====================
function buscar() {
    const texto = document.getElementById("busquedaInput").value.trim();
    const limpio = normalizar(texto);
    const valor = texto.toUpperCase();

    const divPrincipal = document.getElementById("resultado-principal");
    const divSim = document.getElementById("similares-contenedor");

    divSim.innerHTML = "";
    similares = [];

    if (!texto) {
        divPrincipal.innerHTML = "<p>Ingrese una búsqueda válida.</p>";
        return;
    }

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

    const principal = coincidencias[0].reg;
    const otros = coincidencias.slice(1).map(c => c.reg);

    divPrincipal.innerHTML = construirTabla(principal);

    if (otros.length > 0) {
        similares = otros;

        let ops = "<option value=''>-- seleccionar --</option>";

        otros.forEach((r, i) => {
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

// ==================== FECHA/HORA ====================
setInterval(() => {
    const f = new Date();
    document.getElementById("fechaHora").textContent =
        f.toLocaleDateString("es-ES", { weekday:"long", year:"numeric", month:"long", day:"numeric" }) +
        " — " + f.toLocaleTimeString("es-ES");
}, 1000);
