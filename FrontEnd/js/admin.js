const token = localStorage.getItem('blognest-token');

if (!token) {
    window.location.href = 'login.html';
}

const adminWarning =
    document.getElementById('adminWarning');

const totalPosts =
    document.getElementById('totalPosts');

const publishedPosts =
    document.getElementById('publishedPosts');

const draftPosts =
    document.getElementById('draftPosts');

const adminPosts =
    document.getElementById('adminPosts');

const postsMessage =
    document.getElementById('postsMessage');

const categoryForm =
    document.getElementById('categoryForm');

const categoryName =
    document.getElementById('categoryName');

const categoryDescription =
    document.getElementById('categoryDescription');

const categoryMessage =
    document.getElementById('categoryMessage');

const adminCategories =
    document.getElementById('adminCategories');

const adminComments =
    document.getElementById('adminComments');

const commentMessage =
    document.getElementById('commentMessage');

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return '';
    }

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function checkAdminAccess() {

    try {

        const response =
            await getCurrentUser();

        const user =
            response.user ||
            response.data ||
            response;

        const role =
            user.role;

        if (
            role !== 'Admin' &&
            role !== 'Editor'
        ) {

            if (adminWarning) {

                adminWarning.style.display =
                    'block';

                adminWarning.textContent =
                    'ACCESS DENIED — ADMIN OR EDITOR ROLE REQUIRED.';

            }

            alert(
                'You do not have permission to access the Admin Dashboard.'
            );

            window.location.href =
                'index.html';

            return false;
        }

        return true;

    } catch (error) {

        console.error(
            'Admin access error:',
            error
        );

        localStorage.removeItem(
            'blognest-token'
        );

        localStorage.removeItem(
            'blognest-user'
        );

        window.location.href =
            'login.html';

        return false;
    }
}

async function loadAdminPosts() {

    try {

        const response =
            await getPosts({
                limit: 100
            });

        console.log(
            'Admin posts:',
            response
        );

        const posts =
            response.posts ||
            response.data ||
            [];

        if (!Array.isArray(posts)) {

            throw new Error(
                'Invalid posts response.'
            );
        }

        const published =
            posts.filter(function (post) {

                return post.status ===
                    'published';

            });

        const drafts =
            posts.filter(function (post) {

                return post.status ===
                    'draft';

            });

        if (totalPosts) {
            totalPosts.textContent =
                posts.length;
        }

        if (publishedPosts) {
            publishedPosts.textContent =
                published.length;
        }

        if (draftPosts) {
            draftPosts.textContent =
                drafts.length;
        }

        if (!posts.length) {

            if (postsMessage) {

                postsMessage.textContent =
                    'No posts found.';

            }

            if (adminPosts) {
                adminPosts.innerHTML = '';
            }

            return;
        }

        if (postsMessage) {
            postsMessage.textContent = '';
        }

        if (!adminPosts) {
            return;
        }

        adminPosts.innerHTML =
            posts.map(function (post) {

                const author =
                    typeof post.author === 'object'
                        ? post.author?.name
                        : 'Unknown';

                const status =
                    post.status ||
                    'draft';

                return `

                    <tr>

                        <td>
                            ${escapeHTML(
                                post.title
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                author || 'Unknown'
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                post.category ||
                                'General'
                            )}
                        </td>

                        <td>

                            <span
                                class="admin-status ${
                                    status === 'draft'
                                        ? 'draft'
                                        : ''
                                }"
                            >
                                ${escapeHTML(
                                    status.toUpperCase()
                                )}
                            </span>

                        </td>

                        <td>

                            <button
                                class="admin-button"
                                onclick="viewPost('${post._id}')"
                            >
                                VIEW
                            </button>

                            <button
                                class="admin-button"
                                onclick="editPost('${post._id}')"
                            >
                                EDIT
                            </button>

                            <button
                                class="admin-button delete"
                                onclick="deleteAdminPost('${post._id}')"
                            >
                                DELETE
                            </button>

                        </td>

                    </tr>

                `;

            }).join('');

    } catch (error) {

        console.error(
            'Loading posts failed:',
            error
        );

        if (postsMessage) {

            postsMessage.textContent =
                error.message ||
                'Unable to load posts.';

            postsMessage.style.color =
                '#ff5577';

        }
    }
}

function viewPost(id) {

    window.location.href =
        `blog.html?id=${encodeURIComponent(id)}`;
}

function editPost(id) {

    window.location.href =
        `edit.html?id=${encodeURIComponent(id)}`;
}

async function deleteAdminPost(id) {

    const confirmed =
        window.confirm(
            'Delete this blog permanently?'
        );

    if (!confirmed) {
        return;
    }

    try {

        await deletePost(id);

        alert(
            'Blog deleted successfully.'
        );

        await loadAdminPosts();

    } catch (error) {

        console.error(
            'Delete error:',
            error
        );

        alert(
            error.message ||
            'Unable to delete blog.'
        );
    }
}

async function loadCategories() {

    if (!adminCategories) {
        return;
    }

    try {

        if (categoryMessage) {

            categoryMessage.textContent =
                'Loading categories...';

            categoryMessage.style.color =
                'var(--text-muted)';
        }

        const response =
            await getCategories();

        console.log(
            'Categories:',
            response
        );

        const categories =
            response.categories ||
            response.data ||
            response ||
            [];

        if (!Array.isArray(categories)) {

            throw new Error(
                'Invalid category response.'
            );
        }

        if (!categories.length) {

            adminCategories.innerHTML =
                '';

            if (categoryMessage) {

                categoryMessage.textContent =
                    'No categories found.';

            }

            return;
        }

        if (categoryMessage) {
            categoryMessage.textContent = '';
        }

        adminCategories.innerHTML =
            categories.map(function (category) {

                return `

                    <tr>

                        <td>
                            ${escapeHTML(
                                category.name
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                category.slug
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                category.description ||
                                '-'
                            )}
                        </td>

                        <td>

                            <button
                                class="admin-button delete"
                                onclick="deleteAdminCategory('${category._id}')"
                            >
                                DELETE
                            </button>

                        </td>

                    </tr>

                `;

            }).join('');

    } catch (error) {

        console.error(
            'Category loading error:',
            error
        );

        if (categoryMessage) {

            categoryMessage.textContent =
                error.message ||
                'Unable to load categories.';

            categoryMessage.style.color =
                '#ff5577';
        }
    }
}

if (categoryForm) {

    categoryForm.addEventListener(
        'submit',
        async function (event) {

            event.preventDefault();

            const name =
                categoryName.value.trim();

            const description =
                categoryDescription.value.trim();

            if (!name) {

                categoryMessage.textContent =
                    'Category name is required.';

                categoryMessage.style.color =
                    '#ff5577';

                categoryName.focus();

                return;
            }

            try {

                categoryMessage.textContent =
                    'Creating category...';

                categoryMessage.style.color =
                    'var(--primary)';

                await createCategory(
                    name,
                    description
                );

                categoryName.value =
                    '';

                categoryDescription.value =
                    '';

                categoryMessage.textContent =
                    '✓ Category created successfully.';

                await loadCategories();

            } catch (error) {

                console.error(
                    'Create category error:',
                    error
                );

                categoryMessage.textContent =
                    error.message ||
                    'Unable to create category.';

                categoryMessage.style.color =
                    '#ff5577';
            }

        }
    );
}

async function deleteAdminCategory(id) {

    const confirmed =
        window.confirm(
            'Delete this category?'
        );

    if (!confirmed) {
        return;
    }

    try {

        await deleteCategory(id);

        if (categoryMessage) {

            categoryMessage.textContent =
                '✓ Category deleted.';

            categoryMessage.style.color =
                'var(--primary)';
        }

        await loadCategories();

    } catch (error) {

        console.error(
            'Delete category error:',
            error
        );

        if (categoryMessage) {

            categoryMessage.textContent =
                error.message ||
                'Unable to delete category.';

            categoryMessage.style.color =
                '#ff5577';
        }
    }
}

async function loadComments() {

    if (!adminComments) {
        return;
    }

    try {

        if (commentMessage) {

            commentMessage.textContent =
                'Loading comments...';

            commentMessage.style.color =
                'var(--text-muted)';
        }

        const response =
            await getAllComments();

        console.log(
            'Comments:',
            response
        );

        const comments =
            response.comments ||
            response.data ||
            response ||
            [];

        if (!Array.isArray(comments)) {

            throw new Error(
                'Invalid comments response.'
            );
        }

        if (!comments.length) {

            adminComments.innerHTML =
                '';

            if (commentMessage) {

                commentMessage.textContent =
                    'No comments to moderate.';

            }

            return;
        }

        if (commentMessage) {
            commentMessage.textContent = '';
        }

        adminComments.innerHTML =
            comments.map(function (comment) {

                const author =
                    comment.user?.name ||
                    comment.user?.email ||
                    'Unknown User';

                const blogTitle =
                    comment.post?.title ||
                    'Unknown Blog';

                const status =
                    comment.status ||
                    'pending';

                return `

                    <tr>

                        <td>
                            ${escapeHTML(author)}
                        </td>

                        <td>
                            ${escapeHTML(blogTitle)}
                        </td>

                        <td class="comment-content-cell">
                            ${escapeHTML(
                                comment.content || ''
                            )}
                        </td>

                        <td>

                            <span
                                class="comment-status status-${escapeHTML(status)}"
                            >
                                ${escapeHTML(
                                    status.toUpperCase()
                                )}
                            </span>

                        </td>

                        <td>

                            ${
                                status !== 'approved'
                                    ? `
                                        <button
                                            class="admin-button"
                                            onclick="moderateComment(
                                                '${comment._id}',
                                                'approved'
                                            )"
                                        >
                                            APPROVE
                                        </button>
                                    `
                                    : ''
                            }

                            ${
                                status !== 'rejected'
                                    ? `
                                        <button
                                            class="admin-button"
                                            onclick="moderateComment(
                                                '${comment._id}',
                                                'rejected'
                                            )"
                                        >
                                            REJECT
                                        </button>
                                    `
                                    : ''
                            }

                            <button
                                class="admin-button delete"
                                onclick="deleteAdminComment(
                                    '${comment._id}'
                                )"
                            >
                                DELETE
                            </button>

                        </td>

                    </tr>

                `;

            }).join('');

    } catch (error) {

        console.error(
            'Comment loading error:',
            error
        );

        if (commentMessage) {

            commentMessage.textContent =
                error.message ||
                'Unable to load comments.';

            commentMessage.style.color =
                '#ff5577';
        }
    }
}

async function moderateComment(
    id,
    status
) {

    try {

        if (commentMessage) {

            commentMessage.textContent =
                status === 'approved'
                    ? 'Approving comment...'
                    : 'Rejecting comment...';

            commentMessage.style.color =
                'var(--primary)';
        }

        await updateCommentStatus(
            id,
            status
        );

        if (commentMessage) {

            commentMessage.textContent =
                `✓ Comment ${status}.`;

            commentMessage.style.color =
                'var(--primary)';
        }

        await loadComments();

    } catch (error) {

        console.error(
            'Comment moderation error:',
            error
        );

        if (commentMessage) {

            commentMessage.textContent =
                error.message ||
                'Unable to update comment.';

            commentMessage.style.color =
                '#ff5577';
        }
    }
}

async function deleteAdminComment(id) {

    const confirmed =
        window.confirm(
            'Delete this comment permanently?'
        );

    if (!confirmed) {
        return;
    }

    try {

        await deleteComment(id);

        if (commentMessage) {

            commentMessage.textContent =
                '✓ Comment deleted.';

            commentMessage.style.color =
                'var(--primary)';
        }

        await loadComments();

    } catch (error) {

        console.error(
            'Delete comment error:',
            error
        );

        if (commentMessage) {

            commentMessage.textContent =
                error.message ||
                'Unable to delete comment.';

            commentMessage.style.color =
                '#ff5577';
        }
    }
}

(async function startAdminDashboard() {

    const allowed =
        await checkAdminAccess();

    if (!allowed) {
        return;
    }

    await loadAdminPosts();

    await loadCategories();

    await loadComments();

})();
