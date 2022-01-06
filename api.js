/**
* Client for the Shopify API.
*/
export class API {

  /**
  * Add products to cart
  * @param  {Object} items – Products to add.
  */
  async addToCart(items) {
    let formData = {
      items: items,
    }

    try {
      // const response = await fetch(`${routes.cart_add_url}.js`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(formData),
      // })
      // const data = await response.json()

      // return data
      const xhttp = new XMLHttpRequest()

      return new Promise((resolve, reject) => {
        xhttp.onload = (response) => {
          // const resJson = JSON.parse(response.target.response)
          const resJson = JSON.parse(response.target.response)
          resolve(resJson)
        }
        xhttp.open('POST', `${routes.cart_add_url}.js`)
        xhttp.setRequestHeader('Content-type', 'application/json')
        xhttp.send(JSON.stringify(formData))
      })
    } catch (error) {
      console.error(`Error: ${error.message}`)
    }
  }

  /**
  * Update the cart's line item quantities.
  * @param  {Object} config – Contains the product variant and
  * the quantity to update.
  */
  async updateCart(config) {
    const { id, quantity } = config

    let formData = {
      updates: {
        [id]: quantity,
      },
    }

    try {
      // const response = await fetch(`${routes.cart_update_url}.js`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(formData),
      // })
      // const data = await response.json()

      // return data
      const xhttp = new XMLHttpRequest()

      return new Promise((resolve, reject) => {
        xhttp.onload = (response) => {
          // const resJson = JSON.parse(response.target.response)
          const resJson = JSON.parse(response.target.response)
          resolve(resJson)
        }
        xhttp.open('POST', `${routes.cart_update_url}.js`)
        xhttp.setRequestHeader('Content-type', 'application/json')
        xhttp.send(JSON.stringify(formData))
      })
    } catch (error) {
      console.error(`Error: ${error.message}`)
    }
  }

  /**
  * Change the cart's line item quantities.
  * @param  {Object} config – Identify the line item to be
  * changed and quantities
  */
  async changeCart(config) {
    try {
      // const response = await fetch(`${routes.cart_change_url}.js`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(config),
      // })
      // const data = await response.json()

      // return data
      const xhttp = new XMLHttpRequest()

      return new Promise((resolve, reject) => {
        xhttp.onload = (response) => {
          // const resJson = JSON.parse(response.target.response)
          const resJson = JSON.parse(response.target.response)
          resolve(resJson)
        }
        xhttp.open('POST', `${routes.cart_change_url}.js`)
        xhttp.setRequestHeader('Content-type', 'application/json')
        xhttp.send(JSON.stringify(config))
      })
    } catch (error) {
      console.error(`Error: ${error.message}`)
    }
  }

  /**
  * Update a specific section with the use of Section Rendering API
  * @param {String} sectionId – Section ID.
  * @returns {Object} Section ID and its corresponding rendered HTML
  */
  async updateShopifySection(sectionId) {
    try {
      // const response = await fetch(`?section_id=${sectionId}`)

      // const content = await response.text()
      // console.log('content')
      // console.log(content)
      // return content
      const xhttp = new XMLHttpRequest()

      return new Promise((resolve, reject) => {
        xhttp.onload = (response) => {
          // const resJson = JSON.parse(response.target.response)
          resolve(response.target.response)
        }
        xhttp.open('GET', `?section_id=${sectionId}`)
        xhttp.send()
      })
    } catch (error) {
      console.error(`Error: ${error.message}`)
    }
  }

  /**
  * It is used to recommend related products for a specific product.
  * @param {String} id – Product ID.
  * @param {Number} limit – Limits the number of results.
  * @returns {Object} Product Recommendations.
  */
  async getRecommendedProducts(id, limit) {
    try {
      const url = `/recommendations/products?section_id=suggested-product&product_id=${id}&limit=${limit}`
      const response = await fetch(url)
      const html = await response.text()

      return html
    } catch (error) {
      console.error(`Error: ${error.message}`)
    }
  }

  /**
  * Get data from a resource
  * @param  {string} url – The path of the resource to obtain.
  */
  async read(url) {
    try {
      const response = await fetch(url)
      const data = await response.json()

      return data
    } catch (error) {
      console.log(error.message)
    }
  }
}