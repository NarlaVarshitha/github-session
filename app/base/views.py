from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db.models import Q
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth.tokens import default_token_generator
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from .models import Category, Product, CartItem, Review, OrderItem, Order 
import json
from django.http import HttpResponse
from django.template.loader import render_to_string


User = get_user_model()

# ✅ Login View
def loginpage(request):
    if request.method == 'POST':
        username = request.POST.get('username', '')
        password = request.POST.get('password', '')
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect('/')
        messages.error(request, 'Invalid username or password')
        return redirect('login')
    return render(request, 'login.html')

# ✅ Signup View with Welcome Email
def signup(request):
    if request.method == 'POST':
        username = request.POST.get('username', '')
        email = request.POST.get('email', '')
        password1 = request.POST.get('password1', '')
        password2 = request.POST.get('password2', '')

        if password1 != password2:
            messages.info(request, 'Passwords do not match')
            return redirect('signup')

        if User.objects.filter(email=email).exists():
            messages.info(request, 'Email already exists')
        elif User.objects.filter(username=username).exists():
            messages.info(request, 'Username already exists')
        else:
            user = User.objects.create_user(username=username, email=email, password=password1)
            user.save()

            # ✅ Send Welcome Email
            send_mail(
                subject='Welcome to Eco-Pack!',
                message=f'Hi {username},\n\nThanks for joining Eco-Pack! We’re excited to have you 🌱',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )

            messages.success(request, 'Signup successful! Please log in.')
            return redirect('login')
    return render(request, 'signup.html')

# ✅ Logout View
def logout_view(request):
    logout(request)
    return redirect('index')

# ✅ Password Reset View
def password_reset_request(request):
    if request.method == "POST":
        password_reset_form = PasswordResetForm(request.POST)
        if password_reset_form.is_valid():
            data = password_reset_form.cleaned_data['email']
            associated_users = User.objects.filter(Q(email=data))
            if associated_users.exists():
                for user in associated_users:
                    subject = "Eco-Pack Password Reset Request"
                    email_template_name = "password_reset_email.txt"
                    context = {
                        "email": user.email,
                        "domain": request.get_host(),
                        "site_name": "Eco-Pack",
                        "uid": urlsafe_base64_encode(force_bytes(user.pk)),
                        "user": user,
                        "token": default_token_generator.make_token(user),
                        "protocol": "http",
                    }
                    email = render_to_string(email_template_name, context)
                    send_mail(subject, email, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)
                messages.success(request, 'A password reset link has been sent to your email.')
                return redirect('login')
    else:
        password_reset_form = PasswordResetForm()
    return render(request, "password_reset.html", {"form": password_reset_form})

# ✅ Index Page

def index(request):
    from django.db.models import Min
    categories = Category.objects.all()
    products = []

    for category in categories:
        product = Product.objects.filter(category=category).first()
        if product:
            products.append(product)

    context = {
        'products': products,
    }

    if request.user.is_authenticated:
        context['cart_count'] = CartItem.objects.filter(user=request.user).count()

    return render(request, 'index.html', context)



# ✅ About Page
def about(request):
    return render(request, 'about.html')

# ✅ Dashboard Page
def dashboard(request):
    return render(request, 'dashboard.html')

# ✅ User Profile Page
def userprofile(request):
    return render(request, 'user-profile.html')

# ✅ Product Detail View
def product_detail(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    reviews = Review.objects.filter(product=product)
    related_products = Product.objects.filter(category=product.category).exclude(id=product.id)[:4]
    cart_count = CartItem.objects.filter(user=request.user).count() if request.user.is_authenticated else 0
    star_range = range(1, 6)
    return render(request, 'products-detail.html', {
        'product': product,
        'reviews': reviews,
        'related_products': related_products,
        'cart_count': cart_count,
        'star_range': star_range,
    })

# ✅ Product List with Search/Category Filter
def products(request):
    categories = Category.objects.all()
    selected_category = request.GET.get('category', '')
    search_query = request.GET.get('search', '')

    if search_query:
        products = Product.objects.filter(Q(name__icontains=search_query) | Q(description__icontains=search_query))
    elif selected_category:
        products = Product.objects.filter(category__name=selected_category)
    else:
        products = Product.objects.all()

    cart_count = CartItem.objects.filter(user=request.user).count() if request.user.is_authenticated else 0

    return render(request, 'products.html', {
        'categories': categories,
        'products': products,
        'cart_count': cart_count,
        'search_query': search_query,
    })

# ✅ Add to Cart
@login_required
def add_to_cart(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            product_id = data.get("product_id")
            quantity = int(data.get("quantity", 1))
            product = get_object_or_404(Product, id=product_id)
            cart_item, created = CartItem.objects.get_or_create(user=request.user, product=product)
            cart_item.quantity = quantity if created else cart_item.quantity + quantity
            cart_item.save()
            cart_count = CartItem.objects.filter(user=request.user).count()
            return JsonResponse({
                "success": True,
                "message": f"{product.name} added to cart!",
                "cart_count": cart_count
            })
        except Exception as e:
            return JsonResponse({
                "success": False,
                "message": "Error adding to cart.",
                "error": str(e)
            }, status=500)
    return JsonResponse({"success": False, "message": "Invalid request method."}, status=405)

# ✅ View Cart
@login_required
def cart_view(request):
    cart_items = CartItem.objects.filter(user=request.user)
    subtotal = sum(item.product.price * item.quantity for item in cart_items)
    shipping_cost = 50 if cart_items else 0
    total = subtotal + shipping_cost
    return render(request, 'cart1.html', {
        'cart_items': cart_items,
        'subtotal': subtotal,
        'shipping_cost': shipping_cost,
        'total': total,
    })

# ✅ Update Cart Quantity
@login_required
def update_cart(request):
    if request.method == "POST":
        item_id = request.POST.get("item_id")
        quantity = int(request.POST.get("quantity"))
        cart_item = get_object_or_404(CartItem, id=item_id)
        cart_item.quantity = quantity
        cart_item.save()

        cart_items = CartItem.objects.filter(user=request.user)
        subtotal = sum(item.product.price * item.quantity for item in cart_items)
        shipping_cost = 50 if subtotal > 0 else 0
        total = subtotal + shipping_cost

        return JsonResponse({"subtotal": subtotal, "total": total})
    return JsonResponse({"error": "Invalid request"}, status=400)

# ✅ Remove from Cart
@login_required
def remove_cart(request):
    if request.method == "POST":
        item_id = request.POST.get("item_id")
        CartItem.objects.filter(id=item_id, user=request.user).delete()
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Invalid request"}, status=400)

# ✅ Remove Cart Item via URL
@login_required
def remove_item_from_cart(request, item_id):
    try:
        CartItem.objects.get(id=item_id, user=request.user).delete()
    except CartItem.DoesNotExist:
        pass
    return redirect('cart_view')

# ✅ Checkout View
@login_required
def checkout(request):
    cart_items = CartItem.objects.filter(user=request.user)
    if not cart_items.exists():
        messages.warning(request, "Your cart is empty. Please add products before checking out.")
        return redirect('cart_view')

    subtotal = sum(item.product.price * item.quantity for item in cart_items)
    shipping_cost = 50 if subtotal > 0 else 0
    total = subtotal + shipping_cost

    return render(request, 'checkout.html', {
        'cart_items': cart_items,
        'subtotal': subtotal,
        'shipping_cost': shipping_cost,
        'total': total,
        'cart_count': cart_items.count()
    })

# ✅ Get Cart Count
@login_required
def get_cart_count(request):
    count = CartItem.objects.filter(user=request.user).count() if request.user.is_authenticated else 0
    return JsonResponse({'count': count})


# ✅ Place Order
@csrf_exempt
@login_required
def place_order(request):
    if request.method == 'POST':
        full_name = request.POST.get('fullName')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        address = request.POST.get('address')
        city = request.POST.get('city')
        zip_code = request.POST.get('zip')
        country = request.POST.get('country')
        payment_method = request.POST.get('payment')

        cart_items = CartItem.objects.filter(user=request.user)
        if not cart_items.exists():
            return redirect('cart_view')

        subtotal = sum(item.product.price * item.quantity for item in cart_items)
        shipping_cost = 50
        total = subtotal + shipping_cost

        # ✅ Create Order object
        order = Order.objects.create(
            user=request.user,
            full_name=full_name,
             email = request.POST.get('email'),
            phone=phone,
            address=address,
            city=city,
            zip_code=zip_code,
            payment_method=payment_method,
        )

        # ✅ Create Order Items
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )

        # ✅ Clear the cart
        cart_items.delete()
        return redirect('order_success')

    return redirect('checkout')


# ✅ Order Success Page
def order_success(request):
    return render(request, 'order-success.html')

# ✅ Optional Basic Product View
def products_view(request):
    products = Product.objects.all()
    return render(request, 'products.html', {'products': products})


@login_required
def order_tracking_view(request):
    orders = Order.objects.filter(user=request.user).order_by('-date_ordered')
    return render(request, 'order_tracking.html', {'orders': orders})


from django.contrib import messages

@login_required
def cancel_order(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    if order.status == 'Pending':
        order.status = 'Cancelled'
        order.save()
        messages.success(request, 'Order cancelled successfully.')
    else:
        messages.warning(request, 'Only pending orders can be cancelled.')
    return redirect('order_tracking')





