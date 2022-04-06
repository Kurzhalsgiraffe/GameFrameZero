const gridColor = 'rgba(0, 0, 0, 1.0)';
const PIXEL_SIZE = 16;
const FRAME_SIZE = 256;
const apply_btn = document.querySelector("#apply-animation-btn");
const stop_animation_btn = document.querySelector("#stop-animation-btn");
const animations_body = document.querySelector("#animations-body");

apply_btn.addEventListener("click", applyAnimation);
stop_animation_btn.addEventListener("click", stopAnimation);

colorArray = []

async function applyAnimation() {
    let response = await fetch("/animation/apply", {
        method: "POST"
    });
    if (response.status != 200) {
        console.log("failed to apply Animation");
    }
}

async function stopAnimation() {
    let response = await fetch("/animation/stop", {
        method: "POST"
    });
    if (response.status != 200) {
        console.log("failed to stop Animation");
    }
}

// load colorArray from server relativ to the currently loaded Frame
async function loadColorArrayFromServer(id) {
    let response = await fetch("/load/"+id+"/same");
    if (response.status == 200) {
        res = await response.json();
        if (res.colorArray) {
            colorArray = res.colorArray;
        }
    } else {
        console.log("failed to load colorArray from server");
    }
}

function initializeAnimationThumbnails(animations) {
    for (let animation of animations) {
        title = animation[0]
        id = animation[1];
        // create elements
        const wrap = document.createElement("div");
        const tile = document.createElement("div");
        const canvas = document.createElement("canvas");
        const cardbody = document.createElement("div");
        const head = document.createElement("h5");
        const text = document.createElement("p");

        // add attributes
        wrap.classList.add("col")
        wrap.classList.add("col-lg-3")
        tile.classList.add("card");
        tile.classList.add("h-80");
        tile.classList.add("bg-dark");
        canvas.classList.add("card-img-top");
        canvas.setAttribute("width", "256px");
        canvas.setAttribute("height", "256px");
        canvas.setAttribute("id", "canvas-"+id);
        cardbody.classList.add("card-body");
        head.classList.add("card-title");

        // add text
        head.innerHTML = `Animation ${id}`;
        text.innerHTML = `${title}`;

        // add elements to tr and tr to dom
        cardbody.appendChild(head);
        cardbody.appendChild(text);
        tile.appendChild(canvas);
        tile.appendChild(cardbody);
        wrap.appendChild(tile);
        animations_body.appendChild(wrap);

        drawImageOnCanvas(id);
    }
}

async function drawImageOnCanvas(id) {
    const canvas = document.querySelector("#canvas-"+id);
    let c = canvas.getContext("2d");
    c.fillStyle = "#ffffff";
    c.strokeStyle = c.fillStyle;

    await loadColorArrayFromServer(id)
    drawColorArrayToCanvas(c,colorArray)
}

// draw the loaded colorArray to the canvas
function drawColorArrayToCanvas(c,colorArray) {
    for (let i=0; i<256; i++) {
        c.fillStyle = colorArray[i];

        let y = Math.floor(i/16);
        let x;
        if (y%2==0) {
            x = 15-i%16;
        } else {
            x = i%16;
        }
        draw(c,PIXEL_SIZE*x,PIXEL_SIZE*y);
    }
    drawGrid(c);
}

// draw the whole grid
function drawGrid(c) {
    for (let i=0; i<FRAME_SIZE;i+=PIXEL_SIZE) {
        for (let j=0; j<FRAME_SIZE;j+=PIXEL_SIZE) {
            c.strokeStyle = gridColor;
            c.beginPath();
            c.rect(i, j, PIXEL_SIZE, PIXEL_SIZE);
            c.stroke();
        }
    }
}

// draw a single pixel
function draw(c,x_start, y_start) {
    c.strokeStyle = c.fillStyle;
    c.beginPath();
    c.rect(x_start, y_start, PIXEL_SIZE, PIXEL_SIZE);
    c.fill();
    c.stroke();
}

initializeAnimationThumbnails([["ani1",1],["ani3",3],["ani4",4],["ani5",5],["ani6",6],["ani7",7]])