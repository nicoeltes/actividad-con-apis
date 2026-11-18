// ==========================================
// POKEDEX
// MUESTRA TODOS LOS POKEMONES ORDENADOS
// POR SUS FAMILIAS EVOLUTIVAS
// ==========================================


// FUNCION PRINCIPAL QUE MUESTRA LOS POKEMONES

function mostrarPokemones(PokemonesOrdenados) {

    // OBTIENE EL ELEMENTO PRINCIPAL DEL HTML

    const Primerospokemones = document.getElementById("pokedex");

    // RECORRE CADA FAMILIA DE EVOLUCION

    let promesasLineas = PokemonesOrdenados.map(linea => {

        // CREA UNA SECCION PARA CADA FAMILIA

        let grupo = document.createElement("section");
        grupo.className = "familia-pokemon";


        // OBTIENE LOS DATOS DE CADA POKEMON DE LA FAMILIA

        let promesasPokemones = linea.map(nombre => {

            // CONSULTA LA INFORMACION DE LA ESPECIE

            return fetch(`https://pokeapi.co/api/v2/pokemon-species/${nombre}`)
            .then(response => {

                if (!response.ok) {
                    throw new Error("No se encontro la especie");
                }

                return response.json();

            })

            // OBTIENE LA VARIEDAD PRINCIPAL DEL POKEMON

            .then(especie => {

                let variedad = especie.varieties.find(variedad => variedad.is_default);

                // CONSULTA LOS DATOS DEL POKEMON

                return fetch(variedad.pokemon.url)
                .then(response => {

                    if (!response.ok) {
                        throw new Error("No se encontro el pokemon");
                    }

                    return response.json();

                })

                // OBTIENE EL NOMBRE EN ESPAÑOL

                .then(pokemon => {

                    let nombreEspanol = especie.names.find(
                        nombre => nombre.language.name === "es"
                    );

                    pokemon.nombreEspanol = nombreEspanol
                        ? nombreEspanol.name
                        : pokemon.name;

                    // DEVUELVE LOS DATOS DEL POKEMON Y SU ESPECIE

                    return {
                        pokemon: pokemon,
                        especie: especie
                    };

                });

            })

            // CONTROLA LOS ERRORES AL OBTENER LOS DATOS

            .catch(error => {

                console.error(`Error al obtener ${nombre}:`, error);

                return null;

            });

        });


        // OBTIENE LAS DEBILIDADES DE CADA POKEMON

        return Promise.all(promesasPokemones).then(pokemones => {

            // ELIMINA LOS POKEMONES QUE NO SE PUDIERON CARGAR

            let promesasDebilidades = pokemones
            .filter(data => data !== null)

            // RECORRE LOS POKEMONES PARA OBTENER SUS DEBILIDADES

            .map(data => {

                // OBTIENE LOS TIPOS DEL POKEMON

                let tipos = data.pokemon.types.map(tipoPokemon => tipoPokemon.type.name);

                // CALCULA LAS DEBILIDADES TENIENDO EN CUENTA TODOS SUS TIPOS

                return obtenerDebilidades(tipos).then(debilidades => {

                    // DEVUELVE TODA LA INFORMACION DEL POKEMON

                    return {
                        pokemon: data.pokemon,
                        especie: data.especie,
                        tipos: tipos,
                        debilidades: debilidades
                    };

                });

            });


            // MUESTRA LOS DATOS DE CADA POKEMON EN SU TARJETA

            return Promise.all(promesasDebilidades).then(resultados => {

                resultados.forEach(resultado => {

                    // GUARDA LOS MOVIMIENTOS Y HABILIDADES PARA CARGARLOS AL ABRIR LA FICHA

                    datosPokemones[resultado.pokemon.id] = {
                        movimientos: resultado.pokemon.moves.map(m => m.move),
                        habilidades: resultado.pokemon.abilities
                    };

                    grupo.innerHTML += `

                        <article class="tarjeta-pokemon" data-id="${resultado.pokemon.id}">

                            <!-- NUMERO DE LA POKEDEX -->

                            <p class="numero-pokemon">
                                #${String(resultado.pokemon.id).padStart(3, "0")}
                            </p>

                            <!-- IMAGEN OFICIAL DEL POKEMON -->

                            <img
                                class="imagen-pokemon"
                                src="${resultado.pokemon.sprites.other["official-artwork"].front_default || resultado.pokemon.sprites.front_default}"
                                alt="${resultado.pokemon.nombreEspanol}"
                            >

                            <!-- NOMBRE EN ESPAÑOL -->

                            <h2>${resultado.pokemon.nombreEspanol}</h2>

                            <!-- BOTON PARA ABRIR LA INFORMACION ADICIONAL -->

                            <button
                                class="boton-ver-mas"
                                type="button"
                                aria-expanded="false"
                            >
                                Ver más
                            </button>


                            <!-- SECCION DE INFORMACION ADICIONAL -->

                            <div class="informacion-adicional" hidden>

                                <!-- ALTURA Y PESO -->

                                <div class="datos-pokemon">

                                    <p>
                                        <strong>Altura:</strong>
                                        ${(resultado.pokemon.height / 10).toFixed(1)} m
                                    </p>

                                    <p>
                                        <strong>Peso:</strong>
                                        ${(resultado.pokemon.weight / 10).toFixed(1)} kg
                                    </p>

                                </div>

                                <!-- TIPOS Y DEBILIDADES -->

                                <div class="tipos-debilidades">

                                    <!-- TIPOS DEL POKEMON -->

                                    <div class="columna-tipos">

                                        <h3>Tipos</h3>

                                        ${resultado.tipos.map(tipo => crearElementoTipo(tipo)).join("")}

                                    </div>


                                    <!-- DEBILIDADES DEL POKEMON -->

                                    <div class="columna-debilidades">

                                        <h3>Debilidades</h3>

                                        ${resultado.debilidades.map(tipo => crearElementoTipo(tipo)).join("")}

                                    </div>

                                </div>

                                <!-- FICHA DETALLADA (DESCRIPCION, CATEGORIA, HABITAT, ETC) -->

                                ${crearFichaDetallada(resultado.pokemon, resultado.especie)}

                            </div>

                        </article>

                    `;

                });

                return grupo;

            });

        });

    });


    // AGREGA CADA FAMILIA EN SU PROPIA FILA

    Promise.all(promesasLineas)
    .then(grupos => {

        Primerospokemones.innerHTML = "";

        grupos.forEach(grupo => {

            Primerospokemones.appendChild(grupo);

        });

    })
    .catch(error => {

        console.error("Error al mostrar los pokemon:", error);

    });


    // PERMITE ABRIR Y CERRAR LA INFORMACION ADICIONAL

    Primerospokemones.addEventListener("click", function(event) {

        if (event.target.classList.contains("boton-ver-mas")) {

            let boton = event.target;

            let tarjeta = boton.closest(".tarjeta-pokemon");

            let informacion = tarjeta.querySelector(".informacion-adicional");

            // CAMBIA LA VISIBILIDAD DE LA FICHA

            informacion.hidden = !informacion.hidden;

            // LA PRIMERA VEZ QUE SE ABRE, CARGA MOVIMIENTOS Y HABILIDADES EN ESPAÑOL

            if (!informacion.hidden && !tarjeta.dataset.cargado) {

                tarjeta.dataset.cargado = "si";

                cargarMovimientosYHabilidades(tarjeta);

            }

            // CAMBIA EL TEXTO DEL BOTON

            boton.textContent = informacion.hidden ? "Ver más" : "Ver menos";

            boton.setAttribute("aria-expanded", String(!informacion.hidden));

        }

    });

}


// ==========================================
// OBTIENE TODAS LAS CADENAS EVOLUTIVAS
// ==========================================


// CONSULTA LAS CADENAS EVOLUTIVAS DE LA API

fetch("https://pokeapi.co/api/v2/evolution-chain?limit=1000")
.then(response => {

    if (!response.ok) {
        throw new Error("No se pudieron obtener las cadenas evolutivas");
    }

    return response.json();

})

.then(data => {

    // GUARDA TODAS LAS CADENAS EN UNA VARIABLE

    let cadenasEvolutivas = data.results;

    console.log("Cadenas evolutivas encontradas:", cadenasEvolutivas.length);


    // OBTIENE LOS DATOS COMPLETOS DE CADA CADENA

    let promesas = cadenasEvolutivas.map(cadena => {

        return fetch(cadena.url).then(response => {

            if (!response.ok) {
                throw new Error("No se pudo obtener una cadena evolutiva");
            }

            return response.json();

        });

    });


    // ESPERA A QUE SE CARGUEN TODAS LAS CADENAS

    Promise.all(promesas)
    .then(cadenas => {

        let PokemonesOrdenados = [];

        // ORDENA LOS POKEMONES SEGUN SUS EVOLUCIONES

        cadenas.forEach(cadena => {

            let evoluciones = obtenerEvoluciones(cadena.chain);

            PokemonesOrdenados.push(evoluciones);

        });

        // ENVIA LOS POKEMONES A LA FUNCION PRINCIPAL

        mostrarPokemones(PokemonesOrdenados);

    });

})

.catch(error => {

    console.error("Error al obtener las cadenas evolutivas:", error);

});


// ==========================================
// FUNCIONES AUXILIARES
// ==========================================


// OBTIENE LOS NOMBRES DE LOS POKEMONES DE CADA FAMILIA

function obtenerEvoluciones(cadena) {

    // GUARDA EL NOMBRE DEL PRIMER POKEMON DE LA CADENA

    let nombres = [cadena.species.name];

    // RECORRE TODAS LAS EVOLUCIONES SIGUIENTES

    cadena.evolves_to.forEach(evolucion => {

        nombres = nombres.concat(obtenerEvoluciones(evolucion));

    });

    return nombres;

}


// GUARDA LOS TIPOS YA CONSULTADOS PARA NO PEDIRLOS MAS DE UNA VEZ

let tiposGuardados = {};

function obtenerTipo(tipo) {

    if (!tiposGuardados[tipo]) {

        tiposGuardados[tipo] = fetch(`https://pokeapi.co/api/v2/type/${tipo}`)
        .then(response => response.json());

    }

    return tiposGuardados[tipo];

}


// OBTIENE LAS DEBILIDADES DE UN POKEMON SEGUN TODOS SUS TIPOS
// (TIENE EN CUENTA RESISTENCIAS E INMUNIDADES)

function obtenerDebilidades(tipos) {

    return Promise.all(tipos.map(tipo => obtenerTipo(tipo)))
    .then(datosTipos => {

        // MULTIPLICADOR DE DAÑO QUE RECIBE DE CADA TIPO ATACANTE

        let multiplicadores = {};

        datosTipos.forEach(data => {

            let relaciones = data.damage_relations;

            relaciones.double_damage_from.forEach(t => {
                multiplicadores[t.name] = (multiplicadores[t.name] ?? 1) * 2;
            });

            relaciones.half_damage_from.forEach(t => {
                multiplicadores[t.name] = (multiplicadores[t.name] ?? 1) * 0.5;
            });

            relaciones.no_damage_from.forEach(t => {
                multiplicadores[t.name] = 0;
            });

        });

        // SOLO SON DEBILIDADES LOS TIPOS QUE HACEN MAS DE X1

        return Object.keys(multiplicadores)
        .filter(tipo => multiplicadores[tipo] > 1);

    });

}


// CREA EL ICONO Y NOMBRE DE UN TIPO

function crearElementoTipo(tipo) {

    return `
        <div class="elemento-tipo">
            <img src="${obtenerIconoTipo(tipo)}" alt="${traducirTipo(tipo)}">
            <span>${traducirTipo(tipo)}</span>
        </div>
    `;

}


// GUARDA LOS MOVIMIENTOS Y HABILIDADES DE CADA POKEMON (POR NUMERO)

let datosPokemones = {};


// ARMA LA FICHA DETALLADA CON LOS DATOS DE LA ESPECIE

function crearFichaDetallada(pokemon, especie) {

    // DESCRIPCION DE LA POKEDEX (LA MAS NUEVA EN ESPAÑOL)

    let descripciones = especie.flavor_text_entries.filter(
        entrada => entrada.language.name === "es"
    );

    let descripcion = descripciones.length > 0
        ? descripciones[descripciones.length - 1].flavor_text.replace(/[\n\f\r]+/g, " ")
        : "Sin descripción en español.";

    // CATEGORIA (POR EJEMPLO: POKEMON RATON)

    let categoria = especie.genera.find(g => g.language.name === "es");

    // GENERACION (POR EJEMPLO: generation-iv -> GENERACION 4)

    let numerosRomanos = {
        i: 1, ii: 2, iii: 3, iv: 4, v: 5,
        vi: 6, vii: 7, viii: 8, ix: 9, x: 10
    };

    let romano = especie.generation.name.split("-")[1];

    let generacion = "Generación " + (numerosRomanos[romano] || romano.toUpperCase());

    // HABITAT (LOS POKEMON NUEVOS NO TIENEN)

    let habitat = especie.habitat
        ? traducir(especie.habitat.name, traduccionesHabitat)
        : "Desconocido";

    // COLOR Y GRUPOS HUEVO

    let color = traducir(especie.color.name, traduccionesColor);

    let gruposHuevo = especie.egg_groups
        .map(grupo => traducir(grupo.name, traduccionesGrupoHuevo))
        .join(", ");

    // IMAGEN VARIOCOLOR (SHINY)

    let imagenShiny = pokemon.sprites.other["official-artwork"].front_shiny
        || pokemon.sprites.front_shiny;

    return `

        <div class="ficha-detallada">

            <p class="descripcion-pokemon">${descripcion}</p>

            <div class="dato-ficha">
                <strong>Categoría:</strong>
                <span>${categoria ? categoria.genus : "Desconocida"}</span>
            </div>

            <div class="dato-ficha">
                <strong>Generación:</strong>
                <span>${generacion}</span>
            </div>

            <div class="dato-ficha">
                <strong>Hábitat:</strong>
                <span>${habitat}</span>
            </div>

            <div class="dato-ficha">
                <strong>Color:</strong>
                <span>${color}</span>
            </div>

            <div class="dato-ficha">
                <strong>Grupo huevo:</strong>
                <span>${gruposHuevo}</span>
            </div>

            <div class="dato-ficha dato-shiny">
                <strong>Variocolor:</strong>
                ${imagenShiny
                    ? `<img class="imagen-shiny" src="${imagenShiny}" alt="${pokemon.nombreEspanol} variocolor">`
                    : "<span>No disponible</span>"}
            </div>

            <h3>Habilidades</h3>
            <div class="lista-habilidades">Cargando...</div>

            <h3>Movimientos</h3>
            <div class="lista-movimientos">Cargando...</div>

        </div>

    `;

}


// GUARDA LOS NOMBRES EN ESPAÑOL YA CONSULTADOS (MOVIMIENTOS Y HABILIDADES)

let nombresGuardados = {};

function obtenerNombreEspanol(recurso) {

    if (!nombresGuardados[recurso.url]) {

        nombresGuardados[recurso.url] = fetch(recurso.url)
        .then(response => response.json())
        .then(data => {

            let nombre = data.names.find(n => n.language.name === "es");

            return nombre ? nombre.name : formatearNombre(recurso.name);

        })
        .catch(() => formatearNombre(recurso.name));

    }

    return nombresGuardados[recurso.url];

}


// SI NO HAY NOMBRE EN ESPAÑOL: "dragon-claw" -> "Dragon claw"

function formatearNombre(nombre) {

    let texto = nombre.replace(/-/g, " ");

    return texto.charAt(0).toUpperCase() + texto.slice(1);

}


// CARGA LAS HABILIDADES Y MOVIMIENTOS CUANDO SE ABRE LA FICHA

function cargarMovimientosYHabilidades(tarjeta) {

    let datos = datosPokemones[tarjeta.dataset.id];

    let cajaHabilidades = tarjeta.querySelector(".lista-habilidades");

    let cajaMovimientos = tarjeta.querySelector(".lista-movimientos");


    // HABILIDADES (NORMALES Y OCULTAS)

    Promise.all(datos.habilidades.map(h => obtenerNombreEspanol(h.ability)))
    .then(nombres => {

        cajaHabilidades.innerHTML = nombres.map((nombre, i) => `

            <span class="etiqueta ${datos.habilidades[i].is_hidden ? "etiqueta-oculta" : ""}">
                ${nombre}${datos.habilidades[i].is_hidden ? " (oculta)" : ""}
            </span>

        `).join("");

    });


    // MOVIMIENTOS QUE PUEDE APRENDER (ORDENADOS ALFABETICAMENTE)

    Promise.all(datos.movimientos.map(m => obtenerNombreEspanol(m)))
    .then(nombres => {

        if (nombres.length === 0) {

            cajaMovimientos.textContent = "Sin movimientos registrados.";

            return;

        }

        nombres.sort((a, b) => a.localeCompare(b, "es"));

        cajaMovimientos.innerHTML = `

            <p class="cantidad-movimientos">${nombres.length} movimientos</p>

            ${nombres.map(nombre => `<span class="etiqueta">${nombre}</span>`).join("")}

        `;

    });

}


// TRADUCE UN NOMBRE USANDO UNA LISTA DE TRADUCCIONES

function traducir(nombre, traducciones) {

    return traducciones[nombre] || nombre;

}

let traduccionesHabitat = {
    cave: "Cueva",
    forest: "Bosque",
    grassland: "Pradera",
    mountain: "Montaña",
    rare: "Raro",
    "rough-terrain": "Terreno escabroso",
    sea: "Mar",
    urban: "Ciudad",
    "waters-edge": "Orilla del agua"
};

let traduccionesColor = {
    black: "Negro",
    blue: "Azul",
    brown: "Marrón",
    gray: "Gris",
    green: "Verde",
    pink: "Rosa",
    purple: "Morado",
    red: "Rojo",
    white: "Blanco",
    yellow: "Amarillo"
};

let traduccionesGrupoHuevo = {
    monster: "Monstruo",
    water1: "Agua 1",
    water2: "Agua 2",
    water3: "Agua 3",
    bug: "Bicho",
    flying: "Volador",
    ground: "Campo",
    fairy: "Hada",
    plant: "Planta",
    humanshape: "Humanoide",
    mineral: "Mineral",
    indeterminate: "Amorfo",
    ditto: "Ditto",
    dragon: "Dragón",
    "no-eggs": "Desconocido"
};


// OBTIENE EL SIMBOLO ORIGINAL DE CADA TIPO

function obtenerIconoTipo(tipo) {

    // RELACIONA CADA TIPO CON SU IDENTIFICADOR EN LA API

    let identificadores = {
        normal: 1,
        fighting: 2,
        flying: 3,
        poison: 4,
        ground: 5,
        rock: 6,
        bug: 7,
        ghost: 8,
        steel: 9,
        fire: 10,
        water: 11,
        grass: 12,
        electric: 13,
        psychic: 14,
        ice: 15,
        dragon: 16,
        dark: 17,
        fairy: 18
    };

    // DEVUELVE LA DIRECCION DE LA IMAGEN DEL TIPO

    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-ix/scarlet-violet/small/${identificadores[tipo]}.png`;

}


// TRADUCE LOS NOMBRES DE LOS TIPOS AL ESPAÑOL

function traducirTipo(tipo) {

    // GUARDA LAS TRADUCCIONES DE LOS TIPOS

    let traducciones = {
        normal: "Normal",
        fire: "Fuego",
        water: "Agua",
        electric: "Eléctrico",
        grass: "Planta",
        ice: "Hielo",
        fighting: "Lucha",
        poison: "Veneno",
        ground: "Tierra",
        flying: "Volador",
        psychic: "Psíquico",
        bug: "Bicho",
        rock: "Roca",
        ghost: "Fantasma",
        dragon: "Dragón",
        dark: "Siniestro",
        steel: "Acero",
        fairy: "Hada"
    };

    // DEVUELVE EL NOMBRE TRADUCIDO

    return traducciones[tipo] || tipo;

}