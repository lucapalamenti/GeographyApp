const navBar = document.getElementById('nav-bar');

window.onload = () => {
    const pageName = document.createElement("P");
    pageName.textContent = "Administrator Panel";
    navBar.appendChild( pageName );
}