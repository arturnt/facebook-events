Symphony Product/Facebook Events:

By default, the following events are tracked: 

PageName | FB Event
------------- | -------------
Product | ViewContent [Sends product name, ID and MSRP in cents]
Store | ViewContent [Sends store name, array of product IDs]
Search | Search [Does not send extra data]
Order | Purchase [Sends array of line item product IDs and the order subtotal]
All | PageView [Sends no extra data]

If config.eventType is set, then all values in config.eventType will send as an event on ALL pages

config.event only takes on value in the array: AddToCart - this will allow the code to track add to cart events on the product pages. This will also send an AddToCart event on the /cart page, which actually sends ALL line items in the cart. 

If you want to send purchase data that indicates whether it is a subscription or single purchase, then use subscriptionCheck: true

Use:
```
"all-pages": {
  "facebook-events": {
    "config": {
      "pixelId": PIXEL_ID,
      "event": ["AddToCart"],
      "eventType": ["InitiateCheckout", "AddToCart"],
      "subscriptionCheck": BOOLEAN
    },
    "active": true
  }
}
```

