class AppHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header>
                <div class="flex-row gap-5">
                    <h1>Map Quiz</h1>
                </div>
                <nav class="flex-row gap-5" id="nav-bar">
                    <a href="../">Home</a>
                    <strong>></strong>
                </nav>
            </header>
        `;
    }
}

customElements.define('app-header', AppHeader);