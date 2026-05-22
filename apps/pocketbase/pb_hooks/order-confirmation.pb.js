/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  const orderNumber = e.record.get("orderNumber");
  const buyerId = e.record.get("buyerId");
  const items = e.record.get("items");
  const totalAmount = e.record.get("totalAmount");
  const status = e.record.get("status");
  
  // Fetch buyer information
  let buyerEmail = "";
  try {
    const buyer = $app.findRecordById("users", buyerId);
    buyerEmail = buyer.get("email");
  } catch (err) {
    console.log("Could not find buyer email for order confirmation");
    e.next();
    return;
  }
  
  if (!buyerEmail) {
    e.next();
    return;
  }
  
  // Format items for email
  let itemsHtml = "<ul>";
  if (Array.isArray(items)) {
    items.forEach((item) => {
      const productId = item.productId || "N/A";
      const quantity = item.quantity || 0;
      const price = item.price || 0;
      const subtotal = quantity * price;
      itemsHtml += "<li>Product ID: " + productId + " | Qty: " + quantity + " | Price: $" + price.toFixed(2) + " | Subtotal: $" + subtotal.toFixed(2) + "</li>";
    });
  }
  itemsHtml += "</ul>";
  
  // Calculate estimated delivery (5-7 business days)
  const estimatedDelivery = "5-7 business days";
  
  // Create and send email
  const message = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: "AGRO IMPULSO ORIENTE"
    },
    to: [{ address: buyerEmail }],
    subject: "Order Confirmation #" + orderNumber,
    html: "<h2>Order Confirmation</h2>" +
          "<p><strong>Order Number:</strong> " + orderNumber + "</p>" +
          "<p><strong>Status:</strong> " + status + "</p>" +
          "<h3>Order Items:</h3>" +
          itemsHtml +
          "<p><strong>Total Amount:</strong> $" + totalAmount.toFixed(2) + "</p>" +
          "<p><strong>Estimated Delivery:</strong> " + estimatedDelivery + "</p>" +
          "<p>Thank you for your order! We will notify you when your order is shipped.</p>" +
          "<p>Best regards,<br>AGRO IMPULSO ORIENTE Team</p>"
  });
  
  $app.newMailClient().send(message);
  e.next();
}, "orders");