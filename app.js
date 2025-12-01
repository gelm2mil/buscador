// ============================================================
//  BUSCADOR PMT 2025 — BY GELM — VERSION JSON OPTIMIZADA
// ============================================================

const DATA_URL = "https://raw.githubusercontent.com/gelm2mil/buscador/main/placas.json";

let registros = [];
let similares = [];

// ============================================================
//  CARGAR ARCHIVO JSON
// ============================================================
async function cargarJSON() {
    const estado = document.getElementById("estado");

    try {
        estado.textContent = "Cargando archivo JSON...";

        const resp = await fetch(DATA_URL, { cache: "no-store" });
        if (!resp.ok) throw new Error("No se pudo descargar placas.json");

        registros = await resp.json();

        estado.textContent = "Archivo cargado. Registros: " + registros.length;
    } catch (err) {
        console.error(err);
        estado.textContent = "Error: " + err.message;
    }
}

// Normalizar texto para búsquedas (quita espacios, guiones y pone mayúsculas)
function normalizar(txt) {
    if (!txt) return "";
    return txt.toString().replace(/\s+/g, "").replace(/-/g, "").trim().toUpperCase();
}

// Escape básico para HTML
function esc(str) {
    return str
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// ============================================================
//  TABLA HTML DEL RESULTADO PRINCIPAL
// ============================================================
function construirTabla(r) {
    if (!r) return "";

    return `
        <table>
            <tr>
                <th>Serie</th>
                <th>No. Boleta</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Placa</th>
                <th>Tipo</th>
                <th>Marca</th>
                <th>Color</th>
                <th>Dirección</th>
                <th>Departamento</th>
                <th>Municipio</th>
                <th>Conductor</th>
                <th>Lic.</th>
                <th>No. Licencia</th>
                <th>Artículo</th>
                <th>Descripción</th>
                <th>Chapa</th>
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

// ============================================================
//  BUSCAR
// ============================================================
function buscar() {
    const texto = document.getElementById("busquedaInput").value.trim();
    const limpio = normalizar(texto);

    const divPrincipal = document.getElementById("resultado-principal");
    const divSimilares = document.getElementById("similares-contenedor");

    divSimilares.innerHTML = "";
    similares = [];

    if (!texto) {
        divPrincipal.innerHTML = "<p>Escribe un dato para buscar.</p>";
        return;
    }

    // Buscamos coincidencias en todos los campos
    const coincidencias = [];

    registros.forEach((reg) => {
        let prioridad = 0;

        const campos = [
            reg.serie,
            reg.boleta,
            reg.fecha,
            reg.fecha2,
            reg.hora,
            reg.placa,
            reg.tipo,
            reg.marca,
            reg.color,
            reg.direccion,
            reg.departamento,
            reg.municipio,
            reg.conductor,
            reg.licTipo,
            reg.licencia,
            reg.articulo,
            reg.descripcion,
            reg.chapa
        ];

        // Normalizar cada campo
        const camposNormalizados = campos.map(c => normalizar(c));

        // Prioridades fuertes
        if (normalizar(reg.placa) === limpio) prioridad = 100;
        else if (normalizar(reg.licencia) === limpio) prioridad = 95;
        else if (normalizar(reg.boleta) === limpio) prioridad = 90;
        else if (camposNormalizados.includes(limpio)) prioridad = 70;

        // Coincidencias parciales
        if (reg.descripcion && reg.descripcion.toUpperCase().includes(texto.toUpperCase()))
            prioridad = Math.max(prioridad, 40);

        if (prioridad > 0) coincidencias.push({ reg, prioridad });
    });

    if (coincidencias.length === 0) {
        divPrincipal.innerHTML = `<p>No se encontró <strong>${esc(texto)}</strong>.</p>`;
        return;
    }

    // Ordenar por prioridad
    coincidencias.sort((a, b) => b.prioridad - a.prioridad);

    // Principal
    const principal = coincidencias[0].reg;
    const otros = coincidencias.slice(1).map(c => c.reg);
    similares = otros;

    divPrincipal.innerHTML = construirTabla(principal);

    // Mostrar SIMILARES
    if (otros.length > 0) {
        let opciones = '<option value="">-- seleccionar --</option>';

        otros.forEach((r, idx) => {
            opciones += `<option value="${idx}">
                ${esc(r.placa)} — ${esc(r.tipo)} — ${esc(r.descripcion.substring(0, 30))}...
            </option>`;
        });

        divSimilares.innerHTML = `
            <div class="similares-box">
                <label class="similares-label">SIMILARES:</label>
                <select onchange="mostrarSimilar(this.value)">
                    ${opciones}
                </select>
            </div>
        `;
    }
}

// ============================================================
//  MOSTRAR SIMILAR
// ============================================================
function mostrarSimilar(indice) {
    indice = parseInt(indice);
    if (isNaN(indice) || !similares[indice]) return;

    const divPrincipal = document.getElementById("resultado-principal");
    divPrincipal.innerHTML = construirTabla(similares[indice]);
}

// ============================================================
//  RELOJ EN FOOTER
// ============================================================
function actualizarFechaHora() {
    const ahora = new Date();
    const fecha = ahora.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const hora = ahora.toLocaleTimeString("es-ES");
    document.getElementById("fechaHora").textContent = fecha + " • " + hora;
}
setInterval(actualizarFechaHora, 1000);

// ============================================================
//  INICIO
// ============================================================
cargarJSON();
actualizarFechaHora();
