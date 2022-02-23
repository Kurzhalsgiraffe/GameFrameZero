var apply_btn = document.querySelector("#apply-btn");
var save_btn = document.querySelector("#save-btn");

// send colorArray to /apply route
apply_btn.addEventListener("click", async () => await sendColorArrayToServer("/apply"));

// send colorArray to /save route
save_btn.addEventListener("click", async () => await sendColorArrayToServer("/save"));


async function sendColorArrayToServer(route) {
    var response = await fetch(route, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(colorArray)
    });
    if (response.status != 200) {
        console.log("failed to send colorArray to server");
    }
}

// draw the loaded colorArray to the canvas
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

// fill the colorArray with black
function initializeColorArray() {
    for (var i=0; i<256;i++) {
        colorArray[i] = "#000000";
    }
}

// update the grid around a single pixel
function updateGrid(x,y) {
    c.strokeStyle = gridColor;
    c.beginPath();
    c.rect(x, y, 50, 50);
    c.stroke();
}

// draw the whole grid
function drawGrid() {
    for (var i=0; i<800;i+=50) {
        for (var j=0; j<800;j+=50) {
            updateGrid(i,j);
        }
    }
}

// draw a single pixel
function draw(x_start, y_start) {
    c.strokeStyle = c.fillStyle;
    c.beginPath();
    c.rect(x_start, y_start, 50, 50);
    c.fill();
    c.stroke();
}