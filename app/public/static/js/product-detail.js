document.addEventListener('DOMContentLoaded', function () {
    // === Thumbnail Click ===
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('mainImage');

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            mainImage.src = thumbnail.src;
            thumbnails.forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
        });
    });

    // === Quantity Buttons ===
    const qtyInput = document.querySelector('input[name="quantity"]');
    const btnMinus = document.querySelector('.qty-minus');
    const btnPlus = document.querySelector('.qty-plus');

    if (qtyInput) {
        btnMinus?.addEventListener('click', () => {
            let currentQty = parseInt(qtyInput.value) || 1;
            if (currentQty > 1) qtyInput.value = currentQty - 1;
        });

        btnPlus?.addEventListener('click', () => {
            let currentQty = parseInt(qtyInput.value) || 1;
            qtyInput.value = currentQty + 1;
        });
    }

    // === Add to Cart Handler ===
    const addToCartBtn = document.getElementById('addToCartBtn');

    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function () {
            const productId = this.getAttribute('data-product-id');
            const quantity = parseInt(document.querySelector('input[name="quantity"]').value) || 1;

            fetch('/add-to-cart/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: quantity
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Button feedback
                    addToCartBtn.textContent = 'Product added successfully to cart';
                    addToCartBtn.classList.add('success');

                    // Update cart count with animation
                    const cartCountElem = document.querySelector('.cart-count');
                    if (cartCountElem) {
                        cartCountElem.textContent = data.cart_count;
                        cartCountElem.classList.add('cart-updated');
                        setTimeout(() => {
                            cartCountElem.classList.remove('cart-updated');
                        }, 800);
                    }

                    // Reset the button text
                    setTimeout(() => {
                        addToCartBtn.textContent = 'Add to Cart';
                        addToCartBtn.classList.remove('success');
                    }, 3000);
                } else {
                    console.error(data.message || 'Failed to add to cart.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }

    // === CSRF Token Getter ===
    function getCookie(name) {
        let cookieValue = null;
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
});
