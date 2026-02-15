// Get order ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('id');
        
        // Get orders from localStorage
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        
        // Find the order
        const order = orders.find(o => o.orderId === orderId) || orders[orders.length - 1];
        
        if (order) {
            // Display order details
            const orderDiv = document.getElementById('orderDetails');
            
            let itemsHtml = '';
            order.items.forEach(item => {
                itemsHtml += `
                    <div style="margin-left: 20px;">
                        <strong>${item.name}</strong> x${item.quantity} = ₦${(item.price * item.quantity).toLocaleString()}
                    </div>
                `;
            });

            orderDiv.innerHTML = `
                <h2>Order ID: ${order.orderId}</h2>
                
                <h3>Order Date:</h3>
                <p>${new Date(order.orderDate).toLocaleString()}</p>
                
                <h3>Items Ordered:</h3>
                ${itemsHtml}
                
                <h3>Customer Information:</h3>
                <p><strong>Name:</strong> ${order.customer.name}</p>
                <p><strong>Phone:</strong> ${order.customer.phone}</p>
                <p><strong>Email:</strong> ${order.customer.email || 'Not provided'}</p>
                <p><strong>Address:</strong> ${order.customer.address}</p>
                <p><strong>Delivery Time:</strong> ${order.customer.deliveryTime}</p>
                <p><strong>Instructions:</strong> ${order.customer.instructions || 'None'}</p>
                
                <h3>Payment Method:</h3>
                <p>${order.paymentMethod}</p>
                
                <h3>Order Summary:</h3>
                <p><strong>Subtotal:</strong> ₦${order.subtotal.toLocaleString()}</p>
                <p><strong>Delivery Fee:</strong> ₦${order.deliveryFee.toLocaleString()}</p>
                <p><strong>Total:</strong> ₦${order.total.toLocaleString()}</p>
                
                <h3>Status:</h3>
                <p>${order.status}</p>
            `;
        } else {
            document.getElementById('orderDetails').innerHTML = '<p>No order found.</p>';
        }