module.exports = function (config, pageType, pageData) { 
  var pageTypes = {
    product: function() {
      fbq('track', 'ViewContent', {
        content_name: pageData[0].name, //product name
        //content_category: 'Apparel & Accessories > Shoes', //product category
        content_ids: [pageData[0].id], //array of product SKUs
        content_type: 'product', //should be 'product' on product pages or 'product_group' on category pages
        value: pageData[0].msrpInCents/100, //product price – leave blank on category pages
        currency: 'USD'
      });
    },
    store: function() {
      if (window.location.pathname === '/search') {
        // Search
        // Track searches on your website (ex. product searches)
        fbq('track', 'Search');
        return;
      }

      fbq('track', 'ViewContent', {
        //content_name: pageData[0].name, //product name
        content_category: pageData.name, //product category
        content_ids: _.map(pageData.products, function(product) {
          return product.id
        }), //array of product SKUs
        content_type: 'product_group', //should be 'product' on product pages or 'product_group' on category pages
        //value: pageData[0].msrpInCents/100, //product price – leave blank on category pages
        currency: 'USD'
      });
    },
    cart: function() {
      fbq('track', 'AddToCart', {
        content_name: 'Shopping Cart',         
        content_ids: _.map(pageData.lineItems, function(lineItems) {
          return lineItem.product.id;
        }), //array of product SKUs in the cart
        content_type: 'product_group', //should be 'product' for single items or 'product_group' for multiple items
        value: pageData.priceWithoutDiscount/100, //total value of all products in the cart
        currency: 'USD'
      });

      fbq('track', 'InitiateCheckout');
    },
    order: function() {
      fbq('track', 'Purchase', {
        content_ids: _.map(pageData.lineItems, function(lineItems) {
          return lineItem.product.id;
        }),
        content_type: 'product_group', //should be 'product' for single items or 'product_group' for multiple items
        value: pageData.orderFinancial.subtotal/100, //order subtotal
       currency: 'USD'                        
      });
    }
  };

  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','//connect.facebook.net/en_US/fbevents.js');
   
  fbq('init', config.pixelId);
  fbq('track', 'PageView');

  var pageFunction = pageTypes[pageType];
  pageFunction && pageFunction();

  var thisApp = {
    name: "Facebook Events",
    config: config,
    url: require("./package").repository.url
  };
  
  Symphony.activeApps = Symphony.activeApps || [];
  Symphony.activeApps.push(thisApp);
};