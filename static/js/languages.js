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
});