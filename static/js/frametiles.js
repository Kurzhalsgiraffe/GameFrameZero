const tile_body = document.querySelector("#tile-body");

let canvasObject = new CanvasObject(canvas=null, FRAME_SIZE=256, PIXEL_SIZE=16, colorArray=[], gridColor='rgba(0, 0, 0, 1.0)');
let activeTile = null;

async function loadMultipleArraysFromServer(ids) {
    let response = await fetch("/load/multiple", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(ids)
    });
    
    if (response.status == 200) {
        let res = await response.json();
        return res;
    } else {
        console.log("failed to load Arrays from server");
    }
}

async function createCanvasTiles(animation_ids, thumbnail_ids) {
    let blobs = await loadMultipleArraysFromServer(thumbnail_ids);

    for (let id of animation_ids) {
        const wrap = document.createElement("div");
        const tile = document.createElement("div");
        const canvas = document.createElement("canvas");
        const cardbody = document.createElement("div");

        wrap.classList.add("col");
        wrap.classList.add("col-lg-3");
        wrap.setAttribute("id", "wrap-"+id);
        tile.classList.add("card");
        tile.classList.add("h-80");
        tile.classList.add("bg-dark");
        tile.setAttribute("id", "tile-"+id);
        canvas.classList.add("card-img-top");
        canvas.setAttribute("width", "256px");
        canvas.setAttribute("height", "256px");
        canvas.setAttribute("id", "canvas-"+id);
        cardbody.classList.add("card-body");
        cardbody.setAttribute("id", "card-body-"+id);

        tile.appendChild(canvas);
        tile.appendChild(cardbody);
        wrap.appendChild(tile);
        tile_body.appendChild(wrap);
    }
    if (Object.keys(blobs).length !== 0) {
        await drawThumbnails(blobs,animation_ids);
    }
}

async function drawThumbnails(blobs,animation_ids) {
    let data;
    for (let x=0; x<blobs.length; x++) {
        id = animation_ids[x];
        data = blobs[x];
        
        let c = document.querySelector("#canvas-"+id);
        canvasObject.setCanvas(c);
        if (data) {
            canvasObject.setColorArray(data[1])
        } else {
            canvasObject.initializeColorArray();
        }
        canvasObject.drawColorArrayToCanvas();
        canvasObject.drawGrid();
    }
}

function selectTile(t) {
    activeTile = t;
    activeTile.classList.add("active");
    activeTile.setAttribute("style","border:2px solid #32cd32");
}

function unselectTile() {
    if (activeTile != null) {
        activeTile.classList.remove("active");
        activeTile.setAttribute("style","border: none");
        activeTile = null;
    }
}

function clearTileBody() {
    while (tile_body.firstChild) {
        tile_body.removeChild(tile_body.lastChild);
    }
}

function removeTileFromBody(frame) {
    let id = parseInt(frame.id.slice(5,));
    tile_body.removeChild(frame);
    decreaseFrameIDs(id);
}

function getLastTileID() {
    let lastChild = tile_body.lastChild;
    if (lastChild) {
        return lastChild.id.slice(5,);
    } else {
        return 0;
    }
}

function decreaseFrameIDs(id) {
    for (let i = id; i <= tile_body.children.length; i++) {
        let wrap = document.querySelector("#wrap-"+(i+1));
        let tile = wrap.firstChild;
        let canvas = tile.children[0];
        let cardbody = tile.children[1];

        wrap.setAttribute("id", "wrap-"+i);
        tile.setAttribute("id", "tile-"+i);
        canvas.setAttribute("id", "canvas-"+i);
        cardbody.setAttribute("id", "card-body-"+i);
    }
}