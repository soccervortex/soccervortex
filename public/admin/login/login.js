document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const username = this.username.value;
    const password = this.password.value;

    // You can add custom validation or error handling here
    // For example, simple validation before submission
    if (username === '' || password === '') {
        displayError('Username and password are required!');
        return;
    }

    // Submit the form via AJAX if needed, or allow normal form submission
    this.submit();
});

function displayError(message) {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = message;
}
