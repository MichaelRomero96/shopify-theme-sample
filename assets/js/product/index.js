import { domElements } from "../utils/dom-elements"
import { Product } from "./src/product"

window.addEventListener('DOMContentLoaded', () => {
    const product = new Product()
    domElements().$productButton.addEventListener('click', product.addToCart)
})