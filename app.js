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

    // buscar por placa
    const multas = registros.filter(r => clean(r.placas) === limpio);

    if (multas.length === 0) {
        lista.innerHTML = `<div class="noResult">Sin resultados para: ${txt}</div>`;
        return;
    }

    // GENERAR TARJETA PRINCIPAL
    const placa = multas[0].placas;
    const tarjeta = document.createElement("div");
    tarjeta.className = "itemResultado";

    tarjeta.innerHTML = `
        <div class="resPlaca">${placa}</div>
        <div class="resMini">Multas encontradas: ${multas.length}</div>
        <div id="listaMultas"></div>
    `;

    lista.appendChild(tarjeta);

    // LISTA DE TODAS LAS MULTAS
    const contenedorLista = tarjeta.querySelector("#listaMultas");

    multas.forEach(m => {
        const item = document.createElement("div");
        item.className = "lineaMulta";

        item.innerHTML = `
            • Boleta ${m["No. Boleta"]} | Art: ${m.articulo} | 
              ${m.tipo} | ${m.marca} | ${m.hora} | Chapa: ${m.chapa}
        `;

        contenedorLista.appendChild(item);
    });
}
