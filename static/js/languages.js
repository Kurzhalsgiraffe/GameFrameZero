const language_slider_handle = document.querySelector("#language-slider-handle");

let lang;

language_slider_handle.addEventListener("click", toggleLanguage);

function toggleLanguage() {
    if (lang == "english") {
      lang = "deutsch";
    } else {
      lang = "english";
    }
    setLanguage(lang)
    applyLanguage(lang)
}

async function setLanguage(lang) {
    console.log(lang)
    if (lang == "english") {
        language_slider_handle.style.transform = "translateX(40px)";
    } else if (lang == "deutsch") {
        language_slider_handle.style.transform = "translateX(0px)";
    }
}

async function applyLanguage(language) {
    let response = await fetch("/language/apply/"+language, {
        method: "POST",
    });
    if (response.status != 200) {
        console.log("failed to set the language");
    }
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

document.addEventListener("DOMContentLoaded", async function() {
    lang = await loadLanguage();
    await setLanguage(lang)
});