document.addEventListener("DOMContentLoaded", () => {
    const parametrosurl = new URLSearchParams(window.location.search);
    const cedula = parametrosurl.get("ci"); // Obtiene el ID del perfil

    if (cedula) {
        const jsonurl = `../reto3/${cedula}/perfil.json`;

        fetch(jsonurl)
            .then(response => response.json())
            .then(datos => {
                document.getElementById("nombre").textContent=datos.nombre;
                document.getElementById("fuente").textContent=datos.descripcion;
                document.getElementById("foto").style.backgroundImage = `url('../reto3/${cedula}/${datos.imagen}')`;
                document.getElementById("color").textContent = datos.color;
                document.getElementById("libro").textContent = datos.libro;
                document.getElementById("musica").textContent = datos.musica;
                document.getElementById("videojuegos").textContent = datos.video_juego;
                document.getElementById("lenguajes").innerHTML = `<b>${datos.lenguajes}</b>`;
                document.getElementById("enlace").textContent = datos.email;
                document.getElementById("enlace").href = `contacto${cedula}.html`
            })
            .catch(error => console.error("Error al cargar el perfil:", error));
    } else {
        console.error("No se proporcionó un ID de perfil.");
    }
});

