$(document).ready(function(){
    // Add to cart
    $('.add_to_cart').on("click",function(e){ 
    
        
        e.preventDefault(); // Prevent default anchor behavior
       
        food_id = $(this).attr('data-id');
        url = $(this).attr('data-url');

        $.ajax({
            type: 'GET',
            url: url,
            headers: { "X-Requested-With": "XMLHttpRequest" },
            success: function(response){
                console.log(response)
                if (response.status == 'login_required'){
                    Swal.fire(response.message,'','info').then(function(){
                        window.location = '/login';
                })
                }if (response.status == 'failed'){
                    Swal.fire(response.message,'','error')
                }else{
                $('#cart_counter').html(response.cart_counter['cart_count']);
                $('#qty-'+food_id).html(response.qty);

                // subtotal  tax and grand total
                applyCartAmounts(
                    response.cart_amount['subtotal'],
                    response.cart_amount['tax'],
                    response.cart_amount['grand_total']);
                }
            }
        })       
    })

    // Place the cart items quantity on load
    $('.item_qty').each(function(){
        var the_id = $(this).attr('id')
        var qty = $(this).attr('data-qty')
        console.log(qty)
        $('#'+the_id).html(qty)
    })

    // Decrease cart
    $('.decrease_cart').on("click",function(e){


        e.preventDefault(); // Prevent default anchor behavior
       
        food_id = $(this).attr('data-id');
        url = $(this).attr('data-url'); 
        cart_id = $(this).attr('id');

        $.ajax({
            type: 'GET',
            url: url,
            success: function(response){
                    console.log(response)
                if (response.status == 'login_required'){
                    Swal.fire(response.message,'','info').then(function(){
                        window.location = '/login';
                })
                }else  if (response.status == 'Failed') {
                    Swal.fire(response.message,'','error')
                }
                else{
                    $('#cart_counter').html(response.cart_counter['cart_count']);
                    $('#qty-'+food_id).html(response.qty);

                    applyCartAmounts(
                    response.cart_amount['subtotal'],
                    response.cart_amount['tax'],
                    response.cart_amount['grand_total']);

                    if(window.location.pathname == '/cart/'){
                        removeCartItem(response.qty,cart_id);
                        checkEmptyCart();
                    }
            }
        }
        })

    })


    // Delete cart item
    $('.delete_cart').on("click",function(e){


        e.preventDefault(); // Prevent default anchor behavior
       
        cart_id = $(this).attr('data-id');
        url = $(this).attr('data-url'); 
        $.ajax({
            type: 'GET',
            url: url,
            success: function(response){
                    console.log(response)
               if (response.status == 'Failed') {
                    Swal.fire(response.message,'','error')
                }
                else{
                    $('#cart_counter').html(response.cart_counter['cart_count']);
                    Swal.fire(response.message,'','success')

                    applyCartAmounts(
                    response.cart_amount['subtotal'],
                    response.cart_amount['tax'],
                    response.cart_amount['grand_total']);
                    
                    // remove the cart item from the cart page
                    removeCartItem(0,cart_id);
                    checkEmptyCart();
            }
        }
        })

    })
    // deletwe the cart element from the cart display on the cart page
    function removeCartItem( cartitemQty,cart_id){
            if (cartitemQty <= 0){
                document.getElementById('cart-item-' + cart_id).remove();
            }
        

    }
    // check if the cart is empty
    function checkEmptyCart(){
        var cart_counter = document.getElementById('cart_counter').innerHTML;
        if (cart_counter == 0){
            document.getElementById('empty-cart').style.display = 'block';
        }
    }
    //apply cart amounts
    function applyCartAmounts(subtotal,tax,grand_total){
        if (window.location.pathname == '/cart/'){
            $('#subtotal').html(subtotal);
            $('#tax').html(tax);
            $('#total').html(grand_total);
        }
    }

});

