class CanvasObject {
    constructor(canvas, FRAME_SIZE, PIXEL_SIZE, colorArray=[], gridColor="rgba(255, 255, 255, 1.0)") {
        this.FRAME_SIZE = FRAME_SIZE;
        this.PIXEL_SIZE = PIXEL_SIZE;
        this.gridColor = gridColor;
        this.colorArray = colorArray;
        this.currentPos = 1;
        this.imageName = "";
        this.setColorArray(colorArray);
        
        if (canvas != null) {
            this.setCanvas(canvas);
        }       
    }

    setCanvas(canvas) {
        this.canvas = canvas;
        this.c = this.canvas.getContext("2d");
        this.c.fillStyle = "#ffffff";
    }

    setColorArray(colorArray) {
        this.colorArray = colorArray;
    }

    drawColorArrayToCanvas() {
        for (let i=0; i<256; i++) {
            this.c.fillStyle = this.colorArray[i];
            let y = Math.floor(i/16);
            let x;
    
            if (y%2==0) {
                x = 15-i%16;
            } else {
                x = i%16;
            }
            this.draw(this.PIXEL_SIZE*x, this.PIXEL_SIZE*y);
        }
        this.drawGrid();
    }

    draw(x_start, y_start) {
        this.c.strokeStyle = this.c.fillStyle;
        this.c.beginPath();
        this.c.rect(x_start, y_start, this.PIXEL_SIZE, this.PIXEL_SIZE);
        this.c.fill();
        this.c.stroke();
    }

    initializeColorArray() {
        for (let i=0; i<256;i++) {
            this.colorArray[i] = "#000000";
        }
    }

    drawGrid() {
        for (let x=0; x<this.FRAME_SIZE; x+=this.PIXEL_SIZE) {
            for (let y=0; y<this.FRAME_SIZE; y+=this.PIXEL_SIZE) {
                this.updateGrid(x,y);
            }
        }
    }

    updateGrid(x,y) {
        this.c.strokeStyle = this.gridColor;
        this.c.beginPath();
        this.c.rect(x, y, this.PIXEL_SIZE, this.PIXEL_SIZE);
        this.c.stroke();
    }

    async loadColorArrayFromServer(id=null,pos=null) {
        let response
        if (id!=null && pos!=null) {
            response = await fetch("/image/load/single?image_id="+id+"&pos="+pos);
        } else if(id!=null && pos==null) {
            response = await fetch("/image/load/single?image_id="+id);
        } else if(id==null && pos!=null) {
            response = await fetch("/image/load/single?pos="+pos);
        }
        
        let res = await response.json();
        if (response.status == 200) {
            if (res.colorArray) {
                this.colorArray = res.colorArray;
                this.currentPos = res.imageID;
                this.imageName = res.imageName;
            } else {
                this.colorArray = []
                this.currentPos = 0
                this.imageName = ""
            }       
        } else {
            console.log("failed to load colorArray from server");
        }
    }

    async sendColorArrayToServer(route) {
        let response = await fetch(route, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(this.colorArray)
        });
        if (response.status != 200) {
            console.log("failed to send colorArray to server");
        }
    }

    async replaceColorArrayOnServer(image_id=null) {
        let response = await fetch("/image/replace?image_id="+image_id, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(this.colorArray)
        });
        if (response.status != 200) {
            console.log("failed to send colorArray to server");
        }
    }
}