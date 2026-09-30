const API_BASE_URL =
    'http://localhost:3000/api';

async function apiRequest(
    endpoint,
    options = {}
) {
    const token =
        localStorage.getItem(
            'blognest-token'
        );

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization =
            `Bearer ${token}`;
    }

    let response;

    try {
        response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,
                headers
            }
        );
    } catch (error) {
        console.error(
            'Network error:',
            error
        );

        throw new Error(
            'Unable to connect to BlogNest backend.'
        );
    }

    let data = {};

    try {
        data =
            await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            `Request failed with status ${response.status}.`
        );
    }

    return data;
}

async function getHealth() {
    return apiRequest('/health');
}

async function loginUser(
    email,
    password
) {
    return apiRequest(
        '/auth/login',
        {
            method: 'POST',
            body: JSON.stringify({
                email,
                password
            })
        }
    );
}

async function registerUser(
    name,
    email,
    password
) {
    return apiRequest(
        '/auth/register',
        {
            method: 'POST',
            body: JSON.stringify({
                name,
                email,
                password
            })
        }
    );
}

async function getCurrentUser() {
    return apiRequest(
        '/auth/me'
    );
}

async function getPosts(
    options = {}
) {
    const params =
        new URLSearchParams();

    if (options.page) {
        params.set(
            'page',
            options.page
        );
    }

    if (options.limit) {
        params.set(
            'limit',
            options.limit
        );
    }

    if (options.status) {
        params.set(
            'status',
            options.status
        );
    }

    if (options.category) {
        params.set(
            'category',
            options.category
        );
    }

    if (options.tag) {
        params.set(
            'tag',
            options.tag
        );
    }

    const query =
        params.toString();

    return apiRequest(
        `/posts${query ? `?${query}` : ''}`
    );
}

async function getMyPosts(
    options = {}
) {
    const params =
        new URLSearchParams();

    if (options.page) {
        params.set(
            'page',
            options.page
        );
    }

    if (options.limit) {
        params.set(
            'limit',
            options.limit
        );
    }

    if (options.status) {
        params.set(
            'status',
            options.status
        );
    }

    if (options.category) {
        params.set(
            'category',
            options.category
        );
    }

    if (options.tag) {
        params.set(
            'tag',
            options.tag
        );
    }

    const query =
        params.toString();

    return apiRequest(
        `/posts/my${query ? `?${query}` : ''}`
    );
}

async function getMyDrafts() {
    return apiRequest(
        '/posts/my/drafts'
    );
}

async function getPostById(id) {
    return apiRequest(
        `/posts/${encodeURIComponent(id)}`
    );
}

async function searchPosts(query) {
    return apiRequest(
        `/posts/search?q=${encodeURIComponent(query)}`
    );
}

async function semanticSearch(query) {
    return apiRequest(
        `/posts/semantic-search?q=${encodeURIComponent(query)}`
    );
}

async function createPost(
    postData
) {
    return apiRequest(
        '/posts',
        {
            method: 'POST',
            body: JSON.stringify(
                postData
            )
        }
    );
}

async function updatePost(
    id,
    postData
) {
    return apiRequest(
        `/posts/${encodeURIComponent(id)}`,
        {
            method: 'PUT',
            body: JSON.stringify(
                postData
            )
        }
    );
}

async function deletePost(id) {
    return apiRequest(
        `/posts/${encodeURIComponent(id)}`,
        {
            method: 'DELETE'
        }
    );
}

async function getCommentsByPost(
    postId
) {
    return apiRequest(
        `/comments/post/${encodeURIComponent(postId)}`
    );
}

async function createComment(
    postId,
    content
) {
    return apiRequest(
        '/comments',
        {
            method: 'POST',
            body: JSON.stringify({
                post: postId,
                content
            })
        }
    );
}

async function generateBlog(
    topic
) {
    if (
        !topic ||
        !topic.trim()
    ) {
        throw new Error(
            'Please enter a blog topic.'
        );
    }

    return apiRequest(
        '/ai/generate-blog',
        {
            method: 'POST',
            body: JSON.stringify({
                topic: topic.trim()
            })
        }
    );
}

async function summarizeBlog(
    content
) {
    if (
        !content ||
        !content.trim()
    ) {
        throw new Error(
            'Blog content is required.'
        );
    }

    return apiRequest(
        '/ai/summarize',
        {
            method: 'POST',
            body: JSON.stringify({
                content: content.trim()
            })
        }
    );
}

async function getCategories() {
    return apiRequest(
        '/categories'
    );
}

async function createCategory(
    name,
    description
) {
    return apiRequest(
        '/categories',
        {
            method: 'POST',
            body: JSON.stringify({
                name,
                description
            })
        }
    );
}

async function deleteCategory(id) {
    return apiRequest(
        `/categories/${encodeURIComponent(id)}`,
        {
            method: 'DELETE'
        }
    );
}

async function getAllComments() {
    return apiRequest(
        '/comments'
    );
}

async function updateCommentStatus(
    id,
    status
) {
    return apiRequest(
        `/comments/${encodeURIComponent(id)}/status`,
        {
            method: 'PUT',
            body: JSON.stringify({
                status
            })
        }
    );
}

async function deleteComment(id) {
    return apiRequest(
        `/comments/${encodeURIComponent(id)}`,
        {
            method: 'DELETE'
        }
    );
}
async function chatWithAI(question) {

    if (!question || !question.trim()) {

        throw new Error(
            'Please enter a question.'
        );

    }

    return apiRequest(
        '/ai/chat',
        {

            method: 'POST',

            body: JSON.stringify({
                question: question.trim()
            })

        }
    );

}


async function getChatHistory() {

    return apiRequest(
        '/ai/chat/history'
    );

}