const token =
    localStorage.getItem(
        'blognest-token'
    );

const profileAvatar =
    document.getElementById(
        'profileAvatar'
    );

const profileName =
    document.getElementById(
        'profileName'
    );

const profileEmail =
    document.getElementById(
        'profileEmail'
    );

const profileRole =
    document.getElementById(
        'profileRole'
    );

const postCount =
    document.getElementById(
        'postCount'
    );

const myPosts =
    document.getElementById(
        'myPosts'
    );

const profileMessage =
    document.getElementById(
        'profileMessage'
    );

const logoutButton =
    document.getElementById(
        'logoutButton'
    );

if (!token) {
    window.location.href =
        'login.html';
}

function escapeHTML(value) {
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

async function loadProfile() {
    try {
        const response =
            await getCurrentUser();

        const currentUser =
            response.user ||
            response.data ||
            response;

        const name =
            currentUser.name ||
            'BlogNest User';

        const email =
            currentUser.email ||
            '';

        const role =
            currentUser.role ||
            'Reader';

        profileName.textContent =
            name;

        profileEmail.textContent =
            email;

        profileRole.textContent =
            role.toUpperCase();

        profileAvatar.textContent =
            name
                .charAt(0)
                .toUpperCase();

        await loadMyPosts();
    } catch (error) {
        console.error(
            'Profile error:',
            error
        );

        profileMessage.textContent =
            error.message ||
            'Unable to load profile.';

        profileMessage.style.color =
            '#ff5577';
    }
}

async function loadMyPosts() {
    try {
        profileMessage.textContent =
            'Loading your blogs...';

        const response =
            await getMyPosts({
                limit: 100
            });

        const posts =
            Array.isArray(
                response.posts
            )
                ? response.posts
                : [];

        postCount.textContent =
            posts.length;

        if (!posts.length) {
            profileMessage.textContent =
                'You have not created any blogs yet.';

            myPosts.innerHTML = '';

            return;
        }

        profileMessage.textContent =
            '';

        myPosts.innerHTML =
            posts.map(
                function (post) {
                    const status =
                        post.status ||
                        'draft';

                    const excerpt =
                        post.excerpt ||
                        post.content ||
                        '';

                    const safeId =
                        encodeURIComponent(
                            post._id
                        );

                    const date =
                        post.createdAt
                            ? new Date(
                                post.createdAt
                            ).toLocaleDateString(
                                'en-IN'
                            )
                            : '';

                    const statusClass =
                        status === 'published'
                            ? 'status-published'
                            : 'status-draft';

                    const actions =
                        status === 'draft'
                            ? `
                                <div class="my-post-actions">
                                    <a
                                        href="edit.html?id=${safeId}"
                                        class="button button-small button-outline"
                                    >
                                        EDIT DRAFT
                                    </a>

                                    <button
                                        type="button"
                                        class="button button-small button-primary"
                                        onclick="publishDraft('${post._id}')"
                                    >
                                        PUBLISH
                                    </button>
                                </div>
                            `
                            : `
                                <div class="my-post-actions">
                                    <a
                                        href="blog.html?id=${safeId}"
                                        class="button button-small button-outline"
                                    >
                                        VIEW
                                    </a>

                                    <a
                                        href="edit.html?id=${safeId}"
                                        class="button button-small button-outline"
                                    >
                                        EDIT
                                    </a>
                                </div>
                            `;

                    return `
                        <article class="my-post">

                            <h3>
                                ${
                                    status === 'draft'
                                        ? escapeHTML(
                                            post.title
                                        )
                                        : `
                                            <a
                                                href="blog.html?id=${safeId}"
                                            >
                                                ${escapeHTML(
                                                    post.title
                                                )}
                                            </a>
                                        `
                                }
                            </h3>

                            <div class="my-post-excerpt">
                                ${escapeHTML(
                                    excerpt.substring(
                                        0,
                                        180
                                    )
                                )}
                            </div>

                            <div class="my-post-meta">

                                <span class="${statusClass}">
                                    ${escapeHTML(
                                        status.toUpperCase()
                                    )}
                                </span>

                                <span>
                                    ${escapeHTML(
                                        post.category ||
                                        'General'
                                    )}
                                </span>

                                <span>
                                    ${escapeHTML(
                                        date
                                    )}
                                </span>

                            </div>

                            ${actions}

                        </article>
                    `;
                }
            ).join('');
    } catch (error) {
        console.error(
            'Posts loading error:',
            error
        );

        profileMessage.textContent =
            error.message ||
            'Unable to load your blogs.';

        profileMessage.style.color =
            '#ff5577';
    }
}

async function publishDraft(id) {
    const confirmed =
        window.confirm(
            'Publish this draft? It will become visible to everyone.'
        );

    if (!confirmed) {
        return;
    }

    try {
        profileMessage.textContent =
            'Publishing draft...';

        profileMessage.style.color =
            'var(--primary)';

        await updatePost(
            id,
            {
                status: 'published'
            }
        );

        profileMessage.textContent =
            '✓ Draft published successfully.';

        profileMessage.style.color =
            'var(--primary)';

        await loadMyPosts();
    } catch (error) {
        console.error(
            'Publish draft error:',
            error
        );

        profileMessage.textContent =
            error.message ||
            'Unable to publish draft.';

        profileMessage.style.color =
            '#ff5577';
    }
}

if (logoutButton) {
    logoutButton.addEventListener(
        'click',
        function () {
            localStorage.removeItem(
                'blognest-token'
            );

            localStorage.removeItem(
                'blognest-user'
            );

            window.location.href =
                'index.html';
        }
    );
}

loadProfile();