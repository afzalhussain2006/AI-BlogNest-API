const articleContainer =
    document.getElementById('articleContainer');

const commentArea =
    document.getElementById('commentArea');

const commentsList =
    document.getElementById('commentsList');

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return '';
    }

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatDate(date) {

    if (!date) {
        return '';
    }

    return new Date(date).toLocaleDateString(
        'en-IN',
        {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }
    );
}

function getBlogId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get('id');
}

function renderArticle(post) {

    const author =
        post.author?.name || 'Anonymous';

    const category =
        post.category || 'General';

    const tags =
        Array.isArray(post.tags)
            ? post.tags
            : [];

    const tagsHTML = tags.length
        ? `
            <div class="article-tags">

                ${tags.map(tag => `
                    <span class="article-tag">
                        #${escapeHTML(tag)}
                    </span>
                `).join('')}

            </div>
        `
        : '';

    articleContainer.innerHTML = `

        <div class="article-category">

            ${escapeHTML(category)}

        </div>

        <h1 class="article-title">

            ${escapeHTML(post.title)}

        </h1>

        ${
            post.excerpt
                ? `
                    <p class="article-excerpt">
                        ${escapeHTML(post.excerpt)}
                    </p>
                  `
                : ''
        }

        <div class="article-meta">

            <span>
                AUTHOR:
                <strong>
                    ${escapeHTML(author)}
                </strong>
            </span>

            <span>
                PUBLISHED:
                <strong>
                    ${formatDate(post.createdAt)}
                </strong>
            </span>

            <span>
                STATUS:
                <strong>
                    ${escapeHTML(post.status)}
                </strong>
            </span>

        </div>

        <div class="article-content">

            ${escapeHTML(post.content)}

        </div>

        ${tagsHTML}

        <a
            href="blogs.html"
            class="back-link"
        >
            ← BACK TO EXPLORE

        </a>

    `;
}

async function loadArticle() {

    const postId = getBlogId();

    if (!postId) {

        articleContainer.innerHTML = `

            <div class="article-error">

                <h1>
                    ARTICLE NOT FOUND
                </h1>

                <p>
                    No blog ID was provided.
                </p>

                <a
                    href="blogs.html"
                    class="back-link"
                >
                    ← BACK TO EXPLORE
                </a>

            </div>

        `;

        commentArea.innerHTML = '';

        return;
    }

    try {

        console.log(
            'Loading blog:',
            postId
        );

        const response = await getPostById(postId);

console.log(
    'Blog response:',
    response
);

const post = response.post || response;

renderArticle(post);

await loadComments(postId);

    } catch (error) {

        console.error(
            'Failed to load blog:',
            error
        );

        articleContainer.innerHTML = `

            <div class="article-error">

                <h1>
                    UNABLE TO LOAD ARTICLE
                </h1>

                <p>
                    ${escapeHTML(error.message)}
                </p>

                <a
                    href="blogs.html"
                    class="back-link"
                >
                    ← BACK TO EXPLORE
                </a>

            </div>

        `;

        commentArea.innerHTML = '';

    }

}

async function loadComments(postId) {

    try {

        const data =
            await getCommentsByPost(postId);

        const comments =
            data.comments ||
            data ||
            [];

        renderCommentForm(postId);

        if (
            !Array.isArray(comments) ||
            comments.length === 0
        ) {

            commentsList.innerHTML = `

                <div class="no-comments">

                    No comments yet.
                    Be the first to join the discussion.

                </div>

            `;

            return;
        }

        commentsList.innerHTML =
            comments
                .map(renderComment)
                .join('');

    } catch (error) {

        console.error(
            'Failed to load comments:',
            error
        );

        commentArea.innerHTML = `

            <div class="no-comments">

                Unable to load comments.

            </div>

        `;

    }

}

function renderComment(comment) {

    const author =
        comment.user?.name ||
        comment.author?.name ||
        'Anonymous';

    return `

        <div class="comment-card">

            <div class="comment-header">

                <span class="comment-author">

                    ${escapeHTML(author)}

                </span>

                <span class="comment-date">

                    ${formatDate(
                        comment.createdAt
                    )}

                </span>

            </div>

            <div class="comment-content">

                ${escapeHTML(
                    comment.content
                )}

            </div>

        </div>

    `;

}

function renderCommentForm(postId) {

    const token =
        localStorage.getItem(
            'blognest-token'
        );

    if (!token) {

        commentArea.innerHTML = `

            <div class="login-comment-message">

                <a href="login.html">
                    Login
                </a>

                to leave a comment.

            </div>

        `;

        return;
    }

    commentArea.innerHTML = `

        <form
            id="commentForm"
            class="comment-form"
        >

            <textarea
                id="commentInput"
                maxlength="1000"
                placeholder="Share your thoughts..."
                required
            ></textarea>

            <button
                type="submit"
                class="comment-submit"
            >
                POST COMMENT
            </button>

            <div
                id="commentMessage"
                class="comment-message"
            ></div>

        </form>

    `;

    const form =
        document.getElementById(
            'commentForm'
        );

    form.addEventListener(
        'submit',
        async event => {

            event.preventDefault();

            const input =
                document.getElementById(
                    'commentInput'
                );

            const message =
                document.getElementById(
                    'commentMessage'
                );

            const content =
                input.value.trim();

            if (!content) {

                message.textContent =
                    'Comment cannot be empty.';

                return;
            }

            try {

                message.textContent =
                    'Posting comment...';

                await createComment(
                    postId,
                    content
                );

                message.textContent =
                    'Comment submitted successfully.';

                input.value = '';

                await loadComments(postId);

            } catch (error) {

                console.error(
                    'Comment error:',
                    error
                );

                message.textContent =
                    error.message;

            }

        }
    );

}

loadArticle();
