document.addEventListener("DOMContentLoaded", function () {
    updateOrderSummary();

    const form = document.getElementById("checkoutForm");
    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            placeOrder();
        });
    }
});

function updateOrderSummary() {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    let subtotal = 0;

    cartItems.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    const shipping = subtotal > 0 ? 50.00 : 0;
    const total = subtotal + shipping;

    document.getElementById("subtotal").textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById("shipping").textContent = `₹${shipping.toFixed(2)}`;
    document.getElementById("total").textContent = `₹${total.toFixed(2)}`;
}

function placeOrder() {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

    if (cartItems.length === 0) {
        alert("Your cart is empty. Please add products before placing the order.");
        return;
    }

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value.trim();
    const zip = document.getElementById("zip").value.trim();
    const country = document.getElementById("country").value.trim();
    const paymentOption = document.querySelector('input[name="payment"]:checked');

    if (!fullName || !email || !phone || !address || !city || !zip || !country || !paymentOption) {
        alert("Please fill in all the required fields and select a payment option.");
        return;
    }

    const csrfToken = getCSRFToken();

    const orderData = {
        fullName,
        email,
        phone,
        address,
        city,
        zip,
        country,
        payment: paymentOption.value,
        cart: cartItems
    };

    fetch("/place-order/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken
        },
        body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("🎉 Order placed successfully!");
            localStorage.removeItem("cart");
            window.location.href = data.redirect_url || "/order-success/";
        } else {
            alert("🚫 Order failed: " + (data.message || "Unknown error occurred."));
        }
    })
    .catch(error => {
        console.error("Order error:", error);
        alert("❌ Something went wrong. Please try again later.");
    });
}

function getCSRFToken() {
    const name = "csrftoken";
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + "=")) {
            return decodeURIComponent(cookie.substring(name.length + 1));
        }
    }
    return "";
}
