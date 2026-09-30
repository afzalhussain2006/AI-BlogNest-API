const createForm =
    document.getElementById(
        'createForm'
    );

const generateButton =
    document.getElementById(
        'generateButton'
    );

const aiPrompt =
    document.getElementById(
        'aiPrompt'
    );

const aiMessage =
    document.getElementById(
        'aiMessage'
    );

const formMessage =
    document.getElementById(
        'formMessage'
    );

const titleInput =
    document.getElementById(
        'title'
    );

const excerptInput =
    document.getElementById(
        'excerpt'
    );

const categoryInput =
    document.getElementById(
        'category'
    );

const statusInput =
    document.getElementById(
        'status'
    );

const tagsInput =
    document.getElementById(
        'tags'
    );

const contentInput =
    document.getElementById(
        'content'
    );

const token =
    localStorage.getItem(
        'blognest-token'
    );

if (!token) {
    window.location.href =
        'login.html';
}

function showAIMessage(
    message,
    color = 'var(--text-muted)'
) {
    if (!aiMessage) {
        return;
    }

    aiMessage.textContent =
        message;

    aiMessage.style.color =
        color;
}

function showFormMessage(
    message,
    color = 'var(--text-muted)'
) {
    if (!formMessage) {
        return;
    }

    formMessage.textContent =
        message;

    formMessage.style.color =
        color;
}

function extractGeneratedContent(
    data
) {
    if (
        typeof data ===
        'string'
    ) {
        return data;
    }

    if (data?.content) {
        return data.content;
    }

    if (data?.text) {
        return data.text;
    }

    if (data?.blog) {
        return data.blog;
    }

    if (data?.result) {
        return data.result;
    }

    if (
        data?.generatedContent
    ) {
        return data.generatedContent;
    }

    if (
        data?.generatedText
    ) {
        return data.generatedText;
    }

    if (data?.data) {
        if (
            typeof data.data ===
            'string'
        ) {
            return data.data;
        }

        if (data.data.content) {
            return data.data.content;
        }

        if (data.data.text) {
            return data.data.text;
        }
    }

    return '';
}

function extractGeneratedTitle(
    data
) {
    if (
        !data ||
        typeof data === 'string'
    ) {
        return '';
    }

    return (
        data.title ||
        data.blogTitle ||
        data.data?.title ||
        ''
    );
}

function extractGeneratedExcerpt(
    data
) {
    if (
        !data ||
        typeof data === 'string'
    ) {
        return '';
    }

    return (
        data.excerpt ||
        data.summary ||
        data.data?.excerpt ||
        ''
    );
}

if (generateButton) {
    generateButton.addEventListener(
        'click',
        async function () {
            const topic =
                aiPrompt.value.trim();

            if (!topic) {
                showAIMessage(
                    'Please enter a blog topic.',
                    '#ff5577'
                );

                aiPrompt.focus();

                return;
            }

            generateButton.disabled =
                true;

            generateButton.textContent =
                'GENERATING...';

            showAIMessage(
                'Gemini is generating your blog...',
                'var(--primary)'
            );

            try {
                const response =
                    await generateBlog(
                        topic
                    );

                const generatedContent =
                    extractGeneratedContent(
                        response
                    );

                if (!generatedContent) {
                    throw new Error(
                        'Gemini returned no blog content.'
                    );
                }

                contentInput.value =
                    generatedContent;

                const generatedTitle =
                    extractGeneratedTitle(
                        response
                    );

                if (
                    generatedTitle &&
                    !titleInput.value.trim()
                ) {
                    titleInput.value =
                        generatedTitle;
                }

                const generatedExcerpt =
                    extractGeneratedExcerpt(
                        response
                    );

                if (
                    generatedExcerpt &&
                    !excerptInput.value.trim()
                ) {
                    excerptInput.value =
                        generatedExcerpt;
                }

                showAIMessage(
                    '✓ AI content generated successfully. Review it before publishing.',
                    'var(--primary)'
                );

                contentInput.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            } catch (error) {
                console.error(
                    'AI generation error:',
                    error
                );

                showAIMessage(
                    error.message ||
                    'Failed to generate blog.',
                    '#ff5577'
                );
            } finally {
                generateButton.disabled =
                    false;

                generateButton.textContent =
                    '✦ GENERATE WITH AI';
            }
        }
    );
}

if (createForm) {
    createForm.addEventListener(
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
                    .map(
                        function (tag) {
                            return tag.trim();
                        }
                    )
                    .filter(
                        function (tag) {
                            return tag.length > 0;
                        }
                    );

            if (!title) {
                showFormMessage(
                    'Title is required.',
                    '#ff5577'
                );

                titleInput.focus();

                return;
            }

            if (!content) {
                showFormMessage(
                    'Blog content is required.',
                    '#ff5577'
                );

                contentInput.focus();

                return;
            }

            const submitButton =
                createForm.querySelector(
                    'button[type="submit"]'
                );

            submitButton.disabled =
                true;

            submitButton.textContent =
                status === 'draft'
                    ? 'SAVING DRAFT...'
                    : 'PUBLISHING...';

            showFormMessage(
                status === 'draft'
                    ? 'Saving your draft...'
                    : 'Publishing your blog...',
                'var(--primary)'
            );

            try {
                const response =
                    await createPost({
                        title,
                        content,
                        excerpt,
                        category,
                        tags,
                        status
                    });

                const createdPost =
                    response.post ||
                    response.data ||
                    response;

                showFormMessage(
                    status === 'draft'
                        ? '✓ Draft saved successfully!'
                        : '✓ Blog published successfully!',
                    'var(--primary)'
                );

                if (
                    createdPost &&
                    createdPost._id
                ) {
                    setTimeout(
                        function () {
                            if (
                                status ===
                                'draft'
                            ) {
                                window.location.href =
                                    'profile.html';
                            } else {
                                window.location.href =
                                    `blog.html?id=${encodeURIComponent(
                                        createdPost._id
                                    )}`;
                            }
                        },
                        700
                    );
                } else {
                    setTimeout(
                        function () {
                            window.location.href =
                                status ===
                                'draft'
                                    ? 'profile.html'
                                    : 'blogs.html';
                        },
                        700
                    );
                }
            } catch (error) {
                console.error(
                    'Create blog error:',
                    error
                );

                showFormMessage(
                    error.message ||
                    'Failed to create blog.',
                    '#ff5577'
                );

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    'PUBLISH BLOG';
            }
        }
    );
}