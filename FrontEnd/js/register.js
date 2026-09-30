document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('registerForm');
    const message = document.getElementById('registerMessage');

    form.addEventListener('submit', async (event) => {

        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (password.length < 6) {
            message.textContent = 'Password must contain at least 6 characters.';
            message.style.color = '#ff5577';
            return;
        }

        message.textContent = 'Creating your account...';
        message.style.color = 'var(--primary)';

        try {

            const data = await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            });

            localStorage.setItem('blognest-token', data.token);
            localStorage.setItem(
                'blognest-user',
                JSON.stringify(data.user)
            );

            message.textContent = 'Account created successfully!';

            message.style.color = 'var(--primary)';

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 700);

        } catch (error) {

            message.textContent = error.message;
            message.style.color = '#ff5577';

        }

    });

});
