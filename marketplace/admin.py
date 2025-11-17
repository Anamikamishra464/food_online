from django.contrib import admin
from .models import Cart

# Register your models here.
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'fooditem', 'quantity', 'created_at', 'updated_at')
    search_fields = ('user__username', 'fooditem__food_title')
    list_filter = ('created_at', 'updated_at')

admin.site.register(Cart, CartAdmin)