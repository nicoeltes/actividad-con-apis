fetch(`https://pokeapi.co/api/v2/pokemon`)
.then(response => response.json())
.then(data => {
    console.log(data);
    Pokemones = data.results;
    console.log(Pokemones);
    mostrarPokemones();
})
.catch(error => {
    console.error(`Error al leer el archivo JSON:`, error);
});

let Pokemones = [];

function mostrarPokemones(){
    const Primerospokemones = document.getElementById(`pokedex`);

    Primerospokemones.innerHTML = "";

    Pokemones.forEach(pokemon => {

        fetch(pokemon.url)
        .then(response => response.json())
        .then(data => {
            let tipos = data.types.map(tipoPokemon => tipoPokemon.type.name);

            Primerospokemones.innerHTML += `
                <h2>${pokemon.name}</h2>
                <p>Tipos: ${tipos.join(", ")}</p>
            `;
        })
        .catch(error => {
            console.error(`Error al obtener los tipos:`, error);
        });

    });
}