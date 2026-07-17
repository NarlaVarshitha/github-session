from django.contrib import admin
from .models import Order, OrderItem, Category

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'full_name', 'user_email', 'phone', 'status', 'date_ordered']
    list_editable = ['status']
    search_fields = ['full_name', 'user__email', 'id']
    list_filter = ['payment_method', 'status', 'date_ordered']
    inlines = [OrderItemInline]
    readonly_fields = ('date_ordered',)

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']

from django.contrib import admin
from .models import Product, Category  # Make sure these models are imported

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'short_description']
    search_fields = ['name', 'category__name']
    list_filter = ['category']
    list_editable = ['price']
    readonly_fields = ['image_tag']
    fields = ('name', 'category', 'description', 'price', 'image', 'image_tag')

    # Show only first 50 characters of description
    def short_description(self, obj):
        return obj.description[:50] + ('...' if len(obj.description) > 50 else '')
    short_description.short_description = 'Description'

    def image_tag(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" width="100" height="100" />'
        return "No Image"
    image_tag.allow_tags = True
    image_tag.short_description = 'Preview'

    from .models import OrderItem  # already imported probably

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'product', 'quantity', 'price']
    search_fields = ['order__id', 'product__name']
    list_filter = ['product']

