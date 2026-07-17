document.addEventListener('DOMContentLoaded', function() {
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real app, you would validate and send to server
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Simple validation
            if (email && password) {
                // For demo purposes, we'll just show an alert
                alert('Login successful! In a real application, you would be redirected.');
                
                // In a real app, you would:
                // 1. Send credentials to server
                // 2. Receive authentication token
                // 3. Store token (e.g., in localStorage)
                // 4. Redirect to user profile or previous page
            } else {
                alert('Please fill in all fields');
            }
        });
    }
    
    // Signup form submission
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const firstName = document.getElementById('signupFirstName').value;
            const lastName = document.getElementById('signupLastName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;
            const agreeTerms = document.getElementById('agreeTerms').checked;
            
            // Simple validation
            if (!firstName || !lastName || !email || !password || !confirmPassword) {
                alert('Please fill in all required fields');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            if (password.length < 8) {
                alert('Password must be at least 8 characters');
                return;
            }
            
            if (!agreeTerms) {
                alert('You must agree to the Terms of Service and Privacy Policy');
                return;
            }
            
            // For demo purposes, we'll just show an alert
            alert('Account created successfully! In a real application, you would be redirected to login.');
            
            // In a real app, you would:
            // 1. Send registration data to server
            // 2. Handle response (success/error)
            // 3. Redirect to login page or directly log in the user
        });
    }
    
    // Social login buttons
    const socialButtons = document.querySelectorAll('.btn-social');
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            const provider = this.textContent.includes('Google') ? 'Google' : 'Facebook';
            alert(`In a real application, this would initiate ${provider} OAuth flow`);
        });
    });
});