document.addEventListener("DOMContentLoaded", () => {
    // Estos son los elementos del DOM
    const contentDiv = document.getElementById('content');
    const saludoElement = document.getElementById('saludo');
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('search');
    const footerElement = document.getElementById('footer');
    
    // Estado guardar el estado global, vacio
    let currentLanguage = 'ES'; 
    let configData = {};
    let allDummies = [];
    let visitedDummies = new Set();

    // Inicializar funcones
    loadVisitedDummies();
    initializeLanguage();
    setupEventListeners();

    // Funcion para obtener parámetros de la URL
    function getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            lang: params.get('lang') || getCookie('language') || 'ES'
        };
    }

    // Funcion para leer cookies
    function getCookie(name) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [cookieName, cookieValue] = cookie.split('=').map(c => c.trim());
            if (cookieName === name) return cookieValue;
        }
        return null;
    }

    // Funcion para inicializar idioma desde URL o cookie
    function initializeLanguage() {
        const urlParams = getUrlParams();
        currentLanguage = urlParams.lang;
        loadConfig();
        loadDummies();
    }

    // Funcion para cargar visitados desde localStorage
    function loadVisitedDummies() {
        const saved = localStorage.getItem('visitedDummies');
        if (saved) {
            visitedDummies = new Set(JSON.parse(saved));
        }
    }

    // Funcion para cargar configuración de idioma
    async function loadConfig() {
        try {
            const response = await fetch(`/api/config?lang=${currentLanguage}`);
            configData = await response.json();
            applyConfig();
        } catch (error) {
            console.error("Error loading config:", error);
        }
    }

    // Funcion para aplicar configuración de idioma
    function applyConfig() {
        document.title = configData.sitio.join(" ");
        footerElement.textContent = configData.copyRight;
        saludoElement.textContent = `${configData.saludo}, Guillermo Hernandez`;
        searchInput.placeholder = `${configData.nombre}...`;
        searchForm.querySelector('button').textContent = configData.buscar;
        document.getElementById('ArrIzq').childNodes[0].textContent = configData.sitio[0]; 
        document.getElementById('ArrIzq').childNodes[2].textContent = configData.sitio[2]; 
        document.getElementById('ArrIzqspan').textContent = configData.sitio[1];
    }

    // Funcion para cargar lista de usuarios
    async function loadDummies() {
        try {
            const response = await fetch('/api/dummies');
            allDummies = await response.json();
            renderDummyList(allDummies);
        } catch (error) {
            console.error("Error loading dummies:", error);
        }
    }

    // Funcion para renderizar lista de usuarios
    function renderDummyList(dummies) {
        let html = `<ul class="tarjeta" id="dummies">`;
        
        if (dummies.length === 0) {
            html += `<p class="mensaje">${configData.vacio || 'No results'}</p>`;
        } else {
            dummies.forEach(dummy => {
                const isVisited = visitedDummies.has(dummy.ci);
                const visitedClass = isVisited ? 'visited' : '';
                
                html += `
                <li class="dummy">
                    <img src="/reto3/${dummy.ci}/${dummy.imagen}" alt="Profile">
                    <p class="nombreI">
                        <a href="#" data-ci="${dummy.ci}" class="${visitedClass}">${dummy.nombre}</a>
                    </p>
                </li>`;
            });
        }
        html += `</ul>`;
        contentDiv.innerHTML = html;

        document.querySelectorAll('a[data-ci]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const ci = e.target.getAttribute('data-ci');
                loadProfile(ci);
            });
        });
    }

    // Funcion para crgar perfil de usuario
    async function loadProfile(ci) {
        try {
            visitedDummies.add(ci);
            localStorage.setItem('visitedDummies', JSON.stringify([...visitedDummies]));
            
            const response = await fetch(`/api/profile/${ci}?lang=${currentLanguage}`);
            const profile = await response.json();
            renderProfile(profile, ci);
        } catch (error) {
            console.error("Error loading profile:", error);
        }
    }

    // Funcion para renderizar perfil
    function renderProfile(profile, ci) {
        const html = `
        <div class="perfil">
            <div id="foto" style="background-image: url('/reto3/${ci}/${profile.imagen}')"></div>
            <div class="contenido">
                <div class="descripcion">
                    <p id="nombre">${profile.nombre}</p>
                    <p id="fuente">${profile.descripcion}</p>
                    <div class="puntos">
                        <span>${configData.color}:</span>
                        <span id="color">${profile.color}</span>
                        <span>${configData.libro}:</span>
                        <span id="libro">${profile.libro}</span>
                        <span>${configData.musica}:</span>
                        <span id="musica">${profile.musica}</span>
                        <span>${configData.video_juego}:</span>
                        <span id="videojuegos">${profile.video_juego}</span>            
                        <span><b>${configData.lenguajes}:</b></span>
                        <span id="lenguajes"><b>${profile.lenguajes}</b></span>
                    </div>
                    <br>
                    <p id="contacto">
                        ${configData.email.split('[email]')[0]}
                        <a id="enlace" href="contacto${ci}.html">${profile.email}</a>
                        ${configData.email.split('[email]')[1]}
                    </p>
                </div>
                <button id="backBtn">${configData.volver || '←'}</button>
            </div>
        </div>`;

        contentDiv.innerHTML = html;
        
        document.getElementById('backBtn').addEventListener('click', () => {
            renderDummyList(allDummies);
            searchInput.value = '';
        });
    }

    // Funcion para configurar event listeners
    function setupEventListeners() {
        searchInput.addEventListener('input', handleSearch);
        
        searchForm.querySelector('button').addEventListener('click', (e) => {
            e.preventDefault();
            handleSearch();
        });
        
        window.addEventListener('popstate', () => {
            const newParams = getUrlParams();
            if (newParams.lang !== currentLanguage) {
                currentLanguage = newParams.lang;
                loadConfig();
                loadDummies();
            }
        });
    }
    
    // Funcion para manejar la búsqueda
    function handleSearch() {
        const query = searchInput.value.toLowerCase();
        const filtered = allDummies.filter(dummy => 
            dummy.nombre.toLowerCase().includes(query)
        );
        renderDummyList(filtered);
    }
});