let registros = [];

async function cargarJSON() {
    try {
        const res = await fetch("placas.json");
        registros = await res.json();

        document.getElementById("estado").innerText =
            "Archivo cargado ✓ Registros: " + registros.length;

    } catch (e) {
        console.error(e);
        document.getElementById("estado").innerText = "Error cargando JSON";
    }
}
cargarJSON();

// Limpieza
const clean = t =>
    t.toString().replace(/\s+/g, "").replace(/-/g, "").toUpperCase();

// Buscar
document.getElementById("btnBuscar").addEventListener("click", buscar);

function buscar() {
    const txt = document.getElementById("busquedaInput").value.trim();
    const limpio = clean(txt);

    const lista = document.getElementById("resultadosLista");
    const detalle = document.getElementById("detalleRegistro");

    lista.innerHTML = "";
    detalle.innerHTML = "";

    if (!txt) return;

    const encontrados = registros.filter(r =>
        clean(r.placas) === limpio ||
        clean(r["No. Licencia"]) === limpio ||
        clean(r.lic) === limpio ||
        clean(r.documento || "") === limpio
    );

    if (encontrados.length === 0) {
        lista.innerHTML = `<div class="noResult">Sin resultados para: ${txt}</div>`;
        return;
    }

    encontrados.forEach((r, idx) => {
        const div = document.createElement("div");
        div.className = "itemResultado";

        div.innerHTML = `
            <div class="resPlaca">${r.placas}</div>
            <div class="resMini">
                Boleta: ${r["No. Boleta"]} — Art: ${r.articulo}
            </div>
            <button class="btnVer" onclick="mostrarDetalle(${idx})">Ver detalle</button>
        `;

        lista.appendChild(div);
    });

    // Guardamos para acceder por índice
    window._cacheResultados = encontrados;
}

function mostrarDetalle(i) {
    const r = window._cacheResultados[i];
    if (!r) return;

    const detalle = document.getElementById("detalleRegistro");

    detalle.innerHTML = `
        <h3 class="detalleTitulo">DETALLE COMPLETO</h3>
        <div class="detalleCaja">

            <p><b>Placa:</b> ${r.placas}</p>
            <p><b>No. Boleta:</b> ${r["No. Boleta"]}</p>
            <p><b>Fecha:</b> ${r.fecha}</p>
            <p><b>Hora:</b> ${r.hora}</p>
            <p><b>Tipo:</b> ${r.tipo}</p>
            <p><b>Marca:</b> ${r.marca}</p>
            <p><b>Color:</b> ${r.color}</p>
            <p><b>Dirección:</b> ${r.direccion}</p>
            <p><b>Departamento:</b> ${r.departamento}</p>
            <p><b>Municipio:</b> ${r.Municipio}</p>
            <p><b>Conductor:</b> ${r["nombre del conductor"]}</p>
            <p><b>Licencia:</b> ${r.lic} — ${r["No. Licencia"]}</p>
            <p><b>Artículo:</b> ${r.articulo}</p>
            <p><b>Descripción:</b> ${r.descripcion}</p>
            <p><b>Chapa:</b> ${r.chapa}</p>

        </div>
    `;

    detalle.scrollIntoView({ behavior: "smooth" });
}
