module.exports = function (config, pageType, pageData) { 
  var pageTypes = {
    product: function(product) {
      fbq('track', 'ViewContent', {
        content_name: product.name, //product name
        //content_category: 'Apparel & Accessories > Shoes', //product category
        content_ids: product[0].id, //array of product SKUs
        content_type: 'product_group', //should be 'product_group' on all pages
        value: product[0].msrpInCents/100, //product price – leave blank on category pages
        currency: 'USD'
      });
    },
    store: function(store) {
      fbq('track', 'ViewContent', {
        //content_name: pageData[0].name, //product name
        content_category: store.name, //product category
        content_ids: _.map(store.products, function(product) {
          return product.id;
        }), //array of product SKUs
        content_type: 'product_group', //should be 'product' on product pages or 'product_group' on category pages
        //value: pageData[0].msrpInCents/100, //product price – leave blank on category pages
        currency: 'USD'
      });
    },
    cart: function(cart) {
      fbq('track', 'AddToCart', {
        content_name: 'Shopping Cart',         
        content_ids: _.map(cart.lineItems, function(lineItem) {
          return lineItem.product.id;
        }), //array of product SKUs in the cart
        content_type: 'product_group', //should be 'product' for single items or 'product_group' for multiple items
        value: cart.financial.subtotal/100, //total value of all products in the cart
        currency: 'USD'
      });

      fbq('track', 'InitiateCheckout');
    },
    order: function(order) {
      fbq('track', 'Purchase', {
        content_ids: _.map(order.lineItems, function(lineItem) {
          return lineItem.product.id;
        }),
        content_type: 'product_group', //should be 'product' for single items or 'product_group' for multiple items
        value: order.orderFinancial.subtotal/100, //order subtotal
       currency: 'USD'                        
      });
    }
  };

  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments);};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s);}(window,
  document,'script','//connect.facebook.net/en_US/fbevents.js');
   
  fbq('init', config.pixelId);
  fbq('track', 'PageView');

  SymphonyAPI(["page", "product", "cart", "order", "store", function(page, product, cart, order, store) {
    if (window.location.pathname === '/search') {
      fbq('track', 'Search');
      return;
    }

    var symphonyObj = {
      order: order,
      cart: cart,
      store: store,
      product: product
    };

    var pageFunction = pageTypes[page.type];
    pageFunction && pageFunction(symphonyObj[page.type]);
  }]);
  

  var thisPixel = {
    name: "Facebook Events",
    config: config,
    url: require("./package").repository.url
  };
  
  Symphony.activePixels = Symphony.activePixels || [];
  Symphony.activePixels.push(thisPixel);
};