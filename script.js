fetch(`https://pokeapi.co/api/v2/pokemon`)
.then( response => response.json() )
.then(data=>{
    console.log(data);
    Pokemones = data.results;
    console.log(Pokemones);
    mostrarPokemones()
})
.catch( error => {
    console.error(`Error al leer el archivo JSON:`, error)
})

let Pokemones = [];

function mostrarPokemones(){
    const Primerospokemones = document.getElementById(`pokedex`);
    
    pokedex.InnerHTML="";
    Pokemones.forEach( bicho => {
        Primerospokemones.innerHTML += `
            <h2>${bicho.name}</h2>
        `
    })
}
