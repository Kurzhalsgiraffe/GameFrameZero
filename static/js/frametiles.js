const tile_body = document.querySelector("#tile-body");

let activeTile = null;

async function loadMultipleSVGsFromServer(ids) {
    let response = await fetch("/image/load/multiple/svg", {
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
        console.log("failed to load Color Arrays from server");
    }
}

async function createAnimationTiles(tileIDs, imageIDs) {
    let blobs = await loadMultipleSVGsFromServer(imageIDs);
    let tileID;
    let imageID;

    for (let x=0; x<tileIDs.length; x++) {
        tileID = tileIDs[x]
        imageID = imageIDs[x]

        const wrap = document.createElement("div");
        const tile = document.createElement("div");
        const svg = document.createElement("img");
        const cardbody = document.createElement("div");

        wrap.classList.add("col");
        wrap.classList.add("col-lg-3");
        wrap.setAttribute("id", "wrap-"+tileID);
        tile.classList.add("card");
        tile.classList.add("h-80");
        tile.classList.add("bg-dark");
        tile.setAttribute("id", "tile-"+tileID);
        svg.classList.add("card-img-top");
        svg.setAttribute("width", "256px");
        svg.setAttribute("id", "svg-"+tileID);
        cardbody.classList.add("card-body");
        cardbody.setAttribute("id", "card-body-"+tileID);

        if (imageID) {
            data = blobs[imageID];
        } else {
            data = blobs[-1];
        }
        
        svg.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data)}`;

        tile.appendChild(svg);
        tile.appendChild(cardbody);
        wrap.appendChild(tile);
        tile_body.appendChild(wrap);
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
}

function getLastTileID() {
    let lastChild = tile_body.lastChild;
    if (lastChild) {
        return lastChild.id.slice(5,);
    } else {
        return 0;
    }
}