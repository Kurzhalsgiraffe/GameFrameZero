const language_slider_handle = document.querySelector("#language-slider-handle");
const navlink_draw = document.querySelector("#navlink-draw");
const navlink_images = document.querySelector("#navlink-images");
const navlink_animations = document.querySelector("#navlink-animations");

function setLanguage(lang) {
    console.log(lang)
    if (lang == "en") {
        language_slider_handle.style.transform = "translateX(40px)";
        document.documentElement.lang = "en";

        navlink_draw.textContent = "DRAW";
        navlink_images.textContent = "IMAGES";
        navlink_animations.textContent = "ANIMATIONS";

    } else if (lang == "de") {       
        language_slider_handle.style.transform = "translateX(0px)";
        document.documentElement.lang = "de";

        navlink_draw.textContent = "ZEICHNEN";
        navlink_images.textContent = "BILDER";
        navlink_animations.textContent = "ANIMATIONEN";
    }
}