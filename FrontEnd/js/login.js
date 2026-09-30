document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('loginForm');
    const message = document.getElementById('loginMessage');

    form.addEventListener('submit', async (event) => {

        event.preventDefault();

        message.textContent = 'Authenticating...';
        message.style.color = 'var(--primary)';

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {

            const data = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    password
                })
            });

            localStorage.setItem('blognest-token', data.token);
            localStorage.setItem(
                'blognest-user',
                JSON.stringify(data.user)
            );

            message.textContent = 'Login successful. Entering BlogNest...';

            message.style.color = 'var(--primary)';

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);

        } catch (error) {

            message.textContent = error.message;
            message.style.color = '#ff5577';

        }

    });

});
