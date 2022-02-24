const number_tile = document.querySelectorAll(".number-tile")
const gridColor = 'rgba(255, 255, 255, 1.0)';
const PIXEL_SIZE = 32;
const FRAME_SIZE = 512;
var colorArray = [];

var assume_btn = document.querySelector("#assume-btn")
var apply_btn = document.querySelector("#apply-btn")
var animationlist = document.querySelector("#animationlist")
var canvas = document.querySelector("canvas");

animationlist.addEventListener("click", clickEventAnimationlist);
apply_btn.addEventListener("click", applyAnimation);
assume_btn.addEventListener("click", async () => await sendAnimationToServer());

function clickEventAnimationlist(e) {
    if (e.target.classList.contains('remove-btn')) {
        e.target.closest("tr").remove();
    } 
    else if (e.target.classList.contains('number-tile')) {
        loadColorArrayFromServer(e.target.id.slice(6,), "same");
    }
}

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

async function applyAnimation() {
    var animation = getAnimationList();
    var response = await fetch("/applyanimation", {
        method: "POST"
    });
    if (response.status != 200) {
        console.log("failed to apply Animation");
    }
}

function initializeAnimationlist(res) {
    res.forEach((tile) => {
        animationlist.innerHTML += `
            <tr class="animation-tile" draggable="true" ondragstart="dragIt(event)" ondragover="dragOver(event)">
                <td class="tile number-tile" id="frame-${tile[0]}">Bild ${tile[0]}<span class="remove-btn" data-bs-toggle="tooltip" data-bs-placement="right" title="Entferne das Bild aus der Animieren-Liste">X</span></td>
                <td class="tile time-tile"><input id="time-1" maxlength="4" size="4" value="${tile[1]}"></input> ms</td>
            </tr>
        `;
    });
}

function getAnimationList() {
    arr = []
    rows = animationlist.rows
    for(var i=0; i< rows.length; i++){
        tds = rows[i].getElementsByTagName("td")
        id = tds[0].id.slice(6,)
        value = tds[1].getElementsByTagName("input")[0].value
        arr.push([id,value])
    }
    return arr;
}

function dragIt(event){
  shadow=event.target;
}

function dragOver(e){
    children=Array.from(e.target.parentNode.parentNode.children);
    try {
        if(children.indexOf(e.target.parentNode)>children.indexOf(shadow)) {
            e.target.parentNode.after(shadow);
        } else {
            e.target.parentNode.before(shadow);
        }
    }
    catch {}
}

document.addEventListener("DOMContentLoaded", function() {
    drawGrid();
    loadAnimationList()
});