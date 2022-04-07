const canvas = document.querySelector("canvas");
const number_tile = document.querySelectorAll(".number-tile");
const assume_btn = document.querySelector("#assume-btn");
const animationlist_body = document.querySelector("#animationlist-body");
const frameNumber = document.getElementById("framenumber");

var canvasObject = new CanvasObject(canvas, FRAME_SIZE=512, PIXEL_SIZE=32, colorArray=[]);

assume_btn.addEventListener("click", async () => await sendAnimationToServer());

async function loadAndShow(id=null,pos=null) {
    await canvasObject.loadColorArrayFromServer(id,pos);
    currentPos = canvasObject.currentPos;
    if (canvasObject.colorArray.length === 0) {
        canvasObject.initializeColorArray();
        frameNumber.textContent = "KEIN BILD";
    } else {
        frameNumber.textContent = "BILD " + currentPos;
    }
    canvasObject.drawColorArrayToCanvas();
    canvasObject.drawGrid();
}

function getAnimationList() {
    arr = [];
    rows = animationlist_body.rows;
    for(let i=0; i< rows.length; i++){
        tds = rows[i].getElementsByTagName("td");
        frameid = tds[0].getAttribute('value').slice(6,);
        time = tds[1].getElementsByTagName("input")[0].value;
        arr.push([frameid,time]);
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
                let id = e.target.getAttribute('value').slice(6,)
                loadAndShow(id,null);
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    canvasObject.initializeColorArray();
    // if there is an id in the url, load it and draw it on the canvas, so it can be edited
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if(urlParams.has('id')) {
        const loadedIDToEdit = urlParams.get('id');
        console.log(loadedIDToEdit)
    }
    canvasObject.drawGrid()
    //attachHandlers();
});