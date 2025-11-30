// ================================
// 📌 CARGA DEL ARCHIVO JSON
// ================================
let baseDatos = [];

async function cargarDatos() {
    try {
        const respuesta = await fetch("placas.json");
        baseDatos = await respuesta.json();

        document.getElementById("estado").innerHTML =
            "Archivo cargado. Registros: " + baseDatos.length;
    } catch (error) {
        document.getElementById("estado").innerHTML =
            "❌ Error cargando archivo";
        console.error("Error cargando placas.json", error);
    }
}
cargarDatos();

// ================================
// 📌 NORMALIZAR TEXTO (quita guiones, espacios, mayúsculas)
// ================================
function normalizar(txt) {
    return txt
        .toString()
        .trim()
        .toUpperCase()
        .replace(/[\s\-]/g, "");
}

// ================================
// 📌 BOTÓN BUSCAR
// ================================
document.getElementById("btnBuscar").addEventListener("click", buscar);

// ENTER también busca
document
    .getElementById("busquedaInput")
    .addEventListener("keypress", function (e) {
        if (e.key === "Enter") buscar();
    });

// ================================
// 📌 FUNCIÓN PRINCIPAL DE BÚSQUEDA
// ================================
function buscar() {
    const entrada = normalizar(
        document.getElementById("busquedaInput").value
    );

    if (entrada === "") return;

    const resultados = [];

    baseDatos.forEach((fila, index) => {
        const valoresFila = Object.values(fila).map(v => normalizar(v));

        if (valoresFila.some(v => v.includes(entrada))) {
            resultados.push({ index, fila });
        }
    });

    mostrarResultados(resultados);
}

// ================================
// 📌 MOSTRAR RESULTADOS EN LISTA COMPACTA
// ================================
function mostrarResultados(resultados) {
    const contenedor = document.getElementById("contenidoResultados");
    const panel = document.getElementById("resultadosLista");
    const detalle = document.getElementById("detalleRegistro");

    detalle.classList.add("oculto");

    contenedor.innerHTML = "";

    if (resultados.length === 0) {
        panel.classList.remove("oculto");
        contenedor.innerHTML = `<div class="itemNo">❌ No se encontraron coincidencias</div>`;
        return;
    }

    panel.classList.remove("oculto");

    resultados.forEach((r, i) => {
        const placa = r.fila["placas"] || r.fila["PLACA"] || "SIN DATOS";
        const fecha = r.fila["fecha"] || r.fila["FECHA"] || "";
        const hora = r.fila["hora"] || r.fila["HORA"] || "";

        const item = document.createElement("div");
        item.className = "itemResultado";
        item.innerHTML = `
            <div class="itemIndex">${i + 1}</div>
            <div class="itemData">
                <b>${placa}</b> — ${fecha} ${hora}
            </div>
        `;

        item.addEventListener("click", () => mostrarDetalle(r.fila));

        contenedor.appendChild(item);
    });
}

// ================================
// 📌 MOSTRAR DETALLE COMPLETO TIPO FICHA PROFESIONAL
// ================================
function mostrarDetalle(fila) {
    const panel = document.getElementById("detalleRegistro");
    panel.innerHTML = "";
    panel.classList.remove("oculto");

    let html = `
        <div class="ficha">
            <h3 class="fichaTitulo">DETALLE DEL REGISTRO</h3>
    `;

    for (const [campo, valor] of Object.entries(fila)) {
        html += `
            <div class="fFila">
                <div class="fCampo">${campo}</div>
                <div class="fValor">${valor}</div>
            </div>
        `;
    }

    html += `</div>`;

    panel.innerHTML = html;

    panel.scrollIntoView({ behavior: "smooth" });
}
