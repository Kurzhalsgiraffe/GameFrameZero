const number_tile = document.querySelectorAll(".number-tile")
const gridColor = 'rgba(255, 255, 255, 1.0)';
const PIXEL_SIZE = 32;
const FRAME_SIZE = 512;
var colorArray = [];

var assume_btn = document.querySelector("#assume-btn")
var apply_btn = document.querySelector("#apply-animation-btn")
var stop_animation_btn = document.querySelector("#stop-animation-btn")
var animationlist_body = document.querySelector("#animationlist-body")
var canvas = document.querySelector("canvas");

apply_btn.addEventListener("click", applyAnimation);
assume_btn.addEventListener("click", async () => await sendAnimationToServer());
stop_animation_btn.addEventListener("click", stopAnimation);

//load the current Animationlist from the server and display it in the table
async function loadAnimationList() {
    var response = await fetch("/loadanimationlist", {
        method: "GET"
    });
    if (response.status != 200) {
        console.log("failed to load animationList from server")
    }
    res = await response.json()
    if (!(Object.keys(res).length === 0 && res.constructor === Object)) {
        initializeAnimationlist(res)
    }
}

// load colorArray from server relativ to the currently loaded Frame
async function loadColorArrayFromServer(id,pos) {
    var response = await fetch("/load/"+id+"/"+pos, {
        method: "GET"
    });
    if (response.status != 200) {
        console.log("failed to load colorArray from server")
    }
    res = await response.json()
    if (Object.keys(res).length === 0 && res.constructor === Object) {
        initializeColorArray();
    } else {
        colorArray = res.colorArray
    }
    drawColorArrayToCanvas();
}

async function sendAnimationToServer() {
    var animation = getAnimationList();
    var response = await fetch("/updateanimationlist", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(animation)
    });
    if (response.status != 200) {
        console.log("failed to send Animation to server");
    }
}

function initializeAnimationlist(tiles) {
    let x = 0;
    animationlist_body.innerHTML = '';

    for (let tile of tiles) {
        frameID = tile[0]
        time = tile[1]
        // create elements
        const tr = document.createElement("tr");
        const numberTile = document.createElement("td");
        const timeTile = document.createElement("td");

        // add attributes
        tr.setAttribute("draggable", true)
        tr.setAttribute("id", "al-"+x)

        numberTile.classList.add("number-tile");
        numberTile.setAttribute("value", "frame-"+frameID)

        timeTile.classList.add("time-tile");

        // add text
        numberTile.innerHTML = `Bild ${frameID}<span class="remove-btn" data-bs-toggle="tooltip" data-bs-placement="right" title="Entferne das Bild aus der Animieren-Liste">X</span>`;
        timeTile.innerHTML = `<input maxlength="4" size="4" value="${time}"></input> ms`;

        // add elements to tr and tr to dom
        tr.appendChild(numberTile);
        tr.appendChild(timeTile);
        animationlist_body.appendChild(tr);

        x++;
    }
}

function getAnimationList() {
    arr = []
    rows = animationlist_body.rows
    for(var i=0; i< rows.length; i++){
        tds = rows[i].getElementsByTagName("td")
        frameid = tds[0].getAttribute('value').slice(6,)
        time = tds[1].getElementsByTagName("input")[0].value
        arr.push([frameid,time])
    }
    return arr;
}

function drag(event) {
    event.dataTransfer.setData('src', event.currentTarget.id);
}

function drop(event) {
    event.preventDefault();
    let src = document.getElementById(event.dataTransfer.getData('src'));
    let target = event.currentTarget;
    if (src == target) return false;

    let srcHolder = document.createElement('div');
    let targetHolder = document.createElement('div');

    animationlist_body.replaceChild(srcHolder, src);
    animationlist_body.replaceChild(targetHolder, target);

    animationlist_body.replaceChild(target, srcHolder);
    animationlist_body.replaceChild(src, targetHolder);
}

function attachHandlers() {
    let rows = animationlist_body.children;
    for (let row of rows) {
        row.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        row.addEventListener('dragstart', (e) => {
            drag(e);
        });

        row.addEventListener('drop', (e) => {
            drop(e);
        });

        row.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) {
                e.currentTarget.remove();
            } 
            else if (e.target.classList.contains('number-tile')) {
                loadColorArrayFromServer(e.target.getAttribute('value').slice(6,), "same");
            }
        });
    }
}

async function applyAnimation() {
    var animation = getAnimationList();
    var response = await fetch("/applyanimation", {
        method: "POST"
    });
    if (response.status != 200) {
        console.log("failed to apply Animation");
    }
}

async function stopAnimation() {
    var response = await fetch("/stopanimation", {
        method: "POST"
    });
    if (response.status != 200) {
        console.log("failed to stop Animation");
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    drawGrid();
    await loadAnimationList()
    attachHandlers();
});