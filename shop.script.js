document.addEventListener('DOMContentLoaded', () => {

    // --- Selectors ---
    const productCards = document.querySelectorAll('.product-card');
    const searchInput = document.getElementById('search-input');
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const closeModalBtn = document.querySelector('#cart-modal .close-btn');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const buyNowButtons = document.querySelectorAll('.buy-now-btn');
    const cartCountEl = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalEl = document.getElementById('cart-total');
    const toast = document.getElementById('toast-notification');
    const wishlistIcons = document.querySelectorAll('.wishlist-icon');
    
    // --- NEW FILTER SELECTORS ---
    const categoryNavButtons = document.querySelectorAll('.category-nav-btn');
    const brandButtons = document.querySelectorAll('.brand-filters .filter-btn');
    const productTypeButtons = document.querySelectorAll('.product-type-filters .filter-btn');

    // --- Login Modal Selectors ---
    const userIconLink = document.getElementById('user-icon-link');
    const userIcon = document.getElementById('user-icon');
    const loginModal = document.getElementById('login-modal');
    const loginCloseBtn = document.querySelector('#login-modal .close-btn');
    const tabButtons = document.querySelectorAll('#login-modal .tab-btn');
    const authForms = document.querySelectorAll('#login-modal .auth-form');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // --- Buy Now Modal Selectors ---
    const buyNowModal = document.getElementById('buy-now-modal');
    const buyNowCloseBtn = document.querySelector('#buy-now-modal .close-btn');
    const confirmPurchaseBtn = document.getElementById('confirm-purchase-btn');

    // --- Product Detail Modal Selectors ---
    const productDetailModal = document.getElementById('product-detail-modal');
    const productDetailCloseBtn = document.querySelector('#product-detail-modal .close-btn');

    // --- Contact Form Selector ---
    const contactForm = document.getElementById('contact-form');

    // --- Language Selectors & State ---
    const langSelect = document.getElementById('lang-select');
    let currentLanguage = 'en'; 
    let cart = []; 
    let isLoggedIn = true; 
    let currentDetailCard = null;

    // --- Event Listeners ---

    // 1. Staggered Card Load-in Animation
    productCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 50}ms`; 
    });

    // 2. Filter and Search
    searchInput.addEventListener('input', filterProducts);

    // --- NEW: Event Listeners for new filters ---
    categoryNavButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.category-nav-btn.active').classList.remove('active');
            button.classList.add('active');
            filterProducts();
        });
    });

    brandButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.brand-filters .filter-btn.active').classList.remove('active');
            button.classList.add('active');
            filterProducts();
        });
    });

    productTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.product-type-filters .filter-btn.active').classList.remove('active');
            button.classList.add('active');
            filterProducts();
        });
    });
    // --- END NEW Listeners ---

    // 3. Cart Modal
    cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        cartModal.classList.add('show');
    });

    closeModalBtn.addEventListener('click', () => {
        cartModal.classList.remove('show');
    });

    // 4. Generic Modal Close (for window click)
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) cartModal.classList.remove('show');
        if (e.target === loginModal) loginModal.classList.remove('show');
        if (e.target === buyNowModal) buyNowModal.classList.remove('show');
        if (e.target === productDetailModal) productDetailModal.classList.remove('show');
    });

    // 5. Login/Logout Icon Click Listener
    userIconLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (isLoggedIn) {
            isLoggedIn = false;
            updateLoginStatus();
            showToast(translations[currentLanguage].toast_logout_success);
        } else {
            loginModal.classList.add('show');
        }
    });

    loginCloseBtn.addEventListener('click', () => {
        loginModal.classList.remove('show');
    });

    // 6. Login/Sign Up Tab Switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const parentModal = button.closest('.modal');
            parentModal.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            parentModal.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
            button.classList.add('active');
            const tabName = button.dataset.tab;
            parentModal.querySelector(`#${tabName}-form`).classList.add('active');
        });
    });
    
    // 7. Form Submission Listeners
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        loginModal.classList.remove('show');
        showToast(translations[currentLanguage].toast_login_success);
        isLoggedIn = true;
        updateLoginStatus();
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        loginModal.classList.remove('show');
        showToast(translations[currentLanguage].toast_signup_success);
        isLoggedIn = true;
        updateLoginStatus();
    });

    // 8. Contact Form Submit
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            showToast(translations[currentLanguage].toast_contact_success);
            contactForm.reset();
        });
    }

    // 9. Add to Cart (from Product Grid)
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.product-card');
            addItemToCart(card);
        });
    });

    // 10. Buy Now (from Product Grid)
    buyNowButtons.forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.product-card');
            showBuyNowModal(card);
        });
    });
    
    // 11. Buy Now Modal (Order Summary) Listeners
    buyNowCloseBtn.addEventListener('click', () => {
        buyNowModal.classList.remove('show');
    });

    confirmPurchaseBtn.addEventListener('click', () => {
        const productName = confirmPurchaseBtn.dataset.productName || 'Your item';
        buyNowModal.classList.remove('show');
        let message = translations[currentLanguage].toast_purchase_success || "Purchase successful for {name}!";
        showToast(message.replace('{name}', productName));
    });


    // 12. Cart Item Manipulation (Increase, Decrease, Remove)
    cartItemsContainer.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (e.target.classList.contains('quantity-btn-plus')) changeQuantity(id, 1);
        if (e.target.classList.contains('quantity-btn-minus')) changeQuantity(id, -1);
        if (e.target.classList.contains('remove-item-btn')) removeItem(id);
    });

    // 13. Wishlist
    wishlistIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation(); // Card click ko rokein
            icon.classList.toggle('far');
            icon.classList.toggle('fas');
            const toastKey = icon.classList.contains('fas') ? 'toast_added_to_wishlist' : 'toast_removed_from_wishlist';
            showToast(translations[currentLanguage][toastKey]);
        });
    });

    // 14. Language Switcher
    langSelect.addEventListener('change', (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        localStorage.setItem('userLang', newLang); // Save choice
    });

    // 15. Product Card Click
    productCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn') || 
                e.target.closest('.buy-now-btn') || 
                e.target.closest('.wishlist-icon')) {
                return;
            }
            openProductDetail(card);
        });
    });

    // 16. Detail Modal Close Button
    productDetailCloseBtn.addEventListener('click', () => {
        productDetailModal.classList.remove('show');
    });

    // 17. Detail Modal Buttons
    document.getElementById('detail-add-to-cart-btn').addEventListener('click', () => {
        if (currentDetailCard) {
            addItemToCart(currentDetailCard);
            productDetailModal.classList.remove('show');
        }
    });

    document.getElementById('detail-buy-now-btn').addEventListener('click', () => {
        if (currentDetailCard) {
            productDetailModal.classList.remove('show');
            showBuyNowModal(currentDetailCard);
        }
    });


    // --- Functions ---

    // Generate Rating Stars
    function getRatingStars(rating) {
        let starsHTML = '';
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        for(let i = 0; i < fullStars; i++) starsHTML += '<i class="fas fa-star"></i>';
        if(halfStar) starsHTML += '<i class="fas fa-star-half-alt"></i>';
        for(let i = 0; i < emptyStars; i++) starsHTML += '<i class="far fa-star"></i>';
        
        return starsHTML;
    }

    // Populate and Open Product Detail Modal
    function openProductDetail(card) {
        currentDetailCard = card; 
        const cardData = getCardData(card);

        // 1. Populate Text & Image
        document.getElementById('detail-img').src = cardData.img;
        document.getElementById('detail-brand').textContent = cardData.brand;
        document.getElementById('detail-name').textContent = cardData.name;
        
        // 2. Populate Rating
        document.getElementById('detail-rating-stars').innerHTML = getRatingStars(cardData.rating);
        let ratingText = translations[currentLanguage].rating_text || '{rating} stars ({reviews} reviews)';
        ratingText = ratingText.replace('{rating}', cardData.rating).replace('{reviews}', cardData.reviews);
        document.getElementById('detail-rating-text').textContent = ratingText;
        
        // 3. Populate Price
        document.getElementById('detail-final-price').textContent = `₹${cardData.price.toLocaleString('en-IN')}`;
        const originalPrice = cardData.price / (1 - cardData.discount / 100);
        
        const originalPriceEl = document.getElementById('detail-original-price');
        const discountTextEl = document.getElementById('detail-discount-text');
        
        if (cardData.discount > 0) {
            originalPriceEl.textContent = `₹${originalPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
            originalPriceEl.style.display = 'inline';
            
            let discountText = translations[currentLanguage].discount_text || '({discount}% OFF)';
            discountTextEl.textContent = discountText.replace('{discount}', cardData.discount);
            discountTextEl.style.display = 'inline';
        } else {
            originalPriceEl.style.display = 'none';
            discountTextEl.style.display = 'none';
        }

        // 4. Populate Sizes
        const sizeContainer = document.getElementById('detail-size-options');
        sizeContainer.innerHTML = ''; // Clear old sizes
        cardData.sizes.split(',').forEach((size, index) => {
            const sizeEl = document.createElement('button');
            sizeEl.className = 'size-option';
            sizeEl.textContent = size;
            if(index === 0) sizeEl.classList.add('active');
            sizeEl.addEventListener('click', () => {
                sizeContainer.querySelector('.active').classList.remove('active');
                sizeEl.classList.add('active');
            });
            sizeContainer.appendChild(sizeEl);
        });

        // 5. Populate (Simulated) Reviews
        const reviewsContainer = document.getElementById('detail-reviews-list');
        reviewsContainer.innerHTML = '';
        reviewsContainer.appendChild(
            createReview(translations[currentLanguage].review_1_user, 5, translations[currentLanguage].review_1_text)
        );
        if (cardData.rating > 4.2) {
             reviewsContainer.appendChild(
                createReview(translations[currentLanguage].review_2_user, 4, translations[currentLanguage].review_2_text)
            );
        }

        // 6. Show Modal
        productDetailModal.classList.add('show');
    }

    // Helper: Create review HTML
    function createReview(user, rating, text) {
        const reviewEl = document.createElement('div');
        reviewEl.className = 'review-item';
        reviewEl.innerHTML = `
            <div class="review-header">
                <span class="reviewer">${user}</span>
                <span class="review-rating">${getRatingStars(rating)}</span>
            </div>
            <p class="review-body">${text}</p>
        `;
        return reviewEl;
    }


    // Initialize Discount Badges
    function initializeDiscountBadges() {
        productCards.forEach(card => {
            const discount = parseInt(card.dataset.discount || 0, 10);
            const priceContainer = card.querySelector('.price-container');
            const originalPriceEl = priceContainer.querySelector('.original-price');
            
            if (discount > 0) {
                const discountBadge = document.createElement('div');
                discountBadge.className = 'discount-badge';
                let badgeText = translations[currentLanguage].discount_badge || '{discount}% OFF';
                discountBadge.textContent = badgeText.replace('{discount}', discount);
                card.querySelector('.product-image').prepend(discountBadge);
                originalPriceEl.style.display = 'inline';
            } else {
                originalPriceEl.style.display = 'none';
            }
        });
    }

    // --- Language Function ---
    function setLanguage(lang) {
        if (!translations[lang]) return; 
        currentLanguage = lang; 

        document.querySelectorAll('[data-key]').forEach(element => {
            let key = element.dataset.key;
            
            if (element.id === 'user-icon-link') {
                key = isLoggedIn ? 'nav_logout' : 'nav_login';
            }

            if (translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });

        document.querySelectorAll('[data-key-placeholder]').forEach(element => {
            const key = element.dataset.keyPlaceholder;
            if (translations[lang][key]) {
                element.placeholder = translations[lang][key];
            }
        });
        
        updateCart(); 
        updateLoginStatus(); 
        
        document.querySelectorAll('.discount-badge').forEach(badge => {
            const card = badge.closest('.product-card');
            const discount = card.dataset.discount;
            let badgeText = translations[currentLanguage].discount_badge || '{discount}% OFF';
            badge.textContent = badgeText.replace('{discount}', discount);
        });
    }

    // --- Update Login Status Function ---
    function updateLoginStatus() {
        if (isLoggedIn) {
            userIcon.classList.remove('fa-user');
            userIcon.classList.add('fa-user-check');
            userIconLink.dataset.key = 'nav_logout';
            userIconLink.setAttribute('aria-label', translations[currentLanguage].nav_logout || 'Logout');
        } else {
            userIcon.classList.remove('fa-user-check');
            userIcon.classList.add('fa-user');
            userIconLink.dataset.key = 'nav_login';
            userIconLink.setAttribute('aria-label', translations[currentLanguage].nav_login || 'Login');
        }
    }

    // === UPDATED (AND CORRECTED) FILTER FUNCTION ===
    function filterProducts() {
        const activeCategory = document.querySelector('.category-nav-btn.active').dataset.category;
        const activeType = document.querySelector('.product-type-filters .filter-btn.active').dataset.type;
        const activeBrand = document.querySelector('.brand-filters .filter-btn.active').dataset.brand;
        const searchTerm = searchInput.value.toLowerCase();
        
        productCards.forEach(card => {
            const category = card.dataset.category;
            const type = card.dataset.productType;
            const brand = card.dataset.brand;
            
            const nameEl = card.querySelector('h3');
            const nameKey = nameEl.dataset.key;
            let nameEN = (translations['en'][nameKey] || nameEl.textContent).toLowerCase();
            let nameHI = (translations['hi'][nameKey] || nameEl.textContent).toLowerCase();

            const categoryMatch = (activeCategory === 'all' || category === activeCategory);
            // --- THIS IS THE FIX ---
            const typeMatch = (activeType === 'all' || type === activeType);
            // --- END OF FIX ---
            const brandMatch = (activeBrand === 'all' || brand === brand);
            const searchMatch = nameEN.includes(searchTerm) || nameHI.includes(searchTerm);

            if (categoryMatch && typeMatch && brandMatch && searchMatch) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Helper: Card se data nikalne ke liye
    function getCardData(card) {
        const nameEl = card.querySelector('h3');
        const nameKey = nameEl.dataset.key;

        return {
            id: card.dataset.id,
            productKey: nameKey,
            name: (nameKey && translations[currentLanguage][nameKey]) ? translations[currentLanguage][nameKey] : nameEl.textContent,
            price: parseFloat(card.dataset.price),
            img: card.querySelector('img').src,
            brand: card.querySelector('.brand').textContent,
            discount: parseInt(card.dataset.discount || 0, 10),
            rating: parseFloat(card.dataset.rating || 0),
            reviews: parseInt(card.dataset.reviews || 0, 10),
            sizes: card.dataset.sizes || 'M',
            category: card.dataset.category, // new
            productType: card.dataset.productType // new
        };
    }

    function addItemToCart(card) {
        const cardData = getCardData(card);
        const existingItem = cart.find(item => item.id === cardData.id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...cardData, quantity: 1 });
        }
        
        updateCart();
        
        let message = translations[currentLanguage].toast_added_to_cart;
        showToast(message.replace('{name}', cardData.name));
    }


    function showBuyNowModal(card) {
        const cardData = getCardData(card);
        const originalPrice = cardData.price / (1 - cardData.discount / 100);
        const discountAmount = originalPrice - cardData.price;

        document.getElementById('buy-now-img').src = cardData.img;
        document.getElementById('buy-now-name').textContent = cardData.name;
        document.getElementById('buy-now-brand').textContent = cardData.brand;
        document.getElementById('buy-now-rating-stars').innerHTML = getRatingStars(cardData.rating);
        document.getElementById('buy-now-rating-text').textContent = ` ${cardData.rating} (${cardData.reviews} reviews)`;

        document.getElementById('buy-now-original-price-val').textContent = `₹${originalPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
        document.getElementById('buy-now-discount-val').textContent = `- ₹${discountAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
        document.getElementById('buy-now-final-price-val').textContent = `₹${cardData.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

        confirmPurchaseBtn.dataset.productName = cardData.name;
        buyNowModal.classList.add('show');
    }


    function changeQuantity(id, change) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                cart = cart.filter(item => item.id !== id);
            }
            updateCart();
        }
    }

    function removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        updateCart();
        showToast(translations[currentLanguage].toast_item_removed);
    }

    function updateCart() {
        cartItemsContainer.innerHTML = ''; 
        let total = 0;
        let count = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<p>${translations[currentLanguage].cart_empty}</p>`;
        } else {
            cart.forEach(item => {
                total += item.price * item.quantity;
                count += item.quantity;
                const name = (item.productKey && translations[currentLanguage][item.productKey]) ? translations[currentLanguage][item.productKey] : item.name;
                const removeText = translations[currentLanguage].cart_remove_btn;

                const cartItemHTML = `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.img}" alt="${name}">
                        <div class="cart-item-details">
                            <h4>${name}</h4>
                            <p class="price">₹${item.price.toLocaleString('en-IN')}</p>
                            <div class="quantity-controls">
                                <button class="quantity-btn quantity-btn-minus" data-id="${item.id}">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="quantity-btn quantity-btn-plus" data-id="${item.id}">+</button>
                            </div>
                        </div>
                        <button class="remove-item-btn" data-id="${item.id}">${removeText}</button>
                    </div>
                `;
                cartItemsContainer.innerHTML += cartItemHTML;
            });
        }

        cartTotalEl.textContent = `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        cartCountEl.textContent = count;
    }

    function showToast(message) {
        if (!message) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000); 
    }

    // --- Snowfall Function Definition ---
    function createSnowfallEffect(containerId, numberOfSnowflakes) {
        const container = document.querySelector(containerId);
        if (!container) return;

        for (let i = 0; i < numberOfSnowflakes; i++) {
            const snowflake = document.createElement('div');
            snowflake.classList.add('snowflake');
            
            const size = Math.random() * 3 + 2;
            snowflake.style.width = `${size}px`;
            snowflake.style.height = `${size}px`;
            snowflake.style.left = `${Math.random() * 100}%`;
            const duration = Math.random() * 10 + 10;
            const delay = Math.random() * -10;
            snowflake.style.animationDuration = `${duration}s`;
            snowflake.style.animationDelay = `${delay}s`;
            snowflake.style.opacity = Math.random() * 0.7 + 0.3;

            container.appendChild(snowflake);
        }
    }

    // --- INITIALIZATION ---
    function initializeApp() {
        const savedLang = localStorage.getItem('userLang') || 'en';
        
        if (langSelect) {
            langSelect.value = savedLang;
        }
        
        initializeDiscountBadges();
        setLanguage(savedLang);
    }

    // App ko start karein
    initializeApp();

    // Snowfall effect ko initialize karein
    createSnowfallEffect('.snowfall-container', 100); 
    
});