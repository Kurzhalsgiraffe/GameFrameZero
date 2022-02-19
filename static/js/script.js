const colorCirlce = document.querySelectorAll(".color-circle")

const gridColor = 'rgba(255, 255, 255, 1.0)';
var isMouseDown;
var drawMode = true;
var colorArray = [];

var colorpicker_btn = document.querySelector("#colorpicker-btn");
var delete_btn = document.querySelector("#delete-btn")
var apply_btn = document.querySelector("#apply-btn")
var save_btn = document.querySelector("#save-btn")
var canvas = document.querySelector("canvas");

c = canvas.getContext("2d");
c.fillStyle = "#ffffff"; // Weiß
c.strokeStyle = c.fillStyle;

//Pipettenwerkzeug
colorpicker_btn.addEventListener("click", function() {
    setDrawMode(!drawMode);
});

//Setze alle Pixel auf Default Wert
delete_btn.addEventListener("click", function() {
    c.clearRect(0,0,canvas.width,canvas.height);
    drawGrid();
    initializeColorArray();
});

//Speichere aktuelles Frame als Bild und Array
save_btn.addEventListener("click", function() {
    
});

// Sende colorArray an den Server
apply_btn.addEventListener("click", async () => await apply());
async function apply() {
    var response = await fetch("/apply", {
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

canvas.addEventListener("mousedown", (event)=>{
    isMouseDown = true;
    updateCell(event.offsetX, event.offsetY);
});

canvas.addEventListener("mouseup", ()=>{
    isMouseDown = false;
});

canvas.addEventListener("mouseleave", ()=>{
    isMouseDown = false;
});

canvas.addEventListener("mousemove",(event)=>{
    updateCell(event.offsetX, event.offsetY)
});

//Färbe eine Kachel, und aktualisiere das Grid
function draw(x_start, y_start) {
    c.strokeStyle = c.fillStyle;
    c.beginPath();
    c.rect(x_start, y_start, 50, 50);
    c.fill();
    c.stroke();

    updateGrid(x_start,y_start);
}

//Aktualisiere das Grid um eine Kachel herum
function updateGrid(x,y) {
        c.strokeStyle = gridColor;
        c.beginPath();
        c.rect(x, y, 50, 50);
        c.stroke();
}

//Zeichne ein komplette Grid ein
function drawGrid() {
    for (var i=0; i<800;i+=50) {
        for (var j=0; j<800;j+=50) {
            updateGrid(i,j);
        }
    }
}

//Im drawMode: Kachel färben und Farbe zum array hinzufügen. Im pickMode: Farbe aus array lesen und setzen
function updateCell(x,y) {
    x_start = x-x%50;
    y_start = y-y%50;

    // Berechne Tile-Koordinaten so, dass LED-Streifen als Schlangenlinie zur Matrix verkabelt werden kann
    if ((y_start/50)%2 == 0) {
        tileNumber = 16*(y_start/50)+(x_start/50);
    } else {
        tileNumber = 16*(y_start/50)+(15-(x_start/50));
    }

    if (isMouseDown) {
        if(drawMode) {
            draw(x_start, y_start);
            colorArray[tileNumber] = c.fillStyle;
        }
        else {
            setPickedColor(colorArray[tileNumber]);
        }
    }
}

//fillstyle auf Farbe setzen und Anzeige in der Farbauswahl auf Farbe ändern
function setPickedColor(color) {
    setDrawMode(true);
    removeActiveCircleColor();
    c.fillStyle = color;
    document.getElementById("favcolor").setAttribute("value", color);
    document.getElementById("favcolor").value = color;
}

//wechsle den drawMode zwischen Color Picker und drawMode
function setDrawMode(d) {
    drawMode = d;
    if (drawMode) {
        colorpicker_btn.setAttribute("style","background-color: transparent")
    }
    else {
        colorpicker_btn.setAttribute("style","background-color: #32cd32")
    }
}

//Fülle das colorArray komplett mit weiß
function initializeColorArray() {
    for (var i=0; i<256;i++) {
        colorArray[i] = "#000000"; //Schwarz
    }
}

//Wähle eine der standart Farben aus
function standardColor(elem) {
    setPickedColor(elem.getAttribute("data-color"));
    elem.classList.add("active");
}

//Wähle eine spezielle Farbe
function favColor(elem) {
    setPickedColor(elem.value);
}

//Entferne "active" Klassenattribut aus allen Farbkreisen
function removeActiveCircleColor() { 
    colorCirlce.forEach((circle) => {
        circle.classList.remove("active");
    });
}

document.addEventListener("DOMContentLoaded", function() {
    drawGrid();
    initializeColorArray();
});