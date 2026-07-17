// Get CSRF token from cookie
function getCSRFToken() {
    let cookieValue = null;
    const name = 'csrftoken';
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Fetch and update cart count from backend
function fetchCartCount() {
    fetch('/get-cart-count/')
        .then(response => response.json())
        .then(data => {
            const cartCountElements = document.querySelectorAll('.cart-count');
            cartCountElements.forEach(el => {
                el.textContent = data.count > 0 ? data.count : '';
            });
        })
        .catch(error => console.error("Cart count error:", error));
}

// Handle Add to Cart
function setupCartButtons() {
    const buttons = document.querySelectorAll('.add-to-cart, .add-to-cart-btn'); // <- fixed here
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const originalText = button.innerHTML;
            const productId = button.dataset.productId;

            fetch('/add-to-cart/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                body: JSON.stringify({ product_id: productId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    fetchCartCount();

                    button.classList.add('added');
                    button.innerHTML = `<i class="fas fa-check-circle"></i> Product added successfully!`;

                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.classList.remove('added');
                    }, 3000);
                } else {
                    alert("⚠️ Please login to add to cart.");
                }
            })
            .catch(err => {
                console.error('Error:', err);
                alert("❌ Something went wrong. Try again!");
            });
        });
    });
}

// Product search/filter
function setupProductFilters() {
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const productGrid = document.getElementById("allProducts");

    if (!productGrid) return;

    const allProducts = Array.from(productGrid.children);

    function filterProducts() {
        const searchText = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value.toLowerCase();

        allProducts.forEach(product => {
            const title = product.querySelector('.product-title')?.textContent.toLowerCase() || '';
            const category = product.getAttribute("data-category")?.toLowerCase() || "";

            const matchesSearch = title.includes(searchText);
            const matchesCategory = !selectedCategory || category === selectedCategory;

            product.style.display = (matchesSearch && matchesCategory) ? "block" : "none";
        });
    }

    if (searchInput) searchInput.addEventListener("input", filterProducts);
    if (categoryFilter) categoryFilter.addEventListener("change", filterProducts);
}

// Navigation + Scroll Features
function setupNavBehavior() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function () {
            navLinks.classList.toggle('active');
            mobileMenuBtn.innerHTML = navLinks.classList.contains('active') ?
                '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });

                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });
    });

    // Sticky navbar
    window.addEventListener('scroll', function () {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.padding = '10px 0';
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.style.padding = '15px 0';
            navbar.style.backgroundColor = 'var(--white)';
        }
    });
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function () {
    fetchCartCount();
    setupCartButtons();
    setupProductFilters();
    setupNavBehavior();
});
