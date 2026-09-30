const urlParams =
    new URLSearchParams(
        window.location.search
    );

const postId =
    urlParams.get('id');

const editForm =
    document.getElementById('editForm');

const titleInput =
    document.getElementById('title');

const excerptInput =
    document.getElementById('excerpt');

const categoryInput =
    document.getElementById('category');

const statusInput =
    document.getElementById('status');

const tagsInput =
    document.getElementById('tags');

const contentInput =
    document.getElementById('content');

const updateButton =
    document.getElementById('updateButton');

const cancelButton =
    document.getElementById('cancelButton');

const editMessage =
    document.getElementById('editMessage');

const token =
    localStorage.getItem('blognest-token');

if (!token) {

    window.location.href =
        'login.html';

}

if (!postId) {

    editMessage.textContent =
        'No blog ID was provided.';

    editMessage.style.color =
        '#ff5577';

    updateButton.disabled =
        true;

}

async function loadBlog() {

    try {

        editMessage.textContent =
            'Loading blog...';

        const response =
            await getPostById(postId);

        console.log(
            'Blog response:',
            response
        );

        const post =
            response.post ||
            response.data ||
            response;

        if (!post || !post._id) {

            throw new Error(
                'Blog could not be found.'
            );

        }

        titleInput.value =
            post.title || '';

        excerptInput.value =
            post.excerpt || '';

        categoryInput.value =
            post.category || '';

        statusInput.value =
            post.status || 'draft';

        tagsInput.value =
            Array.isArray(post.tags)
                ? post.tags.join(', ')
                : '';

        contentInput.value =
            post.content || '';

        editMessage.textContent =
            '';

    } catch (error) {

        console.error(
            'Load blog error:',
            error
        );

        editMessage.textContent =
            error.message ||
            'Unable to load blog.';

        editMessage.style.color =
            '#ff5577';

    }

}

editForm.addEventListener(
    'submit',
    async function (event) {

        event.preventDefault();

        const title =
            titleInput.value.trim();

        const excerpt =
            excerptInput.value.trim();

        const category =
            categoryInput.value.trim();

        const status =
            statusInput.value;

        const content =
            contentInput.value.trim();

        const tags =
            tagsInput.value
                .split(',')
                .map(function (tag) {
                    return tag.trim();
                })
                .filter(function (tag) {
                    return tag.length > 0;
                });

        if (!title) {

            editMessage.textContent =
                'Title is required.';

            editMessage.style.color =
                '#ff5577';

            titleInput.focus();

            return;

        }

        if (!content) {

            editMessage.textContent =
                'Content is required.';

            editMessage.style.color =
                '#ff5577';

            contentInput.focus();

            return;

        }

        updateButton.disabled =
            true;

        updateButton.textContent =
            'UPDATING...';

        editMessage.textContent =
            'Saving changes...';

        editMessage.style.color =
            'var(--primary)';

        try {

            const response =
                await updatePost(
                    postId,
                    {
                        title,
                        content,
                        excerpt,
                        category,
                        tags,
                        status
                    }
                );

            console.log(
                'Update response:',
                response
            );

            editMessage.textContent =
                '✓ Blog updated successfully.';

            editMessage.style.color =
                'var(--primary)';

            setTimeout(
                function () {

                    window.location.href =
                        `blog.html?id=${encodeURIComponent(
                            postId
                        )}`;

                },
                700
            );

        } catch (error) {

            console.error(
                'Update error:',
                error
            );

            editMessage.textContent =
                error.message ||
                'Failed to update blog.';

            editMessage.style.color =
                '#ff5577';

            updateButton.disabled =
                false;

            updateButton.textContent =
                'UPDATE BLOG';

        }

    }
);

cancelButton.addEventListener(
    'click',
    function () {

        window.location.href =
            `blog.html?id=${encodeURIComponent(
                postId
            )}`;

    }
);

if (postId) {

    loadBlog();

}
