const generateTopic =
    document.getElementById('generateTopic');

const generateButton =
    document.getElementById('generateButton');

const generateMessage =
    document.getElementById('generateMessage');

const generateResult =
    document.getElementById('generateResult');

const summaryInput =
    document.getElementById('summaryContent') ||
    document.getElementById('summaryInput');

const summarizeButton =
    document.getElementById('summarizeButton');

const summaryMessage =
    document.getElementById('summaryMessage');

const summaryResult =
    document.getElementById('summaryResult');

const semanticInput =
    document.getElementById('semanticInput');

const semanticButton =
    document.getElementById('semanticButton');

const semanticMessage =
    document.getElementById('semanticMessage');

const semanticResults =
    document.getElementById('semanticResults');

function extractAIContent(data) {

    if (typeof data === 'string') {
        return data;
    }

    return (
        data?.content ||
        data?.text ||
        data?.blog ||
        data?.result ||
        data?.summary ||
        data?.data?.content ||
        data?.data?.text ||
        data?.data?.summary ||
        ''
    );
}

if (generateButton) {

generateButton.addEventListener(
    'click',
    async function () {

        const topic =
            generateTopic.value.trim();

        if (!topic) {

            generateMessage.textContent =
                'Please enter a blog topic.';

            generateMessage.style.color =
                '#ff5577';

            generateTopic.focus();

            return;
        }

        generateButton.disabled = true;

        generateButton.textContent =
            'GENERATING...';

        generateMessage.textContent =
            'Gemini is working...';

        generateMessage.style.color =
            'var(--primary)';

        try {

            const response =
                await generateBlog(topic);

            console.log(
                'Generate response:',
                response
            );

            const content =
                extractAIContent(response);

            if (!content) {

                throw new Error(
                    'No generated content was returned.'
                );

            }

            generateResult.textContent =
                content;

            generateMessage.textContent =
                '✓ Generation complete.';

        } catch (error) {

            console.error(
                'Generate error:',
                error
            );

            generateMessage.textContent =
                error.message;

            generateMessage.style.color =
                '#ff5577';

        } finally {

            generateButton.disabled =
                false;

            generateButton.textContent =
                'GENERATE';

        }

    }
);

}

if (summarizeButton) {

summarizeButton.addEventListener(
    'click',
    async function () {

        const inputEl =
            document.getElementById('summaryContent') ||
            document.getElementById('summaryInput');

        const content =
            inputEl ? inputEl.value.trim() : '';

        if (!content) {

            if (summaryMessage) {
                summaryMessage.textContent =
                    'Please paste blog content first.';

                summaryMessage.style.color =
                    '#ff5577';
            }

            if (inputEl) inputEl.focus();

            return;
        }

        summarizeButton.disabled = true;

        const originalText =
            summarizeButton.textContent;

        summarizeButton.textContent =
            'SUMMARIZING...';

        if (summaryMessage) {
            summaryMessage.textContent =
                'Gemini is analyzing the content...';

            summaryMessage.style.color =
                'var(--primary)';
        }

        try {

            const response =
                await summarizeBlog(content);

            console.log(
                'Summary response:',
                response
            );

            const summary =
                extractAIContent(response);

            if (!summary) {

                throw new Error(
                    'No summary was returned.'
                );

            }

            if (summaryResult) {
                summaryResult.textContent =
                    summary;
            }

            if (summaryMessage) {
                summaryMessage.textContent =
                    '✓ Summary generated.';

                summaryMessage.style.color =
                    '#00f5ff';
            }

        } catch (error) {

            console.error(
                'Summary error:',
                error
            );

            if (summaryMessage) {
                summaryMessage.textContent =
                    error.message || 'Failed to summarize blog content.';

                summaryMessage.style.color =
                    '#ff5577';
            }

        } finally {

            summarizeButton.disabled =
                false;

            summarizeButton.textContent =
                originalText || 'SUMMARIZE →';

        }

    }
);

}

if (semanticButton) {

semanticButton.addEventListener(
    'click',
    async function () {

        const query =
            semanticInput.value.trim();

        if (!query) {

            semanticMessage.textContent =
                'Please enter a search query.';

            semanticMessage.style.color =
                '#ff5577';

            semanticInput.focus();

            return;
        }

        semanticButton.disabled = true;

        semanticButton.textContent =
            'SEARCHING...';

        semanticMessage.textContent =
            'Searching the vector knowledge network...';

        semanticMessage.style.color =
            'var(--primary)';

        semanticResults.innerHTML = '';

        try {

            const response =
                await semanticSearch(query);

            console.log(
                'Semantic response:',
                response
            );

            const results =
                response.results ||
                response.posts ||
                [];

            if (!results.length) {

                semanticResults.innerHTML = `
                    <div class="semantic-result">
                        <h3>NO MATCHES FOUND</h3>
                        <p>
                            No semantically related published
                            blogs were found.
                        </p>
                    </div>
                `;

                semanticMessage.textContent =
                    'Search completed.';

                return;
            }

            semanticResults.innerHTML =
                results.map(function (post) {

                    const excerpt =
                        post.excerpt ||
                        post.content ||
                        '';

                    const score =
                        post.score !== undefined
                            ? Number(post.score).toFixed(3)
                            : '—';

                    return `
                        <article
                            class="semantic-result"
                        >

                            <h3>
                                ${escapeHTML(
                                    post.title
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    excerpt.substring(
                                        0,
                                        250
                                    )
                                )}
                            </p>

                            <div class="semantic-meta">

                                ${escapeHTML(
                                    post.category ||
                                    'General'
                                )}

                                &nbsp; • &nbsp;

                                Similarity:
                                ${score}

                            </div>

                            <br>

                            <a
                                href="blog.html?id=${encodeURIComponent(
                                    post._id
                                )}"
                                style="
                                    color: var(--primary);
                                    text-decoration: none;
                                    font-size: 12px;
                                "
                            >
                                READ ARTICLE →
                            </a>

                        </article>
                    `;

                }).join('');

            semanticMessage.textContent =
                `${results.length} semantic result${
                    results.length === 1
                        ? ''
                        : 's'
                } found.`;

        } catch (error) {

            console.error(
                'Semantic search error:',
                error
            );

            semanticMessage.textContent =
                error.message;

            semanticMessage.style.color =
                '#ff5577';

        } finally {

            semanticButton.disabled =
                false;

            semanticButton.textContent =
                'SEARCH WITH AI';

        }

    }
);

}

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
