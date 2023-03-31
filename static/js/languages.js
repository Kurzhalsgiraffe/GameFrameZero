const language_slider_handle = document.querySelector("#language-switch");
let lang;

language_slider_handle.addEventListener("click", toggleLanguage);

function toggleLanguage() {
    if (lang == "en") {
      lang = "de";
    } else {
      lang = "en";
    }
    setLanguage(lang)
    changeLanguageSlider(lang)
    setServerLanguage(lang)
}

function changeLanguageSlider(lang) {
    if (lang == "en") {
        language_slider_handle.style.transform = "translateX(40px)";
        document.documentElement.lang = "en";
    } else if (lang == "de") {       
        language_slider_handle.style.transform = "translateX(0px)";
        document.documentElement.lang = "de";
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
    setLanguage(lang);
    changeLanguageSlider(lang)
});