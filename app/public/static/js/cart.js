document.addEventListener("DOMContentLoaded", function () {
    // Remove item from the cart
    document.querySelectorAll(".remove-item").forEach(button => {
        button.addEventListener("click", function () {
            let itemId = this.dataset.itemId;
            removeCartItem(itemId);
        });
    });

    // Update quantity (increase and decrease)
    document.querySelectorAll(".increase-btn, .decrease-btn").forEach(button => {
        button.addEventListener("click", function () {
            let itemId = this.dataset.itemId;
            let input = document.querySelector(`.quantity-input[data-item-id="${itemId}"]`);
            let currentQuantity = parseInt(input.value);
            let newQuantity = this.classList.contains("increase-btn") ? currentQuantity + 1 : Math.max(1, currentQuantity - 1);
            input.value = newQuantity;

            updateCartSummary();
            updateQuantityBackend(itemId, newQuantity);
        });
    });

    // Add to cart
    document.querySelectorAll(".add-to-cart-btn").forEach(button => {
        button.addEventListener("click", function () {
            let productId = this.dataset.productId;
            let quantityInput = document.querySelector(`#quantity-${productId}`);
            let quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
            addToCart(productId, quantity);
        });
    });
});

// Function to add item to cart via AJAX
function addToCart(productId, quantity) {
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
            alert(data.message);

            // Update cart count
            let countElement = document.querySelector(".cart-count");
            if (countElement && data.cart_count !== undefined) {
                countElement.textContent = data.cart_count;
            }
        } else {
            alert(data.message || "Failed to add item to cart.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

// Function to remove item from DOM & backend
function removeCartItem(itemId) {
    let itemElement = document.getElementById(`cart-item-${itemId}`);
    if (itemElement) {
        itemElement.remove();
        updateCartSummary();

        fetch(`/cart/remove/${itemId}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.cart_count !== undefined) {
                let countElement = document.querySelector(".cart-count");
                if (countElement) countElement.textContent = data.cart_count;
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

// Update quantity to backend
function updateQuantityBackend(itemId, quantity) {
    fetch(`/cart/update/${itemId}/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ quantity: quantity })
    })
    .then(response => response.json())
    .then(data => {
        if (data.cart_count !== undefined) {
            let countElement = document.querySelector(".cart-count");
            if (countElement) countElement.textContent = data.cart_count;
        }
    })
    .catch(error => console.error("Update quantity error:", error));
}

// Update cart summary
function updateCartSummary() {
    let subtotal = 0;
    let cartItems = document.querySelectorAll(".cart-item");

    cartItems.forEach(item => {
        let price = parseFloat(item.querySelector(".item-price").textContent.replace('$', ''));
        let quantity = parseInt(item.querySelector(".quantity-input").value);
        subtotal += price * quantity;
    });

    let total = subtotal;

    document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById("total").textContent = `$${total.toFixed(2)}`;

    let buyBtn = document.getElementById("buyNow");
    if (buyBtn) {
        if (cartItems.length === 0) {
            buyBtn.setAttribute("disabled", "true");
        } else {
            buyBtn.removeAttribute("disabled");
        }
    }
}

// Get CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        let cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
