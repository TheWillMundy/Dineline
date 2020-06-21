import React from "react"
import { Link, graphql, useStaticQuery } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

import styles from "../styles/menu.module.css"

import currency from "currency.js"

const getPrices = variations => {
  let initialPrice = variations[0].item_variation_data.price_money.amount
  let minPrice = initialPrice
  let maxPrice = initialPrice

  for (let variation of variations.slice(1)) {
    let { item_variation_data } = variation
    let { price_money } = item_variation_data
    let { amount } = price_money
    if (amount && amount < minPrice) {
      minPrice = amount
    } else if (amount && amount > maxPrice) {
      maxPrice = amount
    }
  }

  // Divide by 100 since Square's pricing is x100
  minPrice = minPrice / 100
  maxPrice = maxPrice / 100

  // Transform into currency
  minPrice = currency(minPrice, { symbol: "$", precision: 2 })
  maxPrice = currency(maxPrice, { symbol: "$", precision: 2 })

  if (minPrice.value !== maxPrice.value) {
    return `${minPrice.format(true)} - ${maxPrice.format(true)}`
  }

  return `${minPrice.format(true)}`
}

const Menu = ({ data }) => {
  let categories = []
  let modifiers = []
  let items = []

  data.allSquareCatalog.nodes.map(node => {
    switch (node.type) {
      case "CATEGORY":
        categories.push(node)
        break
      case "MODIFIER_LIST":
        modifiers.push(node.modifier_list_data)
        break
      case "ITEM":
        items.push({ item_data: node.item_data, slug: node.fields.slug })
        break
      default:
        break
    }
  })

  return (
    <Layout>
      <SEO title="Menu" />
      <h1>Welcome to the DineLine Menu</h1>
      {categories.map(node => {
        let filteredItems = items.filter(
          item => item.item_data.category_id === node.alternative_id
        )
        console.log(filteredItems)
        return (
          <>
            <h2>{node.category_data.name}</h2>
            {filteredItems.map(item => {
              let { item_data, slug } = item
              let { name, description, variations } = item_data
              // Using variations info, get min, max pricing
              let priceString = getPrices(variations)
              return (
                <Link className={styles.link} to={`/${slug}`}>
                  <div className={styles.item}>
                    <div className={styles.info}>
                      {name}
                      {description ? (
                        <p className={styles.description}>
                          {description.length > 50
                            ? description.substring(0, 50) + "..."
                            : description}
                        </p>
                      ) : null}
                    </div>
                    <div className={styles.price}>{priceString}</div>
                  </div>
                </Link>
              )
            })}
          </>
        )
      })}
    </Layout>
  )
}

export const query = graphql`
  query original {
    allSquareCatalog {
      nodes {
        type
        category_data {
          name
        }
        modifier_list_data {
          name
          modifiers {
            modifier_data {
              name
              price_money {
                amount
              }
              on_by_default
            }
            alternative_id
          }
        }
        alternative_id
        item_data {
          name
          description
          category_id
          product_type
          ecom_available
          ecom_visibility
          skip_modifier_screen
          variations {
            item_variation_data {
              price_money {
                amount
              }
            }
          }
          modifier_list_info {
            modifier_list_id
          }
        }
        id
        fields {
          slug
        }
      }
    }
  }
`

export default Menu