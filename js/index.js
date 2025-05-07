
document.addEventListener("DOMContentLoaded", () => {
    fetch('../reto3/conf/configES.json')
    .then(response => response.json())
    .then(datos => {
        //Poner datos del JSON al title y footer
        document.title = datos.sitio.join(" ");
        const footer = document.querySelector("footer");
        footer.textContent= datos.copyRight;

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
                            <a href="${dummy.perfil}">${dummy.nombre}</a>
                        </p>
                    `;

                    dummies.appendChild(li);
                });
            })
            .catch(error => console.error("Error cargando el JSON:", error));
    });
});