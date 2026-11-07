document.addEventListener('DOMContentLoaded', () => {
    if (typeof paypal === 'undefined') return;

    paypal.Buttons({
        createOrder: () => paypalOrderId,
        onApprove: async (data) => {
            const response = await fetch('/payments/capture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderId: data.orderID, bookingId })
            });

            if (!response.ok) {
                const errorText = await response.text();
                document.getElementById('payment-error').textContent = errorText || 'Payment confirmation failed.';
                return;
            }

            window.location.href = '/bookings';
        },
        onError: (err) => {
            document.getElementById('payment-error').textContent = err.toString();
        }
    }).render('#paypal-button-container');
});
