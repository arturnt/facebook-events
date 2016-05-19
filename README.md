Symphony Product/Facebook Events:

Use:
```
"all-pages": {
  "facebook-events": {
    "config": {
      "pixelId": PIXEL_ID,
      "event": ["AddToCart"]
      "eventType": ["InitiateCheckout", "AddToCart"]
    },
    "active": true
  }
}
```

config.event is to fire tracking pixels inside the function shouldFire. The pageType and event should match the parameters in the if statement.

config.eventType is to fire tracking pixels of a desired type. For example, if your brand wants to track AddToCart on the homepage, you can set eventType: ["AddToCart"] under "home".