document.addEventListener("DOMContentLoaded", () => {
    //Perfil Dinamico
    const parametrosurl = new URLSearchParams(window.location.search);
    const cedula = parametrosurl.get("ci");
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
    
        //Lenguaje dinamico
        const parametrosurllenguaje = new URLSearchParams(window.location.search);
        const lenguaje = parametrosurllenguaje.get("config");
    
        if (lenguaje) {
            const jsonurl = `../reto3/conf/config${lenguaje}.json`;
    
            fetch(jsonurl)
            .then(response => response.json())
            .then(datos => {
                document.getElementById("DefColor").textContent = datos.color;
                document.getElementById("DefLibro").textContent = datos.libro;
                document.getElementById("DefMusica").textContent = datos.musica;
                document.getElementById("DefVideojuegos").textContent = datos.video_juego;
                document.getElementById("DefLenguajes").innerHTML = `<b>${datos.lenguajes}</b>`;

                document.getElementById("contacto").childNodes[0].textContent = datos.email.split("[email]")[0]; 
                document.getElementById("contacto").childNodes[2].textContent = datos.email.split("[email]")[1]; 
            })
                .catch(error => console.error("Error al cargar la configuracion:", error));
        } else {
            console.error("No se proporcionó un ID de perfil.");
        }
});

