
let Pokemones = [];

// OBTIENE LOS POKEMONES
fetch(`https://pokeapi.co/api/v2/pokemon`)
.then(response => response.json())
.then(data => {
    Pokemones = data.results;
    mostrarPokemones();
})
.catch(error => {
    console.error(`Error al obtener los pokemones:`, error);
});


// MUESTRA LOS POKEMONES ORDENADOS POR EVOLUCION
function mostrarPokemones(PokemonesOrdenados) {

    const Primerospokemones = document.getElementById("pokedex");

    Primerospokemones.innerHTML = "";

    let promesasLineas = PokemonesOrdenados.map(linea => {

        let grupo = document.createElement("section");

        let promesasPokemones = linea.map(nombre => {
            return fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`)
            .then(response => response.json());
        });

        return Promise.all(promesasPokemones).then(pokemones => {

            pokemones.forEach(data => {

                let tipos = data.types.map(tipoPokemon => tipoPokemon.type.name);

                grupo.innerHTML += `
                    <img src="${data.sprites.front_default}" alt="${data.name}">
                    <h2>${data.name}</h2>
                    <p>Tipos: ${tipos.join(", ")}</p>
                `;

            });

            return grupo;
        });

    });

    Promise.all(promesasLineas).then(grupos => {
        grupos.forEach(grupo => {
            Primerospokemones.appendChild(grupo);
        });
    });

}


// OBTIENE TODAS LAS ESPECIES
fetch("https://pokeapi.co/api/v2/pokemon-species?limit=2000")
.then(response => response.json())
.then(data => {
    console.log(data.results);
    console.log("Cantidad de especies:", data.results.length);
})
.catch(error => {
    console.error("Error al obtener las especies:", error);
});



// OBTIENE TODAS LAS CADENAS EVOLUTIVAS
fetch("https://pokeapi.co/api/v2/evolution-chain?limit=1000")
.then(response => response.json())
.then(data => {

    let cadenasEvolutivas = data.results;

    // OBTIENE LA INFORMACION COMPLETA DE CADA CADENA
    let promesas = cadenasEvolutivas.map(cadena => {
        return fetch(cadena.url).then(response => response.json());
    });

    Promise.all(promesas)
    .then(cadenas => {

        let PokemonesOrdenados = [];

        cadenas.forEach(cadena => {
            let evoluciones = obtenerEvoluciones(cadena.chain);
            PokemonesOrdenados.push(evoluciones);
        });

        console.log("Pokemones ordenados:", PokemonesOrdenados);
        mostrarPokemones(PokemonesOrdenados);

    });

})
.catch(error => {
    console.error("Error al obtener las cadenas evolutivas:", error);
});


// RECORRE Y GUARDA LAS EVOLUCIONES
function obtenerEvoluciones(cadena) {

    let nombres = [cadena.species.name];

    cadena.evolves_to.forEach(evolucion => {
        nombres = nombres.concat(obtenerEvoluciones(evolucion));
    });

    return nombres;
}


