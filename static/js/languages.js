const language_slider_handle = document.querySelector("#language-slider-handle");
const navlink_draw = document.querySelector("#navlink-draw");
const navlink_images = document.querySelector("#navlink-images");
const navlink_animations = document.querySelector("#navlink-animations");

let lang;

language_slider_handle.addEventListener("click", toggleLanguage);

function toggleLanguage() {
    if (lang == "en") {
      lang = "de";
    } else {
      lang = "en";
    }
    setLanguage(lang)
    setServerLanguage(lang)
}

async function loadLanguage() {
    let response = await fetch("/language/load");
    let lang = "";
    if (response.status == 200) {
        lang = await response.text();
    } else {
        console.log("failed to load language from server");
    }
    return lang;
}

async function setLanguage(lang) {
    console.log(lang)
    if (lang == "en") {
        language_slider_handle.style.transform = "translateX(40px)";
        document.documentElement.lang = "en"
        navlink_draw.textContent = "DRAW";
        navlink_images.textContent = "IMAGES";
        navlink_animations.textContent = "ANIMATIONS";
       
    } else if (lang == "de") {       
        language_slider_handle.style.transform = "translateX(0px)";
        document.documentElement.lang = "de"
        navlink_draw.textContent = "ZEICHNEN";
        navlink_images.textContent = "BILDER";
        navlink_animations.textContent = "ANIMATIONEN";
    }
}

async function setServerLanguage(language) {
    let response = await fetch("/language/apply/"+language, {
        method: "POST",
    });
    if (response.status != 200) {
        console.log("failed to set the language");
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    lang = await loadLanguage();
    await setLanguage(lang)
});