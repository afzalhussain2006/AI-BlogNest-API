const chatForm =
    document.getElementById('chatForm');

const chatInput =
    document.getElementById('chatInput');

const chatSend =
    document.getElementById('chatSend');

const chatMessages =
    document.getElementById('chatMessages');

const faqButtons =
    document.querySelectorAll('.faq-button');


/* =========================================================
   INITIAL CHAT AREA SETUP
   ========================================================= */

if (chatMessages) {

    chatMessages.style.setProperty(
        'height',
        'auto',
        'important'
    );

    chatMessages.style.setProperty(
        'min-height',
        '0',
        'important'
    );

    chatMessages.style.setProperty(
        'max-height',
        '300px',
        'important'
    );

    chatMessages.style.setProperty(
        'overflow-y',
        'auto',
        'important'
    );

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

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


/* =========================================================
   FORCE COMPACT MESSAGE SIZE
   ========================================================= */

function makeMessageCompact(
    wrapper,
    bubble
) {

    /* Message wrapper */

    wrapper.style.setProperty(
        'display',
        'block',
        'important'
    );

    wrapper.style.setProperty(
        'width',
        '100%',
        'important'
    );

    wrapper.style.setProperty(
        'height',
        'auto',
        'important'
    );

    wrapper.style.setProperty(
        'min-height',
        '0',
        'important'
    );

    wrapper.style.setProperty(
        'max-height',
        'none',
        'important'
    );

    wrapper.style.setProperty(
        'padding',
        '0',
        'important'
    );


    /* Chat bubble */

    bubble.style.setProperty(
        'display',
        'inline-block',
        'important'
    );

    bubble.style.setProperty(
        'width',
        'auto',
        'important'
    );

    bubble.style.setProperty(
        'height',
        'auto',
        'important'
    );

    bubble.style.setProperty(
        'min-height',
        '0',
        'important'
    );

    bubble.style.setProperty(
        'max-height',
        'none',
        'important'
    );

}


/* =========================================================
   ADD MESSAGE
   ========================================================= */

function addMessage(
    type,
    text,
    sources = []
) {

    const wrapper =
        document.createElement('div');

    wrapper.className =
        `chat-message ${type}`;


    const bubble =
        document.createElement('div');

    bubble.className =
        'chat-bubble';


    const label =
        type === 'user'
            ? 'YOU'
            : 'BLOGNEST AI';


    let sourcesHTML = '';


    if (
        type === 'ai' &&
        Array.isArray(sources) &&
        sources.length
    ) {

        sourcesHTML = `

            <div class="sources">

                <strong>
                    SOURCES:
                </strong>

                ${sources.map(source => `

                    <span class="source-item">
                        ${escapeHTML(source.title)}
                    </span>

                `).join('')}

            </div>

        `;

    }


    bubble.innerHTML = `

        <div class="chat-label">
            ${label}
        </div>

        <div class="chat-text">
            ${escapeHTML(text)}
        </div>

        ${sourcesHTML}

    `;


    /* Force compact sizing */

    makeMessageCompact(
        wrapper,
        bubble
    );


    /* Add bubble */

    wrapper.appendChild(bubble);

    chatMessages.appendChild(wrapper);


    /* Keep latest message visible */

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


/* =========================================================
   LOADING MESSAGE
   ========================================================= */

function addLoadingMessage() {

    const wrapper =
        document.createElement('div');

    wrapper.className =
        'chat-message ai';

    wrapper.id =
        'chatLoading';


    const bubble =
        document.createElement('div');

    bubble.className =
        'chat-bubble';


    bubble.innerHTML = `

        <div class="chat-label">
            BLOGNEST AI
        </div>

        Searching BlogNest
        knowledge base...

    `;


    /* Force compact sizing */

    makeMessageCompact(
        wrapper,
        bubble
    );


    wrapper.appendChild(
        bubble
    );


    chatMessages.appendChild(
        wrapper
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


/* =========================================================
   REMOVE LOADING MESSAGE
   ========================================================= */

function removeLoadingMessage() {

    const loading =
        document.getElementById(
            'chatLoading'
        );

    if (loading) {

        loading.remove();

    }

}


/* =========================================================
   SEND QUESTION
   ========================================================= */

async function sendQuestion(question) {

    const cleanQuestion =
        question.trim();


    if (!cleanQuestion) {
        return;
    }


    /* User message */

    addMessage(
        'user',
        cleanQuestion
    );


    chatInput.value = '';


    chatSend.disabled =
        true;


    chatSend.textContent =
        'SEARCHING...';


    /* Loading message */

    addLoadingMessage();


    try {

        const response =
            await chatWithAI(
                cleanQuestion
            );


        removeLoadingMessage();


        /* AI response */

        addMessage(
            'ai',
            response.answer ||
                'I could not generate an answer.',
            response.sources || []
        );


    } catch (error) {

        removeLoadingMessage();


        addMessage(
            'ai',
            error.message ||
                'Something went wrong while contacting BlogNest AI.'
        );

    } finally {

        chatSend.disabled =
            false;


        chatSend.textContent =
            'SEND →';


        chatInput.focus();

    }

}


/* =========================================================
   CHAT FORM
   ========================================================= */

chatForm.addEventListener(
    'submit',
    async function (event) {

        event.preventDefault();


        await sendQuestion(
            chatInput.value
        );

    }
);


/* =========================================================
   FAQ BUTTONS
   ========================================================= */

faqButtons.forEach(
    function (button) {

        button.addEventListener(
            'click',
            async function () {

                const question =
                    button.dataset.question;


                chatInput.value =
                    question;


                await sendQuestion(
                    question
                );

            }
        );

    }
);
