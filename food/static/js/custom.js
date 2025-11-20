let autocomplete;

function initAutoComplete() {
    const inputField = document.getElementById("id_address");

    autocomplete = new google.maps.places.Autocomplete(inputField, {
        types: ["geocode", "establishment"],
        componentRestrictions: { country: ["in"] }
    });

    // Fired when user selects a place
    autocomplete.addListener("place_changed", onPlaceChanged);
}

function onPlaceChanged() {
    const place = autocomplete.getPlace();

    // If user typed something but did NOT select a suggestion
    if (!place.geometry) {
        document.getElementById("id_address").placeholder = "Start typing...";
        document.getElementById("id_address").value = "";
        return;
    }

    // Place successfully selected
    console.log("Place name =>", place.name);
    console.log("Full place object =>", place);

    // You can extract more fields here:
    // place.geometry.location.lat()
    // place.geometry.location.lng()
    // place.formatted_address
}





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

    //add opening hours
    $('.add_hour').on('click', function(e){
        e.preventDefault();
      
        // var day= $('#id_day').val();
        // var from_hour= $('#id_from_hour').val();
        // var to_hour= $('#id_to_hour').val();
        // var is_closed= $('#id_is_closed').is(':checked')
        // var url= $('#add_hour_url').val();
        // var csrf_token=$(this).parents('#opening_hours').find('[type="hidden"]').val();

        var day = document.getElementById('id_day').value 
        var from_hour = document.getElementById('id_from_hour').value 
        var to_hour = document.getElementById('id_to_hour').value 
        var is_closed = document.getElementById('id_is_closed').checked
        var csrf_token=$('input[name=csrfmiddlewaretoken]').val()
        var url=document.getElementById('add_hour_url').value

        console.log(day,from_hour,to_hour,is_closed,url,csrf_token)
        
        if(is_closed){
            is_closed='True'
            condition="day!=''"
        }else{
            is_closed='False'
            condition=" day!='' && from_hour !='' && to_hour!=''"
        }

        // if(day && from_hour && to_hour && url){
        if (eval(condition)) {
           $.ajax({
            type: 'POST',
            url:url,
            data:{
                'day':day,
                'from_hour': from_hour,
                'to_hour': to_hour,
                'is_closed': is_closed,
                'csrfmiddlewaretoken': csrf_token
            },
            success:function(response){
                if(response.status == 'success'){
                    if (response.is_closed =='Closed'){
                        html= '<tr id="hour-'+response.id+'"><td><b>'+response.day+' <b></td><td>Closed</td><td><a href ="#" class="remove_hour" data-url="/vendor/opening-hour/remove/'+response.id+'/">Remove</a></td></tr>' 
                    }else{
                   html= '<tr id="hour-'+response.id+'"><td><b>'+response.day+' <b></td><td>'+response.from_hour+'- '+response.to_hour+'</td><td><a href ="#" class="remove_hour" data-url="/vendor/opening-hour/remove/'+response.id+'/">Remove</a></td></tr>' 
                        
                    }

                   $(".opening_hours").append(html)
                //    document.getElementById("opening_hours_form").reset();
                document.getElementById("opening_hours_form").reset();

                }else{
                    console.log(response.error)
                    swal.fire(response.message, '',"error")
                }
                
            }

           })
        }else{
           swal.fire('please fill all the fields','','info')
        }
        
    })

    // remove opening hours
    $('.remove_hour').on('click', function(e){
        e.preventDefault();
        url=$(this).attr('data-url');


        $.ajax({
            type:'GET',
            url:url,
            success:function(response){
               if(response.status=='success'){
                    document.getElementById('hour-'+response.id).remove()
                }
            }
        })
    })

    //document ready close

});

