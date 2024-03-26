// Add scroll event listener
window.addEventListener("scroll", function() {
    var header = document.querySelector(".header");
    if (window.scrollY > 10) {
        header.classList.add("fixed-header");
    } else {
        header.classList.remove("fixed-header");
    }
});
