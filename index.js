// this pixel needs to be seriously refactored. 
// - Firing add to cart events on /cart pageload
// - Not using any updates to cartdropdownctrl to fire add to cart
// - shouldFire logic and the config is generally very confusing

module.exports = function (config) {

  //check for preferred content type, otherwise default to 'product_group'
  var content_type = config.content_type || "product_group";

  //check config for option to check for subscriptions in order
  var subscriptionCheck = config.subscriptionCheck || false;

  function shouldFire(pageType, eventTrigger) {
    var check = false;

    if (!config.event) {
      check = true;
    }

    if(pageType === Symphony.pageType) {
      _.each(config.event, function(value) {
        if(eventTrigger === value) {
          check = true;
        }
      });
    }

    return check;
  }


  var pageTypes = {
    product: function(product) {

      fbq('track', 'ViewContent', {
        content_name: product.name, //product name
        //content_category: 'Apparel & Accessories > Shoes', //product category
        content_ids: product[0].id, //array of product SKUs
        content_type: content_type, //determined by config
        value: product[0].msrpInCents/100, //product price – leave blank on category pages
        currency: 'USD'
      });

      if (shouldFire("product", "AddToCart")) {
        $('button.add-to-cart').click(function() {
          fbq('track', 'AddToCart', {
            content_name: product.name, //product name
            //content_category: 'Apparel & Accessories > Shoes', //product category
            content_ids: product[0].id, //array of product SKUs
            content_type: content_type, //determined by config
            value: product[0].msrpInCents/100, //product price – leave blank on category pages
            currency: 'USD'
          });
        });
      }
    },
    store: function(store) {
      fbq('track', 'ViewContent', {
        //content_name: pageData[0].name, //product name
        content_category: store.name, //product category
        content_ids: _.map(store.products, function(product) {
          return product.id;
        }), //array of product SKUs
        content_type: content_type, //determined by config
        //value: pageData[0].msrpInCents/100, //product price – leave blank on category pages
        currency: 'USD'
      });
    },
    cart: function(cart) {
      if (shouldFire("cart", "AddToCart")) {
        fbq('track', 'AddToCart', {
          content_name: 'Shopping Cart',
          content_ids: _.map(cart.lineItems, function(lineItem) {
            return lineItem.product.id;
          }), //array of product SKUs in the cart
          content_type: content_type, // determined by config
          value: cart.financial.subtotal/100, //total value of all products in the cart
          currency: 'USD'
        });
      }

      fbq('track', 'InitiateCheckout');
    },
    order: function(order) {

      function getPurchaseType() {
        if(subscriptionCheck && order.originalCart.containsSubscriptions) {
          return 'subscriptionPurchase';
        } else if (subscriptionCheck) {
          return 'singlePurchase';
        }
      }

      if(subscriptionCheck) {
        //For sending Single Purchase / Subscription Purchase data
        fbq('track', getPurchaseType(), {
          content_ids: _.map(order.lineItems, function (lineItem) {
            return lineItem.product.id;
          }),
          content_type: content_type, //determined by config
          value: order.orderFinancial.subtotal / 100, //order subtotal
          currency: 'USD',
          order_id: order.id
        });
      }

      if(config.productPurchaseTypes) {
        var purchaseType = false;
        _.each(config.productPurchaseTypes, function(pt) {
          var hasLineItemsMatching = _.filter(order.lineItems, function(lineItem) {
            return pt.match == 'title' && lineItem.product.name.indexOf(pt.value) != -1;
          }); 

          if(hasLineItemsMatching && hasLineItemsMatching.length) {
            purchaseType = pt.key;
          }
        });

        if(purchaseType !== false) {
          fbq('track', purchaseType, {
            value: order.orderFinancial.subtotal / 100,
            currency: 'USD',
            order_id: order.id
          });
        }
      }

      //Send the original purchase code as well
      fbq('track', 'Purchase' , {
        content_ids: _.map(order.lineItems, function (lineItem) {
          return lineItem.product.id;
        }),
        content_type: content_type, //determined by config
        value: order.orderFinancial.subtotal / 100, //order subtotal
        currency: 'USD',
        order_id: order.id
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

  if (config.eventType) {
    config.eventType.forEach(function(event) {
      fbq('track', event);
    });
  }

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

    var pageFunction = pageTypes[window.Symphony.pageType];
    pageFunction && pageFunction(symphonyObj[window.Symphony.pageType]);
  }]);

  $(window).on("EMAIL_SUBSCRIBE", function() {
    fbq('track', 'Lead');
  });

  var thisPixel = {
    name: "Facebook Events",
    config: config,
    url: require("./package").repository.url
  };

  Symphony.activePixels = Symphony.activePixels || [];
  Symphony.activePixels.push(thisPixel);
};

