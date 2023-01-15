const collapses = document.querySelectorAll(".collapse-title");

collapses.forEach((collapse) => {
    collapse.addEventListener('click', collapseHandler);
});

function collapseHandler(lel) {
    var panel = this.nextElementSibling;
    if (panel.style.maxHeight) {
        this.classList.remove("active");
        panel.style.maxHeight = null;
    } else {
        removeActiveCollapse();
        this.classList.add('active');
        panel.style.maxHeight = panel.scrollHeight + 'px';
    }
}

function removeActiveCollapse() { 
    collapses.forEach((collapse) => {
        collapse.classList.remove("active");
        var panel = collapse.nextElementSibling;
        panel.style.maxHeight = null;
    });
}

document.addEventListener("DOMContentLoaded", async function() {
    await loadBrightness();
});