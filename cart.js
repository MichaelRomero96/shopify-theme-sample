import { domElements } from "../../product/src/domElements.js"
import { API } from "../../product/src/api.js"
import { UpsellProduct } from "../../product/index.js"
import { render } from "../../lib/index.js"
import { Loader } from "../../components/loader.js"
import { cartCountBubble } from "../../components/cartCountBubble.js"
import { cartDeleteFalse } from '../../utils/cartDeleteFalse.js'

/**
* Create the features for the side cart.
*/
export class Cart {

  constructor() {
    this.api = new API()
    this.isCartPage = false
    this.sideCartIsOpen = false
  }

  /**
  * Initializes the initial functions created
  */
  init() {
    if (window.location.pathname.includes("cart")) {
      this.isCartPage = true
      this.addEventsToButtons()
    }
  }

  /**
  * Add events to product buttons
  */
  addEventsToButtons() {
    const $productRemoveButtonListAsArray = [...document.querySelectorAll(".js-product-remove-button")]
    $productRemoveButtonListAsArray.forEach(button => {
      button.addEventListener("click", this.removeProduct)
    })

    const $increaseButtonListAsArray = [...document.querySelectorAll(".js-increase-product-quantity")]
    $increaseButtonListAsArray.forEach(button => {
      button.addEventListener("click", this.increaseProductQuantity)
    })

    const $decreaseButtonListAsArray = [...document.querySelectorAll(".js-decrease-product-quantity")]
    $decreaseButtonListAsArray.forEach(button => {
      button.addEventListener("click", this.decreaseProductQuantity)
    })

    const $suggestedProductListAsArray = [...document.querySelectorAll(".js-suggested-product-button")]
    $suggestedProductListAsArray.forEach(button => {
      const $mainProductData = button.nextElementSibling
      const $mobileImages = $mainProductData.nextElementSibling
      const upsellProduct = new UpsellProduct({
        mainProduct: JSON.parse($mainProductData.textContent),
        mobileImagesStr: $mobileImages.textContent,
      })
      upsellProduct.init()
      button.addEventListener("click", upsellProduct.addToCart)
    })

    const $sideCartButton = document.querySelector("#sideCartButton")

    if ($sideCartButton) {
      $sideCartButton.addEventListener("click", this.redirectToCheckout)
    }
  }

  /**
  * Render recommended products obtained from the Shopify API
  */
  async renderRecommendedProducts() {
    const cartIsEmpty = domElements().$productsInCart.dataset.cartItems > 0
    const limit = domElements().$productsInCart.dataset.suggestedProductQuantity
    if (cartIsEmpty) {
      const $firstProduct = document.querySelector(".js-cart-product")
      const productId = $firstProduct.dataset.productId
      const html = await this.api.getRecommendedProducts(productId, Number(limit))
      domElements().$sideCartUpsell.innerHTML = html
    }
  }

  /**
  * Update the header products counter
  * @param {number} itemCount – Number of items inside the cart
  */
  updateCounter(itemCount) {
    if (!domElements().$productCounter) {
      render(new cartCountBubble({ itemCount }), domElements().$cartIconBubble)
    } else if (itemCount === 0 && domElements().$cartCountBubble) {
      domElements().$cartCountBubble.remove()
    } else {
      domElements().$productCounter.innerHTML = itemCount
    }
  }

  /**
  * Build the upsell section slider
  */
  buildSlider() {
    $(".js-upsell-slider").slick({
      slidesToShow: 1,
      arrows: true,
      mobileFirst: true,
      // variableWidth: true,
      responsive: [
        {
          breakpoint: 400,
          settings: {
            slidesToShow: 2,
            arrows: true,
            infinite: false,
            variableWidth: false
          }
        },
        {
          breakpoint: 550,
          settings: {
            slidesToShow: 3,
            arrows: true,
            infinite: false,
            variableWidth: false
          }
        },
        {
          breakpoint: 992,
          settings: {
            slidesToShow: 3,
            arrows: true,
            infinite: false,
            variableWidth: false
          }
        },
      ]
    })
  }

  /**
  * Update the shopping cart
  */
  update = async() => {
    domElements().$sideCartContent.innerHTML = ""
    render(new Loader(), domElements().$sideCartContent)

    const content = await this.api.updateShopifySection("side-cart")
    domElements().$sideCartContent.innerHTML = content

    await this.renderRecommendedProducts()
    this.addEventsToButtons()
    this.buildSlider()
  }

  /**
  * Update the cart items in the cart page
  */
  updateMainCart = async() => {
    if (domElements().$cartItems) {
      domElements().$cartItems.remove()
    }
    domElements().$cartItemsContainer.innerHTML = ""
    render(new Loader(), domElements().$cartItemsContainer)
    const content = await this.api.updateShopifySection("main-cart-items")
    domElements().$cartItemsContainer.innerHTML = content

    if (domElements().$cartItems.classList.contains('is-empty')) {
      domElements().$mainCartFooter.classList.toggle('is-empty')
    }
    this.addEventsToButtons()
  }

  /**
  * Depending on the cart that is being updated,
  * this process will be prioritized
  */
  async coordinateUpdate() {
    if (this.isCartPage && this.sideCartIsOpen === true) {
      await this.update()
      await this.updateMainCart()
    } else if (this.isCartPage && this.sideCartIsOpen === false) {
      await this.updateMainCart()
      await this.update()
    } else {
      await this.update()
    }
  }

  /**
  * Update quantities of related products
  * every time pack quantities are updated
  * @param {object} cart – Cart
  * @param {number} variantId – ID of the pack variant
  * @param {number} quantity – Quantity
  */
  updateQuantitiesOfRelatedProducts = async (cart, variantId, quantity) => {
    if (this.isCartPage) {
      domElements().$cartItems.remove()
      domElements().$cartItemsContainer.innerHTML = ""
      render(new Loader(), domElements().$cartItemsContainer)
    } else {
      domElements().$sideCartContent.innerHTML = ""
      render(new Loader(), domElements().$sideCartContent)
    }
    const cartLength = cart.items.length

    if (quantity === 0) {
      let cartUpdated = {}
      for (let i = 0; i < cartLength; i++) {
        let cartItems = i === 0 ? cart.items : cartUpdated.items

        let relatedProductIndex = cartItems.findIndex(item => {
          if(item.product_type === "false" && item.properties.pack === variantId) {
            return true
          }

          return false
        })

        if (relatedProductIndex !== -1) {
          let item = {
            line: ++relatedProductIndex,
            quantity: quantity,
          }

          cartUpdated = await this.api.changeCart(item)
        }
      }
    } else {
      const relatedProductsIndex = cart.items.map((item, index) => {
        if(item.product_type === "false" && item.properties.pack === variantId) {
          return ++index
        }
      })

      const relatedProductsQuantity = relatedProductsIndex.length
      for (let i = 0; i < relatedProductsQuantity; i++) {
        if (relatedProductsIndex[i] !== undefined) {
          const item = {
            line: relatedProductsIndex[i],
            quantity: quantity,
          }

          await this.api.changeCart(item)
        }
      }
    }
  }

  /**
  * Remove product from cart.
  * @param {object} event – Event to handle.
  */
  removeProduct = async(event) => {
    const target = event.target
    const variantId = Number(target.dataset.variantId)

    if (target.dataset.productType === "Pack") {
      const cart = await this.api.read("/cart.js")
      await this.updateQuantitiesOfRelatedProducts(cart, variantId, 0)
    }

    const item = {
      id: variantId,
      quantity: 0,
    }

    const cart = await this.api.updateCart(item)
    const itemCountCart = cartDeleteFalse(cart.items)
    this.updateCounter(itemCountCart)
    await this.coordinateUpdate()
  }

  /**
  * Increase product quantity.
  * @param {object} event – Event to handle.
  */
  increaseProductQuantity = async(event) => {
    const target = event.target
    const variantId = Number(target.parentNode.dataset.variantId)
    const quantity = Number(target.parentNode.dataset.quantity)

    if (target.parentNode.dataset.productType === "Pack") {
      const cart = await this.api.read("/cart.js")
      await this.updateQuantitiesOfRelatedProducts(cart, variantId, quantity + 1)
    }

    const item = {
      id: variantId,
      quantity: quantity + 1,
    }

    const cart = await this.api.updateCart(item)
    const itemCountCart = cartDeleteFalse(cart.items)
    this.updateCounter(itemCountCart)
    await this.coordinateUpdate()
  }

  /**
  * Decrease product quantity.
  * @param {object} event – Event to handle.
  */
  decreaseProductQuantity = async(event) => {
    const target = event.target
    const variantId = Number(target.parentNode.dataset.variantId)
    const quantity = Number(target.parentNode.dataset.quantity)

    if (target.parentNode.dataset.productType === "Pack") {
      const cart = await this.api.read("/cart.js")
      await this.updateQuantitiesOfRelatedProducts(cart, variantId, quantity - 1)
    }

    const item = {
      id: variantId,
      quantity: quantity - 1,
    }

    const cart = await this.api.updateCart(item)
    const itemCountCart = cartDeleteFalse(cart.items)
    this.updateCounter(itemCountCart)
    await this.coordinateUpdate()
  }

  /**
  * Redirect to checkout
  */
  redirectToCheckout = () => {
    window.location.replace("/checkout")
  }

  /**
  * Open the side modal of the cart.
  */
  openModal = async() => {
    console.log('holiwis')
    this.sideCartIsOpen = true
    domElements().$sideCartOverlay.classList.add("is-active")
    await this.update()
  }

  closeModal = (event) => {
    this.sideCartIsOpen = false
    if (event.target.classList.contains("js-close-side-cart")) {
      domElements().$sideCartOverlay.classList.remove("is-active")
    }
  }
}