// Client-side validation for HiveMind application

document.addEventListener('DOMContentLoaded', function() {
    // Get the current page form
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const observationForm = document.getElementById('observationForm');
    const accountForm = document.getElementById('accountForm');
    
    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Password strength validation
    function isStrongPassword(password) {
        // At least 8 characters, containing uppercase, lowercase, number, and special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }
    
    // Credit card validation (Luhn algorithm)
    function isValidCreditCard(cardNumber) {
        if (!cardNumber || typeof cardNumber !== 'string') {
            return false;
        }
        
        // Remove spaces and dashes
        cardNumber = cardNumber.replace(/[\s-]/g, '');
        
        // Check if contains only digits and has valid length
        if (!/^\d{16}$/.test(cardNumber)) {
            return false;
        }
        
        // Luhn algorithm
        let sum = 0;
        let shouldDouble = false;
        
        // Loop from right to left
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber.charAt(i));
            
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        
        return (sum % 10) === 0;
    }
    
    // Date format validation (YYYYMMDD)
    function isValidDateFormat(date) {
        // Check if it's a string with exactly 8 digits
        if (!/^\d{8}$/.test(date)) {
            return false;
        }
        
        // Extract year, month, and day
        const year = parseInt(date.substring(0, 4));
        const month = parseInt(date.substring(4, 6));
        const day = parseInt(date.substring(6, 8));
        
        // Check if date is valid
        if (month < 1 || month > 12) {
            return false;
        }
        
        const daysInMonth = new Date(year, month, 0).getDate();
        if (day < 1 || day > daysInMonth) {
            return false;
        }
        
        return true;
    }
    
    // Time format validation (hh:mm:ss)
    function isValidTimeFormat(time) {
        return /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(time);
    }
    
    // Registration form validation
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            let isValid = true;
            let errorMessage = '';
            
            // Get form fields
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const cardNumber = document.getElementById('cardNumber').value;
            const cardCVV = document.getElementById('cardCVV').value;
            
            // Validate email
            if (!isValidEmail(username)) {
                isValid = false;
                errorMessage += 'Please enter a valid email address.\n';
            }
            
            // Validate password strength
            if (!isStrongPassword(password)) {
                isValid = false;
                errorMessage += 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.\n';
            }
            
            // Validate password confirmation
            if (password !== confirmPassword) {
                isValid = false;
                errorMessage += 'Passwords do not match.\n';
            }
            
            // Validate credit card
            if (!isValidCreditCard(cardNumber)) {
                isValid = false;
                errorMessage += 'Please enter a valid 16-digit credit card number.\n';
            }
            
            // Validate CVV
            if (!/^\d{3}$/.test(cardCVV)) {
                isValid = false;
                errorMessage += 'CVV must be a 3-digit number.\n';
            }
            
            // Prevent form submission if validation fails
            if (!isValid) {
                event.preventDefault();
                alert(errorMessage);
            }
        });
    }
    
    // Login form validation
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            let isValid = true;
            let errorMessage = '';
            
            // Get form fields
            const username = document.getElementById('username').value;
            
            // Validate email
            if (!isValidEmail(username)) {
                isValid = false;
                errorMessage += 'Please enter a valid email address.\n';
            }
            
            // Prevent form submission if validation fails
            if (!isValid) {
                event.preventDefault();
                alert(errorMessage);
            }
        });
    }
    
    // Observation form validation
    if (observationForm) {
        observationForm.addEventListener('submit', function(event) {
            let isValid = true;
            let errorMessage = '';
            
            // Get form fields
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            const w3w = document.getElementById('w3w').value;
            const latitude = parseFloat(document.getElementById('latitude').value);
            const longitude = parseFloat(document.getElementById('longitude').value);
            
            // Validate date format
            if (!isValidDateFormat(date)) {
                isValid = false;
                errorMessage += 'Date must be in YYYYMMDD format.\n';
            }
            
            // Validate time format
            if (!isValidTimeFormat(time)) {
                isValid = false;
                errorMessage += 'Time must be in hh:mm:ss format.\n';
            }
            
            // Validate What3words format (basic check)
            if (!/^[a-z]+\.[a-z]+\.[a-z]+$/.test(w3w)) {
                isValid = false;
                errorMessage += 'What3words must be in format word.word.word\n';
            }
            
            // Validate latitude range
            if (isNaN(latitude) || latitude < -90 || latitude > 90) {
                isValid = false;
                errorMessage += 'Latitude must be between -90 and 90 degrees.\n';
            }
            
            // Validate longitude range
            if (isNaN(longitude) || longitude < -180 || longitude > 180) {
                isValid = false;
                errorMessage += 'Longitude must be between -180 and 180 degrees.\n';
            }
            
            // Prevent form submission if validation fails
            if (!isValid) {
                event.preventDefault();
                alert(errorMessage);
            }
        });
    }
    
    // Account form validation
    if (accountForm) {
        accountForm.addEventListener('submit', function(event) {
            let isValid = true;
            let errorMessage = '';
            
            // Get form fields
            const cardNumber = document.getElementById('cardNumber');
            const cardCVV = document.getElementById('cardCVV');
            
            // Only validate card number if it's not empty (user is updating)
            if (cardNumber && cardNumber.value.trim() !== '') {
                if (!isValidCreditCard(cardNumber.value)) {
                    isValid = false;
                    errorMessage += 'Please enter a valid 16-digit credit card number.\n';
                }
            }
            
            // Only validate CVV if it's not empty (user is updating)
            if (cardCVV && cardCVV.value.trim() !== '') {
                if (!/^\d{3}$/.test(cardCVV.value)) {
                    isValid = false;
                    errorMessage += 'CVV must be a 3-digit number.\n';
                }
            }
            
            // Prevent form submission if validation fails
            if (!isValid) {
                event.preventDefault();
                alert(errorMessage);
            }
        });
    }
});
