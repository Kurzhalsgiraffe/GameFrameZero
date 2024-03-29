const brightness_value = document.querySelector("#sidebar-brightness-value");
const brightness_slider = document.querySelector("#sidebar-brightness-slider");

brightness_slider.addEventListener("change", ()=>{
    brightness_value.textContent = brightness_slider.value;
    setBrightness(brightness_slider.value);
});

brightness_slider.addEventListener("input", function() {
    brightness_value.textContent = brightness_slider.value;
});

async function setBrightness(brightness) {
    let response = await fetch("/brightness/set?brightness="+brightness, {
        method: "POST",
    });
    if (response.status != 200) {
        console.log("failed to apply the brightness");
    }
}

async function loadBrightness() {
    let response = await fetch("/brightness/load");
    if (response.status == 200) {
        res = await response.text();
        brightness_value.textContent = res;
        brightness_slider.setAttribute("value", res);
    } else {
        console.log("failed to load brightness value from server");
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    await loadBrightness();
});