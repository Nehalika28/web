document.addEventListener('DOMContentLoaded', () => {

    // --- Is page ke liye translations ---
    const loginTranslations = {
        'en': {
            'lang_prompt': 'Select Your Language',
            'login_title': 'Login',
            'signup_title': 'Sign Up',
            'label_email_mobile': 'Email or Mobile',
            'label_password': 'Password',
            'btn_login': 'Login',
            'label_email': 'Email',
            'label_create_password': 'Create Password',
            'btn_signup': 'Sign Up'
        },
        'hi': {
            'lang_prompt': 'अपनी भाषा चुनें',
            'login_title': 'लॉग इन करें',
            'signup_title': 'साइन अप करें',
            'label_email_mobile': 'ईमेल या मोबाइल',
            'label_password': 'पासवर्ड',
            'btn_login': 'लॉग इन करें',
            'label_email': 'ईमेल',
            'label_create_password': 'पासवर्ड बनाएं',
            'btn_signup': 'साइन अप करें'
        }
    };

    // --- Selectors ---
    const langButtons = document.querySelectorAll('.lang-btn');
    const languageStep = document.getElementById('language-step');
    const loginStep = document.getElementById('login-step');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // --- Function: Language select karne par ---
    function selectLanguage(lang) {
        // 1. Language ko browser memory (localStorage) mein save karein
        // Taaki 'shop.html' page isse padh sake
        localStorage.setItem('userLang', lang);

        // 2. Is page par text translate karein
        document.querySelectorAll('[data-key]').forEach(element => {
            const key = element.dataset.key;
            if (loginTranslations[lang][key]) {
                element.textContent = loginTranslations[lang][key];
            }
        });

        // 3. Step 1 (Language) ko chupayein aur Step 2 (Login) ko dikhayein
        languageStep.style.display = 'none';
        loginStep.style.display = 'block';
    }

    // --- Function: Login ya Signup karne par ---
    function proceedToShop(e) {
        // Form ko submit hone se rokein
        e.preventDefault(); 
        
        // (Yahan aap real login logic daal sakte hain)
        // Abhi ke liye, hum seedha 'shop.html' par bhej denge
        window.location.href = 'shop.html';
    }

    // --- Event Listeners ---

    // 1. Language button click
    langButtons.forEach(button => {
        button.addEventListener('click', () => {
            const lang = button.dataset.lang;
            selectLanguage(lang);
        });
    });

    // 2. Form Tab Switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Sabko inactive karein
            tabButtons.forEach(btn => btn.classList.remove('active'));
            authForms.forEach(form => form.classList.remove('active'));

            // Click wale ko active karein
            button.classList.add('active');
            const tabName = button.dataset.tab;
            document.getElementById(`${tabName}-form`).classList.add('active');
        });
    });

    // 3. Form Submit (Login ya Signup button click)
    loginForm.addEventListener('submit', proceedToShop);
    signupForm.addEventListener('submit', proceedToShop);

});