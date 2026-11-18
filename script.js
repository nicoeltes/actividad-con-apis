
// ==========================================
// POKEDEX
// MUESTRA TODOS LOS POKEMONES ORDENADOS
// POR SUS FAMILIAS EVOLUTIVAS
// ==========================================


// FUNCION PRINCIPAL QUE MUESTRA LOS POKEMONES

function mostrarPokemones(PokemonesOrdenados) {

    // OBTIENE EL ELEMENTO PRINCIPAL DEL HTML

    const Primerospokemones = document.getElementById("pokedex");

    // LIMPIA EL CONTENIDO ANTERIOR

    Primerospokemones.innerHTML = "";


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

                // CONSULTA LAS DEBILIDADES DE CADA TIPO

                let consultas = tipos.map(tipo => obtenerDebilidades(tipo));

                return Promise.all(consultas).then(resultados => {

                    // UNE LAS DEBILIDADES Y ELIMINA LAS REPETIDAS

                    let debilidades = [...new Set(resultados.flat())];

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

                    grupo.innerHTML += `

                        <article class="tarjeta-pokemon">

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

                                    ${resultado.tipos.map(tipo => `

                                        <div class="elemento-tipo">

                                            <img
                                                src="${obtenerIconoTipo(tipo)}"
                                                alt="${traducirTipo(tipo)}"
                                            >

                                            <span>${traducirTipo(tipo)}</span>

                                        </div>

                                    `).join("")}

                                </div>


                                <!-- DEBILIDADES DEL POKEMON -->

                                <div class="columna-debilidades">

                                    <h3>Debilidades</h3>

                                    ${resultado.debilidades.map(tipo => `

                                        <div class="elemento-tipo">

                                            <img
                                                src="${obtenerIconoTipo(tipo)}"
                                                alt="${traducirTipo(tipo)}"
                                            >

                                            <span>${traducirTipo(tipo)}</span>

                                        </div>

                                    `).join("")}

                                </div>

                            </div>


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

                                <h3>Ficha detallada</h3>

                                <p>En esta sección agregaremos el resto de la información del Pokémon.</p>

                            </div>

                        </article>

                    `;

                });

                return grupo;

            });

        });

    });


    // AGREGA TODAS LAS FAMILIAS AL HTML

    Promise.all(promesasLineas)
    .then(grupos => {

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


// OBTIENE LAS DEBILIDADES DE CADA TIPO

function obtenerDebilidades(tipo) {

    // CONSULTA LA INFORMACION DEL TIPO EN POKEAPI

    return fetch(`https://pokeapi.co/api/v2/type/${tipo}`)
    .then(response => response.json())

    .then(data => {

        // OBTIENE LOS TIPOS QUE HACEN EL DOBLE DE DAÑO

        let debilidades = data.damage_relations.double_damage_from;

        return debilidades.map(debilidad => debilidad.name);

    });

}


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
        electric: "Electrico",
        grass: "Planta",
        ice: "Hielo",
        fighting: "Lucha",
        poison: "Veneno",
        ground: "Tierra",
        flying: "Volador",
        psychic: "Psiquico",
        bug: "Bicho",
        rock: "Roca",
        ghost: "Fantasma",
        dragon: "Dragon",
        dark: "Siniestro",
        steel: "Acero",
        fairy: "Hada"
    };

    // DEVUELVE EL NOMBRE TRADUCIDO

    return traducciones[tipo] || tipo;

}
