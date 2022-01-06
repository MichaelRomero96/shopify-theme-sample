
/**
* Client for the Shopify API.
*/
class API {

    /**
    * Add products to cart
    * @param  {Object} items – Products to add.
    */
    async addToCart(items) {
        let formData = {
            items: items,
        }

        try {
            const response = await fetch(`${routes.cart_add_url}.js`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })
            const data = await response.json()
            return data
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
            const response = await fetch(`${routes.cart_update_url}.js`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })
            const data = await response.json()

            return data
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
            const response = await fetch(`?section_id=${sectionId}`)
            const content = await response.text()
            console.log('content')
            console.log(content)
            return content
        } catch (error) {
            console.error(`Error: ${error.message}`)
        }
    }
}

export default new API()