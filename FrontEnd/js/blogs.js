const blogSearch =
    document.getElementById('blogSearch');

const searchButton =
    document.getElementById('searchButton');

const keywordMode =
    document.getElementById('keywordMode');

const semanticMode =
    document.getElementById('semanticMode');

const searchModeInfo =
    document.getElementById('searchModeInfo');

const blogsGrid =
    document.getElementById('blogsGrid');

const resultsInfo =
    document.getElementById('resultsInfo');

const pagination =
    document.getElementById('pagination');

let searchMode = 'keyword';

let currentPage = 1;

const POSTS_PER_PAGE = 12;

function setSearchMode(mode) {

    searchMode = mode;

    if (keywordMode) {

        keywordMode.classList.toggle(
            'active',
            mode === 'keyword'
        );

    }

    if (semanticMode) {

        semanticMode.classList.toggle(
            'active',
            mode === 'semantic'
        );

    }

    if (
        blogSearch &&
        searchModeInfo
    ) {

        if (mode === 'semantic') {

            blogSearch.placeholder =
                'Ask something like: Java backend development...';

            searchModeInfo.textContent =
                'Semantic search finds blogs based on meaning, not just exact words.';

        } else {

            blogSearch.placeholder =
                'Search BlogNest...';

            searchModeInfo.textContent =
                'Keyword search looks for matching words and phrases.';

        }

    }

}

if (keywordMode) {

    keywordMode.addEventListener(
        'click',
        function () {

            setSearchMode('keyword');

        }
    );

}

if (semanticMode) {

    semanticMode.addEventListener(
        'click',
        function () {

            setSearchMode('semantic');

        }
    );

}

async function performSearch() {

    const query =
        blogSearch.value.trim();

    if (!query) {

        currentPage = 1;

        await loadBlogs();

        return;

    }

    searchButton.disabled =
        true;

    searchButton.textContent =
        'SEARCHING...';

    showLoading(
        searchMode === 'semantic'
            ? 'RUNNING SEMANTIC SEARCH...'
            : 'SEARCHING BLOGNEST...'
    );

    try {

        let response;

        if (searchMode === 'keyword') {

            response =
                await searchPosts(query);

        }

        else {

            response =
                await semanticSearch(query);

        }

        console.log(
            'Search response:',
            response
        );

        const posts =
            response.posts ||
            response.results ||
            response.data ||
            [];

        renderPosts(
            Array.isArray(posts)
                ? posts
                : []
        );

        if (resultsInfo) {

            resultsInfo.innerHTML =
                `
                    <strong>
                        ${posts.length}
                    </strong>
                    result${posts.length === 1 ? '' : 's'}
                    for
                    <strong>
                        "${escapeHTML(query)}"
                    </strong>
                    —
                    ${
                        searchMode === 'semantic'
                            ? 'Semantic Search'
                            : 'Keyword Search'
                    }
                `;

        }

        if (pagination) {
            pagination.innerHTML = '';
        }

    } catch (error) {

        console.error(
            'Search error:',
            error
        );

        showError(
            error.message ||
            'Search failed.'
        );

        if (resultsInfo) {

            resultsInfo.textContent =
                'Search failed.';

        }

    } finally {

        searchButton.disabled =
            false;

        searchButton.textContent =
            'SEARCH';

    }

}

if (searchButton) {

    searchButton.addEventListener(
        'click',
        performSearch
    );

}

if (blogSearch) {

    blogSearch.addEventListener(
        'keydown',
        function (event) {

            if (event.key === 'Enter') {

                performSearch();

            }

        }
    );

}

async function loadBlogs(
    page = currentPage
) {

    try {

        currentPage =
            page;

        showLoading(
            'CONNECTING TO BLOGNEST NETWORK...'
        );

        const response =
            await getPosts({

                page: currentPage,

                limit: POSTS_PER_PAGE,

                status: 'published'

            });

        console.log(
            'Blogs response:',
            response
        );

        const posts =
            response.posts ||
            response.data ||
            [];

        const safePosts =
            Array.isArray(posts)
                ? posts
                : [];

        renderPosts(
            safePosts
        );

        const totalPosts =
            Number(
                response.totalPosts
            ) || safePosts.length;

        const totalPages =
            Number(
                response.totalPages
            ) || 1;

        if (resultsInfo) {

            resultsInfo.innerHTML =
                `
                    Showing
                    <strong>
                        ${safePosts.length}
                    </strong>
                    blog${safePosts.length === 1 ? '' : 's'}
                    —
                    Page
                    <strong>
                        ${currentPage}
                    </strong>
                    of
                    <strong>
                        ${totalPages}
                    </strong>
                    ·
                    ${totalPosts}
                    total
                `;

        }

        renderPagination(
            totalPages
        );

    } catch (error) {

        console.error(
            'Blog loading error:',
            error
        );

        showError(
            error.message ||
            'Unable to load blogs.'
        );

        if (resultsInfo) {

            resultsInfo.textContent =
                'Unable to load blogs.';

        }

    }

}

function renderPosts(posts) {

    if (!blogsGrid) {
        return;
    }

    if (
        !posts ||
        !posts.length
    ) {

        blogsGrid.innerHTML = `

            <div class="empty-state">

                <h2>
                    NO BLOGS FOUND
                </h2>

                <p>
                    Try another search or explore
                    a different topic.
                </p>

            </div>

        `;

        return;

    }

    blogsGrid.innerHTML =
        posts.map(
            function (post) {

                const author =
                    typeof post.author === 'object'
                        ? post.author?.name
                        : 'Unknown';

                const excerpt =
                    post.excerpt ||
                    (
                        post.content
                            ? post.content.substring(
                                0,
                                160
                            )
                            : ''
                    );

                const category =
                    post.category ||
                    'GENERAL';

                return `

                    <article class="blog-card">

                        <div class="blog-category">

                            ${escapeHTML(
                                category
                            )}

                        </div>

                        <h2>

                            ${escapeHTML(
                                post.title ||
                                'Untitled Blog'
                            )}

                        </h2>

                        <p class="blog-excerpt">

                            ${escapeHTML(
                                excerpt
                            )}

                            ${
                                excerpt.length >= 160
                                    ? '...'
                                    : ''
                            }

                        </p>

                        <div class="blog-meta">

                            <span class="blog-author">

                                ${escapeHTML(
                                    author
                                )}

                            </span>

                            <span>

                                ${
                                    post.status
                                        ? escapeHTML(
                                            post.status
                                        )
                                        : 'Published'
                                }

                            </span>

                        </div>

                        <a
                            class="read-more"
                            href="blog.html?id=${encodeURIComponent(
                                post._id
                            )}"
                        >

                            READ ARTICLE →

                        </a>

                    </article>

                `;

            }
        ).join('');

}

function renderPagination(
    totalPages
) {

    if (!pagination) {
        return;
    }

    pagination.innerHTML = '';

    if (
        !totalPages ||
        totalPages <= 1
    ) {

        return;

    }

    const previous =
        document.createElement(
            'button'
        );

    previous.textContent =
        '←';

    previous.disabled =
        currentPage <= 1;

    previous.addEventListener(
        'click',
        function () {

            if (currentPage > 1) {

                loadBlogs(
                    currentPage - 1
                );

                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });

            }

        }
    );

    pagination.appendChild(
        previous
    );

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const button =
            document.createElement(
                'button'
            );

        button.textContent =
            page;

        if (
            page === currentPage
        ) {

            button.classList.add(
                'active'
            );

        }

        button.addEventListener(
            'click',
            function () {

                loadBlogs(page);

                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });

            }
        );

        pagination.appendChild(
            button
        );

    }

    const next =
        document.createElement(
            'button'
        );

    next.textContent =
        '→';

    next.disabled =
        currentPage >= totalPages;

    next.addEventListener(
        'click',
        function () {

            if (
                currentPage <
                totalPages
            ) {

                loadBlogs(
                    currentPage + 1
                );

                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });

            }

        }
    );

    pagination.appendChild(
        next
    );

}

function showLoading(
    message
) {

    if (!blogsGrid) {
        return;
    }

    blogsGrid.innerHTML = `

        <div class="loading">

            ${escapeHTML(
                message
            )}

        </div>

    `;

}

function showError(
    message
) {

    if (!blogsGrid) {
        return;
    }

    blogsGrid.innerHTML = `

        <div class="empty-state">

            <h2>
                SEARCH ERROR
            </h2>

            <p>
                ${escapeHTML(
                    message
                )}
            </p>

        </div>

    `;

}

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return '';

    }

    return String(value)

        .replace(
            /&/g,
            '&amp;'
        )

        .replace(
            /</g,
            '&lt;'
        )

        .replace(
            />/g,
            '&gt;'
        )

        .replace(
            /"/g,
            '&quot;'
        )

        .replace(
            /'/g,
            '&#039;'
        );

}

setSearchMode(
    'keyword'
);

const initialUrlParams = new URLSearchParams(window.location.search);
const initialQuery = initialUrlParams.get('q');

if (initialQuery && initialQuery.trim() && blogSearch) {
    blogSearch.value = initialQuery.trim();
    performSearch();
} else {
    loadBlogs();
}
