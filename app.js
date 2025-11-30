let BD = [];
const estado = document.getElementById("estado");
const input = document.getElementById("busquedaInput");
const btnBuscar = document.getElementById("btnBuscar");
const listaResultados = document.getElementById("contenidoResultados");
const detalle = document.getElementById("detalleRegistro");

// Cargar JSON
async function cargarJSON() {
    try {
        const resp = await fetch("placas.json?nocache=" + Date.now());
        BD = await resp.json();

        estado.textContent = `Archivo cargado. Registros: ${BD.length}`;
        estado.style.color = "#00eaff";
    } catch (err) {
        estado.textContent = "Error cargando placas.json";
        estado.style.color = "red";
        console.error(err);
    }
}

cargarJSON();

// Normalizar texto para búsquedas
function normalizar(txt) {
    return txt.toString().toLowerCase().replace(/\s|-/g, "");
}

// Buscar registros
function buscar() {
    const q = normalizar(input.value);
    listaResultados.innerHTML = "";
    detalle.innerHTML = "";

    if (q.length < 2) return;

    const resultados = BD.filter(reg => {
        return Object.values(reg).some(v =>
            normalizar(v ?? "").includes(q)
        );
    });

    if (resultados.length === 0) {
        listaResultados.innerHTML = `<div class="itemResultado">Sin resultados…</div>`;
        return;
    }

    resultados.forEach((reg, i) => {
        const div = document.createElement("div");
        div.className = "itemResultado";
        div.innerHTML = `
            <b>${reg["placas"] ?? reg["NO. PLACA"] ?? "SIN PLACA"}</b>
            — ${reg["nombre del conductor"] || "SIN NOMBRE"}
        `;
        div.onclick = () => mostrarDetalle(reg);
        listaResultados.appendChild(div);
    });
}

// Mostrar detalle expandido
function mostrarDetalle(reg) {
    detalle.innerHTML = `
        <div class="tarjetaDetalle">
            <h3>Detalle completo</h3>
            <hr>
            ${Object.entries(reg)
                .map(([k, v]) => `
                    <div class="fila">
                        <span class="campo">${k}:</span>
                        <span class="valor">${v}</span>
                    </div>
                `)
                .join("")}
        </div>
    `;

    detalle.scrollIntoView({ behavior: "smooth" });
}

// Eventos
btnBuscar.onclick = buscar;
input.addEventListener("keyup", e => {
    if (e.key === "Enter") buscar();
});
