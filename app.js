let BD = [];
const estado = document.getElementById("estado");
const input = document.getElementById("busquedaInput");
const btnBuscar = document.getElementById("btnBuscar");
const listaResultados = document.getElementById("resultadosLista");
const detalle = document.getElementById("detalleRegistro");

// Cargar JSON
async function cargarJSON() {
    try {
        const resp = await fetch("placas.json?noCache=" + Date.now());
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

// Normalización
function normalizar(txt) {
    return txt.toString().toLowerCase().replace(/\s|-/g, "");
}

// Buscar
function buscar() {
    const q = normalizar(input.value);
    listaResultados.innerHTML = "";
    detalle.innerHTML = "";

    if (q.length < 2) return;

    const resultados = BD.filter(reg =>
        Object.values(reg).some(v => normalizar(v ?? "").includes(q))
    );

    if (resultados.length === 0) {
        listaResultados.innerHTML = `<div class="itemResultado">Sin resultados…</div>`;
        return;
    }

    resultados.forEach(reg => {
        const div = document.createElement("div");
        div.className = "itemResultado";

        const placa = reg["placas"] || reg["NO. PLACA"] || "SIN PLACA";
        const nombre = reg["nombre del conductor"] || "SIN NOMBRE";

        div.innerHTML = `<b>${placa}</b> — ${nombre}`;
        div.onclick = () => mostrarDetalle(reg);

        listaResultados.appendChild(div);
    });
}

// Mostrar tarjeta detalle
function mostrarDetalle(reg) {
    detalle.innerHTML = `
        <div class="tarjetaDetalle">
            <h3 style="color:#00eaff;text-shadow:0 0 8px #00eaff">DETALLE COMPLETO</h3>
            <hr>
            ${Object.entries(reg).map(([k, v]) =>
                `<div class="fila"><span class="campo">${k}:</span><span class="valor">${v}</span></div>`
            ).join("")}
        </div>
    `;

    detalle.scrollIntoView({ behavior: "smooth" });
}

btnBuscar.onclick = buscar;
input.addEventListener("keyup", e => { if (e.key === "Enter") buscar(); });
