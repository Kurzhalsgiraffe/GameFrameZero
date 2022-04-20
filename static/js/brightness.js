const brightness_value = document.querySelector("#brightness-value");
const brightness_slider = document.querySelector("#brightness-slider");
var isMouseDownSlider;

brightness_slider.addEventListener("click", ()=>{
    brightness_value.textContent = brightness_slider.value;
});

brightness_slider.addEventListener("mousedown", ()=>{
    isMouseDownSlider = true;
});

brightness_slider.addEventListener("mouseup", ()=>{
    isMouseDownCanvas = false;
    applyBrightness(brightness_slider.value);
});

brightness_slider.addEventListener("mousemove", function() {
    if (isMouseDownSlider) {
        brightness_value.textContent = brightness_slider.value;
    }
});

async function applyBrightness(brightness) {
    let response = await fetch("/brightness/apply/"+brightness, {
        method: "POST",
    });
    if (response.status != 200) {
        console.log("failed to apply the Brightness");
    }
}

async function loadBrightness() {
    let response = await fetch("/brightness/load");
    if (response.status == 200) {
        res = await response.text();
        brightness_value.textContent = res;
        brightness_slider.setAttribute("value", res);
    } else {
        console.log("failed to load brightness value from server")
    }
    
}

document.addEventListener("DOMContentLoaded", async function() {
    await loadBrightness();
});