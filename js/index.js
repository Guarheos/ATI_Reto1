
document.addEventListener("DOMContentLoaded", () => {
    //Lenguaje dinamico
    const parametrosurl = new URLSearchParams(window.location.search);
    const lenguaje = parametrosurl.get("config");

    if (lenguaje) {
        const jsonurl = `../reto3/conf/config${lenguaje}.json`;

        fetch(jsonurl)
        .then(response => response.json())
        .then(datos => {
            //Poner datos del JSON al title y footer
            document.title = datos.sitio.join(" ");
            const footer = document.querySelector("footer");
            footer.textContent= datos.copyRight;

            //Poner datos a la barra superior, el saludo y la busqueda
            document.getElementById("saludo").textContent=`${datos.saludo}, Guillermo Hernandez`;
            document.getElementById("search").placeholder = `${datos.nombre}...`;
            document.querySelector("button[type='submit']").textContent = datos.buscar;


        })
            .catch(error => console.error("Error al cargar la configuracion:", error));
    } else {
        console.error("No se proporcionó un ID de perfil.");
    }


    //Dummies dinamicos
    fetch("../reto3/datos/index.json")
    .then(response => response.json())
    .then(datosdummies => {
        const dummies = document.getElementById("dummies");
        //dummies.innerHTML = "";
        datosdummies.forEach(dummy => {
            const li = document.createElement("li");
            li.classList.add("dummy");

            li.innerHTML = `
                <img src="${dummy.imagen}" alt="Foto de perfil">
                <p class="nombreI">
                    <a href="perfil.html?ci=${dummy.ci}">${dummy.nombre}</a>
                </p>
            `;

            dummies.appendChild(li);
        });
    })
    .catch(error => console.error("Error cargando el JSON:", error));
});