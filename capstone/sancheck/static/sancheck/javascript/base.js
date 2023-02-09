let autocomplete;
let searchBox;

function initAutocomplete() {

searchBox = document.getElementById("destination-input");

const options = {
    fields: ["address_components", "geometry"],
    types: ["address"],
};

// create autocomplete object
autocomplete = new google.maps.places.Autocomplete(searchBox, options);
searchBox.focus();
}

window.initAutocomplete = initAutocomplete;

// trigger search button click on Enter
var searchButton = document.getElementById("search-button");
var searchBar = document.getElementById("destination-input");

searchBar.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
    searchButton.click();
    }
});