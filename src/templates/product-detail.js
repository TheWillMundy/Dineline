import React from "react"
import Layout from "../components/layout"
import { graphql } from "gatsby"
import currency from "currency.js"
import Select from "react-select"

const matchModifiers = (product, modifiers) => {
  // Check if there are modifiers
  if (product.item_data.modifier_list_info) {
    // First get all modifier list ids for the product
    const modifierIds = product.item_data.modifier_list_info.map(
      info => info.modifier_list_id
    )

    // Match the modifier_ids to our modifier list
    const matches = modifiers.filter(modifier =>
      modifierIds.includes(modifier.alternative_id)
    )

    return matches
  }

  return []
}

const getAllOptionChoices = options => {
  let optionSelections = []

  options.map(option => {
    let optionTitle = option.item_option_data.display_name
    let values = option.item_option_data.values
    let optionNameAndIds = values.map(value => ({
      value: value.alternative_id,
      label: value.item_option_value_data.name,
    }))
    optionSelections.push({
      id: option.alternative_id,
      title: optionTitle,
      choices: optionNameAndIds,
    })
  })

  return optionSelections
}

const getProductOptionChoices = (allOptionChoices, variations) => {
  try {
    // From variations, get unique item_option_id values
    let uniqueOptionIds = new Set(
      // For each variation, we want the list of resulting option_ids to be flat at the end so we can take uniques
      variations.flatMap(variation =>
        // Need to dig a little to get to where we want
        variation.item_variation_data.item_option_values.map(
          // For each option value, get the item_option_id it corresponds to (essentially the id of the option set)
          option_value => option_value.item_option_id
        )
      )
    )

    return allOptionChoices.filter(optionChoices =>
      uniqueOptionIds.has(optionChoices.id)
    )
  } catch (e) {
    return []
  }
}

const getVariations = product => {
  return product.item_data.variations
}

const getVariationOptions = variations => {
  if (variations.length > 1) {
    let selectOptions = []

    // Multiple variations, need options
    for (let variation of variations) {
      let { item_variation_data, type } = variation
      let { item_id, name, price_money } = item_variation_data
      let price = currency(price_money.amount / 100, {
        symbol: "$",
        precision: 2,
      })

      let option = {
        label: name + ": " + price.format(true),
        value: item_id,
        price: price,
      }

      selectOptions.push(option)
    }
    return selectOptions
  } else {
    // Single variation, send null
    return null
  }
}

export default function ProductDetail({ data }) {
  const product = data.squareCatalog
  const modifiersAndOptions = data.allSquareCatalog

  const modifiers = modifiersAndOptions.nodes.filter(
    node => node.type == "MODIFIER_LIST"
  )
  const options = modifiersAndOptions.nodes.filter(
    node => node.type == "ITEM_OPTION"
  )

  const optionChoices = getAllOptionChoices(options)

  // Get item variations
  const variations = getVariations(product)
  const variationOptionSets = getProductOptionChoices(optionChoices, variations)

  // Match the retrieved modifiers with the modifiers for this product
  const matchedModifiers = matchModifiers(product, modifiers)

  return (
    <Layout>
      <div>
        <h1>{product.item_data.name}</h1>
        <div
          dangerouslySetInnerHTML={{ __html: product.item_data.description }}
        />
        {variationOptionSets.map(variationOptionSet => (
          <>
            <h2>{variationOptionSet.title}</h2>
            <Select options={variationOptionSet.choices} />
          </>
        ))}
        {matchedModifiers.map(modifierSet => {
          let {
            name,
            selection_type,
            modifiers,
          } = modifierSet.modifier_list_data
          if (selection_type == "MULTIPLE") {
            return (
              <>
                <h2>{name}</h2>
                {modifiers.map(modifier => {
                  return (
                    <div>
                      <span>{modifier.modifier_data.name}</span>
                      <input type="checkbox" />
                    </div>
                  )
                })}
              </>
            )
          } else {
            let choices = modifiers.map(modifier => ({ label: modifier.modifier_data.name, value: modifier.alternative_id }));
            return (
              <>
                <h2>{name}</h2>
                <Select options={choices} />
              </>
            )
          }
        })}
      </div>
    </Layout>
  )
}

export const query = graphql`
  query($slug: String!) {
    squareCatalog(fields: { slug: { eq: $slug } }) {
      item_data {
        name
        description
        category_id
        product_type
        skip_modifier_screen
        modifier_list_info {
          modifier_list_id
        }
        variations {
          type
          alternative_id
          updated_at
          version
          is_deleted
          present_at_all_locations
          item_variation_data {
            item_id
            name
            ordinal
            pricing_type
            sku
            price_money {
              amount
            }
            item_option_values {
              item_option_id
              item_option_value_id
            }
          }
        }
      }
    }

    allSquareCatalog(
      filter: { type: { in: ["MODIFIER_LIST", "ITEM_OPTION"] } }
    ) {
      nodes {
        type
        alternative_id
        modifier_list_data {
          name
          selection_type
          modifiers {
            alternative_id
            modifier_data {
              modifier_list_id
              name
              price_money {
                amount
              }
            }
          }
        }
        item_option_data {
          display_name
          values {
            alternative_id
            item_option_value_data {
              name
            }
          }
        }
      }
    }
  }
`
