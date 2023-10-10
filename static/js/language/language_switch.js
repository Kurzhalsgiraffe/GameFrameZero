const language_switch_handle = document.querySelector("#language-switch");
let lang;

language_switch_handle.addEventListener("click", toggleLanguage);

function toggleLanguage() {
    if (lang == "en") {
      lang = "de";
    } else {
      lang = "en";
    }
    setLanguage(lang)
    moveLanguageSlider(lang)
    setServerLanguage(lang)
}

function moveLanguageSlider(lang) {
    if (lang == "en") {
        language_switch_handle.style.transform = "translateX(40px)";
        document.documentElement.lang = "en";
    } else if (lang == "de") {       
        language_switch_handle.style.transform = "translateX(0px)";
        document.documentElement.lang = "de";
    }
}

async function loadServerLanguage() {
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
    let response = await fetch("/language/set?language="+language, {
        method: "POST",
    });
    if (response.status != 200) {
        console.log("failed to set the language");
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    lang = await loadServerLanguage();
    setLanguage(lang);
    moveLanguageSlider(lang)
});