from django.db import models
from vendor.models import Vendor

import uuid
from django.utils.text import slugify

class Category(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)
    category_name = models.CharField(max_length=50)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(max_length=250, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name='category'
        verbose_name_plural='categories'
    def clean(self):
        return self.category_name.capitalize()

    def save(self, *args, **kwargs):
        if not self.slug:
            unique_id = str(uuid.uuid4())[:8]  # first 8 chars of UUID
            self.slug = f"{slugify(self.category_name)}-{unique_id}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.category_name


# class Category(models.Model):
#     vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)
#     category_name = models.CharField(max_length=50)
#     slug = models.SlugField(max_length=100, unique=True)
#     description = models.TextField(max_length=250, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         verbose_name='category'
#         verbose_name_plural='categories'
#     def clean(self):
#         return self.category_name.capitalize()

#     def __str__(self):
#         return self.category_name


# class FoodItem(models.Model):
#     vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)
#     category = models.ForeignKey(Category, on_delete=models.CASCADE,related_name='fooditems')
#     food_title = models.CharField(max_length=50)
#     slug = models.SlugField(max_length=100, unique=True)
#     description = models.TextField(max_length=250, blank=True)
#     price = models.DecimalField(max_digits=10, decimal_places=2)
#     image = models.ImageField(upload_to='foodimages')
#     is_available = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)


#     def __str__(self):
#         return self.food_title

import uuid
from django.utils.text import slugify

class FoodItem(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='fooditems')
    food_title = models.CharField(max_length=50)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(max_length=250, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='foodimages')
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            # Use UUID to guarantee uniqueness before first save
            unique_id = str(uuid.uuid4())[:8]  # first 8 chars
            self.slug = f"{slugify(self.food_title)}-{unique_id}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.food_title
