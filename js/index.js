
document.addEventListener("DOMContentLoaded", () => {
    fetch('../reto3/conf/configES.json')
    .then(response => response.json())
    .then(datos => {
        document.title = datos.sitio;
        const footer = document.querySelector("footer");
        footer.textContent= datos.copyRight;
    });
});