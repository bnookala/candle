// Save this script as `options.js`

// Saves options to localStorage.
function save_options() {
  var addressInput = document.getElementById("address");
  var nameInput = document.getElementById("monitorName");

  var address = input.value;

  if (address) {
    window.localStorage["serverAddress"] = address;
  } else {
    // Default to http://localhost:8090
    window.localStorage["serverAddress"] = "http://127.0.0.1:8090"
  }
}

document.querySelector('#save').addEventListener('click', save_options);
