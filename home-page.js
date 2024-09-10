// opens popup
function openPopup(popupId) {
    document.getElementById(popupId).style.display = "block";
}

// closes popup
function closePopup(popupId) {
    document.getElementById(popupId).style.display = "none";
}

// closes popup when clicking outside of the popup
window.onclick = function(event) {
    if (event.target.className === "popup") {
        event.target.style.display = "none";
    }
}