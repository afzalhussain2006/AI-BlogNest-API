const searchInput =
  document.getElementById('home-search');

const searchButton =
  document.getElementById('search-button');

if (searchButton && searchInput) {

  function performSearch() {

    const query =
      searchInput.value.trim();

    if (!query) {
      return;
    }

    window.location.href =
      `blogs.html?q=${encodeURIComponent(query)}`;
  }

  searchButton.addEventListener(
    'click',
    performSearch
  );

  searchInput.addEventListener(
    'keydown',
    (event) => {

      if (event.key === 'Enter') {
        performSearch();
      }

    }
  );
}

async function loadFeaturedPosts() {

  const container =
    document.getElementById(
      'featured-posts'
    );

  if (!container) return;

  try {

    const data =
      await getPosts();

    if (!data.posts || !data.posts.length) {
      return;
    }

    container.innerHTML =
      data.posts
        .slice(0, 3)
        .map(
          (post, index) => `
            <article class="blog-card" style="cursor: pointer;" onclick="if ('${post._id || ''}') window.location.href = 'blog.html?id=${encodeURIComponent(post._id || '')}';">

              <div class="card-top">
                <span class="category">
                  ${escapeHTML(
                    post.category || 'GENERAL'
                  )}
                </span>

                <span class="card-index">
                  ${String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <div class="card-line"></div>

              <h3>
                ${escapeHTML(post.title)}
              </h3>

              <p>
                ${escapeHTML(
                  post.excerpt ||
                  post.content?.slice(0, 150) ||
                  ''
                )}
              </p>

              <div class="card-bottom">

                <span>
                  ${escapeHTML(
                    (post.tags || []).slice(0, 2).join(' · ')
                  )}
                </span>

                <span class="card-arrow">
                  ↗
                </span>

              </div>

            </article>
          `
        )
        .join('');

  } catch (error) {

    console.log(
      'Using demo posts:',
      error.message
    );
  }
}

function escapeHTML(value) {

  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

loadFeaturedPosts();
