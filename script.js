
// MUESTRA LOS POKEMON ORDENADOS POR EVOLUCION

function mostrarPokemones(PokemonesOrdenados) {

    const Primerospokemones = document.getElementById("pokedex");

    Primerospokemones.innerHTML = "";

    // RECORRE CADA FAMILIA DE EVOLUCION

    let promesasLineas = PokemonesOrdenados.map(linea => {

        let grupo = document.createElement("section");

        // OBTIENE LOS DATOS DE CADA POKEMON

        let promesasPokemones = linea.map(nombre => {

            return fetch(`https://pokeapi.co/api/v2/pokemon-species/${nombre}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("No se encontro la especie");
                }
                return response.json();
            })
            .then(especie => {

                let variedad = especie.varieties.find(variedad => variedad.is_default);

                return fetch(variedad.pokemon.url);

            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("No se encontro el pokemon");
                }
                return response.json();
            })
            .catch(error => {
                console.error(`Error al obtener ${nombre}:`, error);
                return null;
            });

        });

        // OBTIENE LAS DEBILIDADES DE CADA POKEMON

        return Promise.all(promesasPokemones).then(pokemones => {

            let promesasDebilidades = pokemones
            .filter(data => data !== null)
            .map(data => {

                let tipos = data.types.map(tipoPokemon => tipoPokemon.type.name);

                let consultas = tipos.map(tipo => obtenerDebilidades(tipo));

                return Promise.all(consultas).then(resultados => {

                    let debilidades = [...new Set(resultados.flat())];

                    return {
                        pokemon: data,
                        tipos: tipos,
                        debilidades: debilidades
                    };

                });

            });

            // MUESTRA LOS DATOS DE CADA POKEMON

            return Promise.all(promesasDebilidades).then(resultados => {

                resultados.forEach(resultado => {

                    grupo.innerHTML += `
                        <div>
                            <img src="${resultado.pokemon.sprites.front_default}" alt="${resultado.pokemon.name}">

                            <h2>${resultado.pokemon.name}</h2>

                            <p>Tipos:</p>

                            <div>
                                ${resultado.tipos.map(tipo => `
                                    <div style="
                                        display: inline-flex;
                                        align-items: center;
                                        gap: 5px;
                                        margin: 3px;
                                    ">
                                        <span style="
                                            background-color: ${obtenerColor(tipo)};
                                            width: 40px;
                                            height: 40px;
                                            border-radius: 50%;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                        ">
                                            <img
                                                src="${obtenerIconoTipo(tipo)}"
                                                alt="Simbolo de ${traducirTipo(tipo)}"
                                                style="width: 25px; height: 25px;"
                                            >
                                        </span>

                                        <span>${traducirTipo(tipo)}</span>
                                    </div>
                                `).join("")}
                            </div>

                            <p>Debilidades: ${resultado.debilidades.map(tipo => traducirTipo(tipo)).join(", ")}</p>
                        </div>
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

}


// OBTIENE TODAS LAS CADENAS EVOLUTIVAS

fetch("https://pokeapi.co/api/v2/evolution-chain?limit=1000")
.then(response => {
    if (!response.ok) {
        throw new Error("No se pudieron obtener las cadenas evolutivas");
    }
    return response.json();
})
.then(data => {

    let cadenasEvolutivas = data.results;

    console.log("Cadenas evolutivas encontradas:", cadenasEvolutivas.length);

    // OBTIENE LA INFORMACION COMPLETA DE CADA CADENA

    let promesas = cadenasEvolutivas.map(cadena => {
        return fetch(cadena.url).then(response => {
            if (!response.ok) {
                throw new Error("No se pudo obtener una cadena evolutiva");
            }
            return response.json();
        });
    });

    // ESPERA A QUE SE OBTENGAN TODAS LAS CADENAS

    Promise.all(promesas)
    .then(cadenas => {

        let PokemonesOrdenados = [];

        cadenas.forEach(cadena => {

            let evoluciones = obtenerEvoluciones(cadena.chain);

            PokemonesOrdenados.push(evoluciones);

        });

        // MUESTRA LOS POKEMON EN EL HTML

        mostrarPokemones(PokemonesOrdenados);

    });

})
.catch(error => {
    console.error("Error al obtener las cadenas evolutivas:", error);
});


// RECORRE Y GUARDA LOS POKEMON DE CADA CADENA

function obtenerEvoluciones(cadena) {

    let nombres = [cadena.species.name];

    cadena.evolves_to.forEach(evolucion => {

        nombres = nombres.concat(obtenerEvoluciones(evolucion));

    });

    return nombres;
}


// OBTIENE LAS DEBILIDADES DE UN TIPO

function obtenerDebilidades(tipo) {

    return fetch(`https://pokeapi.co/api/v2/type/${tipo}`)
    .then(response => response.json())
    .then(data => {

        let debilidades = data.damage_relations.double_damage_from;

        return debilidades.map(debilidad => debilidad.name);

    });

}


// ASIGNA UN COLOR A CADA TIPO

function obtenerColor(tipo) {

    let colores = {
        normal: "#A8A77A",
        fire: "#EE8130",
        water: "#6390F0",
        electric: "#F7D02C",
        grass: "#7AC74C",
        ice: "#96D9D6",
        fighting: "#C22E28",
        poison: "#A33EA1",
        ground: "#E2BF65",
        flying: "#A98FF3",
        psychic: "#F95587",
        bug: "#A6B91A",
        rock: "#B6A136",
        ghost: "#735797",
        dragon: "#6F35FC",
        dark: "#705746",
        steel: "#B7B7CE",
        fairy: "#D685AD"
    };

    return colores[tipo] || "#777777";

}


// OBTIENE EL SIMBOLO ORIGINAL DE CADA TIPO

function obtenerIconoTipo(tipo) {

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

    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-ix/scarlet-violet/small/${identificadores[tipo]}.png`;

}


// TRADUCE LOS NOMBRES DE LOS TIPOS AL ESPAÑOL

function traducirTipo(tipo) {

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

    return traducciones[tipo] || tipo;

}
