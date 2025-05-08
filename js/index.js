
document.addEventListener("DOMContentLoaded", () => {
    //Lenguaje dinamico
    const parametrosurl = new URLSearchParams(window.location.search);
    const lenguaje = parametrosurl.get("config") || "ES";

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
            document.getElementById("ArrIzq").childNodes[0].textContent = datos.sitio[0]; 
            document.getElementById("ArrIzq").childNodes[2].textContent = datos.sitio[2]; 
            document.getElementById("ArrIzqspan").textContent = datos.sitio[1]; 
            window.vacio = datos.vacio;

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
            
        function filtrardummies(lista) {
            dummies.innerHTML = "";
            if (lista.length > 0) {
                lista.forEach(dummy => {
                    const li = document.createElement("li");
                    li.classList.add("dummy");

                    li.innerHTML = `
                        <img src="${dummy.imagen}" alt="Foto de perfil">
                        <p class="nombreI">
                            <a href="perfil.html?ci=${dummy.ci}&config=${lenguaje}">${dummy.nombre}</a>
                        </p>
                    `;

                    dummies.appendChild(li);
                });
            } else {
                dummies.innerHTML = `<p class="mensaje">${window.vacio} "${document.getElementById("search").value}"</p>`;
            }
        }

        filtrardummies(datosdummies);

        document.getElementById("search").addEventListener("input", (event) => {
            const query = event.target.value.toLowerCase();
            const filtro = datosdummies.filter(dummy => dummy.nombre.toLowerCase().includes(query));
            filtrardummies(filtro);
        }); 
    })
    .catch(error => console.error("Error cargando el JSON:", error));
});