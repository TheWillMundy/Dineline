import React, { useState, useEffect } from "react"
import Layout from "../components/layout"
import { graphql, navigate, Link } from "gatsby"
import currency from "currency.js"
import Select from "react-select"
import QuantitySelector from "../components/QuantitySelector"

import style from "../styles/detail.module.css"
import axios from "axios"

const config = {
  headers: {
    "Content-Type": "application/json",
  },
}

const updateOrder = (quantity, note, variation, modifiers = {}) => {
  let location_id = "EPPF2N0FRVPVP"

  let order_id = localStorage.getItem("order_id")
  let version = localStorage.getItem("version")
  let variation_id = variation.alternative_id

  let backendUrl = "/api/orders/updateOrder"

  const updateOrderBody = {
    quantity: quantity,
    catalog_object_id: variation_id,
    note: note,
    location_id: location_id,
    order_id: order_id,
    current_version: version,
    modifiers: Object.keys(modifiers).flatMap(key => modifiers[key]), // we only need to send the backend a list of modifier ids
  }

  return axios
    .post(backendUrl, JSON.stringify(updateOrderBody), config)
    .then(response => {
      if (response.data.success) {
        console.log("Bruhhh")
        localStorage.setItem("version", response.data.version)
        navigate("/menu", { state: { itemPurchased: true }, replace: true })
      }
      console.log("fuckkkk")
    })
}

const matchModifiers = (product, modifiers) => {
  // Check if there are modifiers
  if (product.item_data.modifier_list_info) {
    // First get all modifier list ids for the product
    const modifierIds = product.item_data.modifier_list_info.map(
      info => info.modifier_list_id
    )

    // Match the modifier_ids to our modifier list
    const modifierOptionSets = modifiers.filter(modifier =>
      modifierIds.includes(modifier.alternative_id)
    )

    return modifierOptionSets
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

/**
 * Given the option value ids selected, returns the corresponding variation
 * @param {*} variations
 * @param {*} optionValueIds
 */
const getCorrespondingVariation = (variations, optionValueIds) => {
  return variations.filter(variation => {
    return variation.item_variation_data.item_option_values.every(set =>
      optionValueIds.includes(set.item_option_value_id)
    )
  })[0]
}

const variationOptionSetCombo = variations => {
  let combos = []

  for (let variation of variations) {
    // Get the option values that correspond to this variation
    let object = {
      name: variation.item_variation_data.name,
      variationId: variation.alternative_id,
      options: [],
    }
    for (let optionValue of variation.item_variation_data.item_option_values) {
      object.options.push(optionValue)
    }
    combos.push(object)
  }

  return combos
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
  const [getQuantity, setQuantity] = useState(1)
  const [getNote, setNote] = useState("")
  const [getOptionValueIds, setOptionValueIds] = useState([])
  const [getBaseVariation, setBaseVariation] = useState(null)
  const [getModifierOptions, setModifierOptions] = useState({})

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

  // Set default variation to the first one in the list
  useEffect(() => {
    let defaultVariation = variations[0]
    setBaseVariation(defaultVariation)

    // Initialize optionValueIds to fields on base variation
    if (defaultVariation.item_variation_data.item_option_values) {
      setOptionValueIds(
        defaultVariation.item_variation_data.item_option_values.map(
          optionValue => optionValue.item_option_value_id
        )
      )
    }
  }, [])

  // Update base variation when the selected options change
  useEffect(() => {
    if (variations.length > 1) {
      setBaseVariation(getCorrespondingVariation(variations, getOptionValueIds))
    }
  }, [getOptionValueIds])

  // Get the option sets for the variations included in this product
  const variationOptionSets = getProductOptionChoices(optionChoices, variations)

  // Match the retrieved modifiers with the modifiers for this product
  const modifierOptionSets = matchModifiers(product, modifiers)

  // Initialize modifier settings
  useEffect(() => {
    const initialModifierSettings = {}
    for (let modifierOptionSet of modifierOptionSets) {
      if (modifierOptionSet.modifier_list_data.selection_type == "MULTIPLE") {
        initialModifierSettings[modifierOptionSet.alternative_id] = []
      } else {
        // Set to first value
        initialModifierSettings[modifierOptionSet.alternative_id] =
          modifierOptionSet.modifier_list_data.modifiers[0].alternative_id
      }
    }
    setModifierOptions(initialModifierSettings)
  }, [])

  // When they click confirm, we'll send an update to our outstanding order
  const handleConfirm = () => {
    updateOrder(getQuantity, getNote, getBaseVariation, getModifierOptions)
  }

  return (
    <Layout>
      <div className={style.container}>
        <Link className={style.goBack} to="/menu">
          {"< Back to Menu"}
        </Link>
        <h2 className={style.title}>{product.item_data.name}</h2>
        <div className={style.description}>
        { product.item_data.description && (<span style={{ fontWeight: "bold" }}>Description:</span>)} { product.item_data.description }
        </div>
        {variationOptionSets.map(variationOptionSet => {
          let { choices } = variationOptionSet

          let selected = choices.filter(choice =>
            getOptionValueIds.includes(choice.value)
          )[0]

          const handleChange = ({ label, value }) => {
            // Update getOptionValueIds
            setOptionValueIds([
              ...getOptionValueIds.filter(elem => elem != selected.value),
              value,
            ])
          }

          return (
            <div className={style.variationSelectContainer}>
              <h2>{variationOptionSet.title}</h2>
              <Select
                onChange={handleChange}
                value={selected}
                options={variationOptionSet.choices}
              />
            </div>
          )
        })}
        {modifierOptionSets.map(modifierSet => {
          let { alternative_id: modifier_set_alternative_id } = modifierSet
          let {
            name,
            selection_type,
            modifiers,
          } = modifierSet.modifier_list_data
          if (selection_type == "MULTIPLE") {
            return (
              <>
                <h2 className={style.multipleModifierTitle}>{name}</h2>
                {modifiers.map(modifier => {
                  let { alternative_id: modifier_alternative_id } = modifier
                  let checked =
                    getModifierOptions.hasOwnProperty(
                      modifier_set_alternative_id
                    ) &&
                    getModifierOptions[modifier_set_alternative_id].includes(
                      modifier_alternative_id
                    )

                  const handleChange = event => {
                    let newOptions = getModifierOptions[
                      modifier_set_alternative_id
                    ].slice()
                    if (
                      getModifierOptions[modifier_set_alternative_id].includes(
                        event.target.value
                      )
                    ) {
                      // Remove since it is already in the list
                      newOptions = newOptions.filter(
                        elem => elem != event.target.value
                      )
                    } else {
                      newOptions.push(event.target.value)
                    }
                    setModifierOptions({
                      ...getModifierOptions,
                      [modifier_set_alternative_id]: newOptions,
                    })
                  }
                  return (
                    <div className={style.modifierCheckContainer}>
                      <span>{modifier.modifier_data.name}</span>
                      <input
                        className={style.modifierCheck}
                        onChange={handleChange}
                        value={modifier.alternative_id}
                        checked={checked}
                        type="checkbox"
                      />
                    </div>
                  )
                })}
              </>
            )
          } else {
            // Single selection modifier
            let choices = modifiers.map(modifier => ({
              label: modifier.modifier_data.name,
              value: modifier.alternative_id,
            }))

            let selected = choices.filter(
              choice =>
                choice.value == getModifierOptions[modifier_set_alternative_id]
            )

            const handleChange = selected => {
              setModifierOptions({
                ...getModifierOptions,
                [modifier_set_alternative_id]: selected.value,
              })
            }

            return (
              <div className={style.modifierSelectContainer}>
                <h2>{name}</h2>
                <Select
                  onChange={handleChange}
                  value={selected}
                  options={choices}
                />
              </div>
            )
          }
        })}
        <div className={style.textbox}>
          <label>Item Notes:</label>
          <textarea
            value={getNote}
            onChange={event => setNote(event.target.value)}
            name="note"
          />
        </div>
        <QuantitySelector
          style={style}
          value={getQuantity}
          onChange={setQuantity}
        />
        <div className={style.price}>
          {getBaseVariation
            ? currency(
                (getBaseVariation.item_variation_data.price_money.amount / 100) * getQuantity,
                {
                  symbol: "$",
                  precision: 2,
                }
              ).format(true)
            : null}
        </div>
        <div onClick={handleConfirm} className={style.confirm}>
          Confirm Item
        </div>
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
