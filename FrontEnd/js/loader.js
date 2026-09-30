const LOADER_ENABLED = true;

const LOADER_DURATION = 3000;

const LOADER_FADE_DURATION = 700;

const LOADER_IMAGE = 'assets/loader/loader.gif';

const LOADER_ON_ALL_PAGES = false;

(function initBlogNestLoader() {

    if (!LOADER_ENABLED || LOADER_DURATION <= 0) {
        function removeImmediately() {
            const loader = document.getElementById('blognest-loader');
            if (loader) {
                loader.style.display = 'none';
                loader.classList.add('hidden');
            }
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', removeImmediately);
        } else {
            removeImmediately();
        }
        return;
    }

    function createLoaderElement() {
        const loader = document.createElement('div');
        loader.id = 'blognest-loader';
        loader.className = 'blognest-loader';
        loader.setAttribute('aria-label', 'Loading BlogNest');
        loader.innerHTML = `
            <div class="loader-backdrop-grid"></div>
            <div class="loader-ambient-glow"></div>
            <div class="loader-container">
                <div class="loader-media-wrapper">
                    <img id="loaderImage" class="loader-image" src="${LOADER_IMAGE}" alt="BlogNest Loader" />
                    <div id="loaderCyberRing" class="loader-cyber-ring">
                        <div class="loader-ring-spin"></div>
                        <div class="loader-ring-core">◇</div>
                    </div>
                </div>
                <div class="loader-brand">
                    <span class="loader-symbol">◇</span>
                    <span>BLOG<span>NEST</span></span>
                </div>
                <div class="loader-status">
                    <span class="loader-status-dot"></span>
                    <span class="loader-status-text">INITIALIZING KNOWLEDGE NETWORK...</span>
                </div>
                <div class="loader-progress-track">
                    <div class="loader-progress-fill"></div>
                </div>
            </div>
        `;
        document.body.prepend(loader);
        return loader;
    }

    function setupLoader() {
        let loader = document.getElementById('blognest-loader');

        if (!loader) {
            if (LOADER_ON_ALL_PAGES) {
                loader = createLoaderElement();
            } else {
                return;
            }
        }

        loader.style.setProperty('--loader-fade-time', `${LOADER_FADE_DURATION}ms`);

        const img = document.getElementById('loaderImage');
        if (img && LOADER_IMAGE) {
            if (img.getAttribute('src') !== LOADER_IMAGE) {
                img.src = LOADER_IMAGE;
            }
        }

        setTimeout(() => {
            loader.classList.add('fade-out');

            setTimeout(() => {
                loader.classList.add('hidden');
                document.body.classList.add('loader-finished');

                window.dispatchEvent(new CustomEvent('blognest:loader-complete'));
            }, LOADER_FADE_DURATION);

        }, LOADER_DURATION);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupLoader);
    } else {
        setupLoader();
    }

})();
