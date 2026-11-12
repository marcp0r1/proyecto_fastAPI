/* =====================================================================
   Cinema API - Lógica del cliente
   ===================================================================== */

const API_URL = "http://127.0.0.1:8000";

const listaPeliculas = document.getElementById("lista-peliculas");
const seccionPeliculas = document.getElementById("peliculas");
const seccionFormulario = document.getElementById("formulario-pelicula");
const seccionDetalle = document.getElementById("detalle-pelicula");
const formulario = document.getElementById("form-pelicula");
const tituloFormulario = document.getElementById("titulo-formulario");

/* ===== Utilidades ===== */

let contenedorToasts = null;

// Aviso visual flotante (se elimina solo a los 3,5 s).
function mostrarNotificacion(mensaje, tipo = "info") {
    if (!contenedorToasts) {
        contenedorToasts = document.createElement("div");
        contenedorToasts.className = "toasts";
        contenedorToasts.setAttribute("aria-live", "polite");
        document.body.appendChild(contenedorToasts);
    }

    const aviso = document.createElement("div");
    aviso.className = `toast toast-${tipo}`;
    aviso.setAttribute("role", "status");
    aviso.textContent = mensaje;

    contenedorToasts.appendChild(aviso);

    window.setTimeout(() => aviso.remove(), 3500);
}

// Desactiva un botón mientras se hace la petición y devuelve cómo restaurarlo.
function marcarBotonCargando(boton, texto) {
    if (!boton) {
        return () => {};
    }

    const textoOriginal = boton.textContent;
    boton.disabled = true;
    boton.textContent = texto;

    return () => {
        if (!boton.isConnected) {
            return;
        }

        boton.disabled = false;
        boton.textContent = textoOriginal;
    };
}

// Evita que el texto de la API rompa el HTML de las tarjetas.
function escaparHtml(texto) {
    return String(texto ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function mostrarSeccion(seccion) {
    for (const pantalla of [seccionPeliculas, seccionFormulario, seccionDetalle]) {
        pantalla.style.display = "none";
    }

    seccion.style.display = "block";
}

/* ===== Listado ===== */

async function cargarPeliculas() {
    listaPeliculas.innerHTML = '<p class="estado-cargando">Cargando películas...</p>';

    try {
        const respuesta = await fetch(`${API_URL}/peliculas`);

        if (!respuesta.ok) {
            throw new Error("Error al obtener las películas");
        }

        const peliculas = await respuesta.json();

        listaPeliculas.innerHTML = "";

        if (peliculas.length === 0) {
            listaPeliculas.innerHTML = "<p>No hay películas disponibles.</p>";
            return;
        }

        peliculas.forEach(pelicula => {
            const tarjeta = document.createElement("div");

            tarjeta.classList.add("tarjeta-pelicula");

            tarjeta.innerHTML = `
                <h3>${escaparHtml(pelicula.titulo)}</h3>
                <p><strong>Director:</strong> ${escaparHtml(pelicula.director)}</p>
                <p><strong>Año:</strong> ${pelicula.año}</p>
                <p><strong>Género:</strong> ${escaparHtml(pelicula.genero)}</p>
                <p class="sinopsis"><strong>Sinopsis:</strong> ${escaparHtml(pelicula.sinopsis)}</p>
                <p><strong>Puntuación:</strong> ${pelicula.puntuacion ?? "—"}</p>

                <div class="acciones-tarjeta">
                    <button class="boton" onclick="verDetalles(${pelicula.id}, this)">
                        Ver detalles
                    </button>
                    <button class="boton boton-secundario" onclick="editarPelicula(${pelicula.id}, this)">
                        Editar
                    </button>
                    <button class="boton boton-peligro" onclick="eliminarPelicula(${pelicula.id}, this)">
                        Eliminar
                    </button>
                </div>
            `;

            listaPeliculas.appendChild(tarjeta);
        });
    } catch (error) {
        listaPeliculas.innerHTML = "<p>No se pudieron cargar las películas.</p>";
        mostrarNotificacion("No se pudieron cargar las películas", "error");
        console.error(error);
    }
}

/* ===== Detalle ===== */

async function verDetalles(id, boton) {
    const informacion = document.getElementById("informacion-pelicula");

    informacion.innerHTML = '<p class="estado-cargando">Cargando detalle...</p>';
    mostrarSeccion(seccionDetalle);

    const restaurarBoton = marcarBotonCargando(boton, "Cargando...");

    try {
        const respuesta = await fetch(`${API_URL}/peliculas/${id}`);

        if (!respuesta.ok) {
            throw new Error("Error al obtener la película");
        }

        const pelicula = await respuesta.json();

        informacion.innerHTML = `
            <h2>${escaparHtml(pelicula.titulo)}</h2>
            <p><strong>Director:</strong> ${escaparHtml(pelicula.director)}</p>
            <p><strong>Año:</strong> ${pelicula.año}</p>
            <p><strong>Género:</strong> ${escaparHtml(pelicula.genero)}</p>
            <p><strong>Sinopsis:</strong> ${escaparHtml(pelicula.sinopsis)}</p>
            <p><strong>Puntuación:</strong> ${pelicula.puntuacion ?? "—"}</p>
        `;
    } catch (error) {
        mostrarSeccion(seccionPeliculas);
        mostrarNotificacion("No se pudo cargar el detalle de la película", "error");
        console.error(error);
    } finally {
        restaurarBoton();
    }
}

/* ===== Edición y eliminación ===== */

async function editarPelicula(id, boton) {
    const restaurarBoton = marcarBotonCargando(boton, "Cargando...");

    try {
        const respuesta = await fetch(`${API_URL}/peliculas/${id}`);

        if (!respuesta.ok) {
            throw new Error("Error al obtener la película");
        }

        const pelicula = await respuesta.json();

        tituloFormulario.textContent = "Editar película";

        document.getElementById("titulo").value = pelicula.titulo;
        document.getElementById("director").value = pelicula.director;
        document.getElementById("año").value = pelicula.año;
        document.getElementById("genero").value = pelicula.genero;
        document.getElementById("sinopsis").value = pelicula.sinopsis ?? "";
        document.getElementById("puntuacion").value = pelicula.puntuacion ?? "";

        formulario.dataset.id = id;

        mostrarSeccion(seccionFormulario);
    } catch (error) {
        mostrarNotificacion("No se pudo cargar la película para editarla", "error");
        console.error(error);
    } finally {
        restaurarBoton();
    }
}

async function eliminarPelicula(id, boton) {
    const tarjeta = boton?.closest(".tarjeta-pelicula");
    const titulo = tarjeta?.querySelector("h3")?.textContent?.trim();
    const pregunta = titulo
        ? `¿Seguro que quieres eliminar "${titulo}"?`
        : "¿Seguro que quieres eliminar esta película?";

    if (!confirm(pregunta)) {
        return;
    }

    const restaurarBoton = marcarBotonCargando(boton, "Eliminando...");

    try {
        const respuesta = await fetch(`${API_URL}/peliculas/${id}`, {
            method: "DELETE"
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo eliminar la película");
        }

        mostrarNotificacion("Película eliminada correctamente", "success");

        await cargarPeliculas();
    } catch (error) {
        mostrarNotificacion("Error al eliminar la película", "error");
        console.error(error);
    } finally {
        restaurarBoton();
    }
}

/* ===== Navegación y formulario ===== */

document.getElementById("volver-btn").addEventListener("click", () => {
    mostrarSeccion(seccionPeliculas);
});

document.getElementById("mostrar-formulario").addEventListener("click", () => {
    formulario.reset();
    delete formulario.dataset.id;

    tituloFormulario.textContent = "Añadir película";

    mostrarSeccion(seccionFormulario);
});

document.getElementById("cancelar-formulario").addEventListener("click", () => {
    formulario.reset();
    delete formulario.dataset.id;

    tituloFormulario.textContent = "Añadir película";

    mostrarSeccion(seccionPeliculas);
});

formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const pelicula = {
        titulo: document.getElementById("titulo").value,
        director: document.getElementById("director").value,
        año: Number(document.getElementById("año").value),
        genero: document.getElementById("genero").value,
        sinopsis: document.getElementById("sinopsis").value,
        puntuacion: Number(document.getElementById("puntuacion").value)
    };

    const id = formulario.dataset.id;
    const editando = Boolean(id);

    const url = editando
        ? `${API_URL}/peliculas/${id}`
        : `${API_URL}/peliculas`;

    const metodo = editando ? "PUT" : "POST";

    const botonGuardar = formulario.querySelector('button[type="submit"]');
    const botonCancelar = document.getElementById("cancelar-formulario");

    const restaurarGuardar = marcarBotonCargando(botonGuardar, "Guardando...");
    botonCancelar.disabled = true;

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(pelicula)
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo guardar la película");
        }

        mostrarNotificacion(
            editando
                ? "¡Película actualizada correctamente!"
                : "¡Película añadida correctamente!",
            "success"
        );

        formulario.reset();
        delete formulario.dataset.id;

        tituloFormulario.textContent = "Añadir película";

        mostrarSeccion(seccionPeliculas);

        await cargarPeliculas();
    } catch (error) {
        mostrarNotificacion(
            editando
                ? "Error al actualizar la película"
                : "Error al añadir la película",
            "error"
        );

        console.error(error);
    } finally {
        restaurarGuardar();
        botonCancelar.disabled = false;
    }
});

/* ===== Inicio ===== */

cargarPeliculas();
