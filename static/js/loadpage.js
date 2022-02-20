const colorCirlce = document.querySelectorAll(".color-circle")

const gridColor = 'rgba(255, 255, 255, 1.0)';
var colorArray = [];

var testload_btn = document.querySelector("#testload-btn");
var delete_btn = document.querySelector("#delete-btn")
var apply_btn = document.querySelector("#apply-btn")
var canvas = document.querySelector("canvas");

c = canvas.getContext("2d");
c.fillStyle = "#ffffff"; // Weiß
c.strokeStyle = c.fillStyle;

testload_btn.addEventListener("click", async () => await loadColorArrayFromServer());

async function loadColorArrayFromServer() {
    id = 0
    var response = await fetch("/load/"+id, {
        method: "GET"
    });
    if (response.status != 200) {
        console.log("failed to load colorArray from server")
    }
    colorArray = JSON.parse(await response.text())
    drawColorArrayToCanvas();
}

//Lösche aktuelles Frame aus der Datenbank
delete_btn.addEventListener("click", function() {
    c.clearRect(0,0,canvas.width,canvas.height);
    drawGrid();
    console.log("Serverseitiges Löschen wurde noch nicht implementiert")
});

// Sende colorArray an den Server
apply_btn.addEventListener("click", async () => await sendColorArrayToServer("/apply"));

async function sendColorArrayToServer(route) {
    var response = await fetch(route, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(colorArray)
    });
    if (response.status != 200) {
        console.log("failed to send colorArray to server")
    }
}

//Färbe eine Kachel
function draw(x_start, y_start) {
    c.strokeStyle = c.fillStyle;
    c.beginPath();
    c.rect(x_start, y_start, 50, 50);
    c.fill();
    c.stroke();
}

//Zeichne ein komplette Grid ein
function drawGrid() {
    c.strokeStyle = gridColor;
    for (var i=0; i<800;i+=50) {
        for (var j=0; j<800;j+=50) {
            c.beginPath();
            c.rect(i, j, 50, 50);
            c.stroke();
        }
    }
}

//Im drawMode: Kachel färben und Farbe zum array hinzufügen. Im pickMode: Farbe aus array lesen und setzen
function drawColorArrayToCanvas() {
    for (var i=0; i<256; i++) {
        c.fillStyle = colorArray[i];

        y = Math.floor(i/16);
        if (y%2==0) {
            x = 15-i%16;
        } else {
            x = i%16;
        }
        draw(50*x,50*y);
    }
    drawGrid();
}

document.addEventListener("DOMContentLoaded", function() {
    drawGrid();
});