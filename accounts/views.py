from django.shortcuts import render,redirect
from .forms import UserForm
from .models import User,UserProfile
from django.contrib import messages,auth
from vendor.forms import VendorForm
from .utils import detectUser
from django.contrib.auth.decorators import login_required,user_passes_test
from django.core.exceptions import PermissionDenied
from vendor.models import Vendor
from django.template.defaultfilters import slugify
from orders.models import Order
import datetime


# Create your views here.
# restrict the vendor from accessing the customer page
def check_role_vendor(user):
    if user.role==1:
        return True
    else:
        raise PermissionDenied


# restrict the customer from accessing the vendor page
def check_role_customer(user):
    if user.role==2:
        return True
    else:
        raise PermissionDenied



def registerUser(request):
    if request.user.is_authenticated:
        messages.warning(request,'You are already logged in!')
        return redirect('dashboard')
    elif request.method=='POST':
        form=UserForm(request.POST)
        if form.is_valid():
            # password=form.cleaned_data['password']
            # user=form.save(commit=False)
            # user.set_password(password)
            # user.role=User.CUSTOMER
            # form.save()

            first_name=form.cleaned_data['first_name']
            last_name=form.cleaned_data['last_name']
            username=form.cleaned_data['username']
            email=form.cleaned_data['email']
            password=form.cleaned_data['password']
            user=User.objects.create_user(first_name=first_name,last_name=last_name,username=username,email=email,password=password)
            user.role=User.CUSTOMER
            user.save()

            #send verification email
            # send_verification_email(request,user)
            messages.success(request,"Your account has been registered successfully!")
            return redirect(registerUser)
        else:
            print('invalid form')
            print(form.errors)
            return render(request, 'accounts/registerUser.html', {'form': form})
    else:
        form=UserForm()
    
    form=UserForm()
    context={
        'form': form,
    }
    return render(request,'accounts/registerUser.html',context)
def registerVendor(request):
    return render(request,'accounts/registerVendor.html')

def registerVendor(request):
    if request.user.is_authenticated:
        messages.warning(request,'You are already logged in!')
        return redirect('myAccount')
    elif request.method=='POST':
        form=UserForm(request.POST)
        v_form=VendorForm(request.POST,request.FILES)
        if form.is_valid() and v_form.is_valid():
            
            first_name=form.cleaned_data['first_name']
            last_name=form.cleaned_data['last_name']
            username=form.cleaned_data['username']
            email=form.cleaned_data['email']
            password=form.cleaned_data['password']
            user=User.objects.create_user(first_name=first_name,last_name=last_name,username=username,email=email,password=password)
            user.role=User.VENDOR
            user.save()
            vendor=v_form.save(commit=False)
            vendor.user=user
            vendor_name=v_form.cleaned_data['vendor_name']
            vendor.vendor_slug=slugify(vendor_name)+'-'+str(user.id)
            user_profile=UserProfile.objects.get(user=user)
            vendor.user_profile=user_profile
            vendor.save()

            
            #send verification email
            # send_verification_email(request,user)

            messages.success(request,'Your account has been registered successfully! please wait for the approval')
            return redirect(registerVendor)
        else:
            print('Invalid form')
            print(form.errors)
    else:
        form=UserForm()
        v_form=VendorForm()

    context={
        'form':form,
        'v_form':v_form,
    }
    return render(request,'accounts/registerVendor.html',context)


# def activate(request,uidb64,token):
#     #Activate the user by setting the is_active status to True
#      return

def login(request):
    if request.user.is_authenticated:
        messages.warning(request,'You are already logged in!')
        return redirect('myAccount')
    elif request.method=='POST':
        email=request.POST['email']
        password=request.POST['password']

        user=auth.authenticate(email=email,password=password)
        print(email,password)

        if user is not None:
            auth.login(request,user)
            messages.success(request,'You are now logged in.')
            return redirect('myAccount')
        else:
            messages.error(request, 'Invalid login Credentials')
            return redirect('login')
    return render(request,'accounts/login.html')


def logout(request):
    auth.logout(request)
    messages.info(request,'You are logeed out')
    return redirect(login)

@login_required(login_url='login')
def myAccount(request):
    user=request.user
    redirectUrl=detectUser(user)
    return redirect(redirectUrl)

@login_required(login_url='login')
@user_passes_test(check_role_customer)
def custDashboard(request):
    orders=Order.objects.filter(user=request.user,is_ordered=True)
    recent_orders=orders[:5]
    context={
        'orders':orders,
        'orders_count':orders.count(),
        'recent_orders':recent_orders,
    }
    return render(request,'accounts/custDashboard.html',context)



@login_required(login_url='login')
@user_passes_test(check_role_vendor)
def vendorDashboard(request):
    vendor = Vendor.objects.get(user=request.user)
    orders = Order.objects.filter(vendor__in=[vendor], is_ordered=True)
    recent_orders=orders[:10]
    #current month revenue
    current_month=datetime.datetime.now().month
    current_month_orders=orders.filter(vendor__in=[vendor.id],created_at__month=current_month)
    current_month_revenue =0
    for i in current_month_orders:
        current_month_revenue += i.get_total_by_vendor()['grand_total']
  
    #total revenue
    total_revenue=0
    for i in orders:
        total_revenue+=i.get_total_by_vendor()['grand_total']

    context = {
        'vendor': vendor,
        'orders': orders, 
        'orders_count' : orders.count(),
        'recent_orders':recent_orders,
        'total_revenue':total_revenue,
        'current_month_revenue':current_month_revenue,

    }
    return render(request, 'accounts/vendorDashboard.html', context)
