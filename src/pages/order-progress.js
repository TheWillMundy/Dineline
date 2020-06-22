import React, { useEffect, useState } from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Image from "../components/image"
import SEO from "../components/seo"

import currency from "currency.js"

import styles from "../styles/order-progress.module.css"
import axios from "axios"

const getOrder = () => {
  let location_id = "EPPF2N0FRVPVP"

  let backendUrl =
    "https://guarded-cove-46425.herokuapp.com/orders/retrieveOrder"

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    params: {
      location_id: location_id,
      order_id: localStorage.getItem("order_id"),
    },
  }

  return axios.get(backendUrl, config).then(response => {
    return response
  })
}

const OrderProgress = () => {
  const [getOrderData, setOrderData] = useState(null)

  useEffect(() => {
    const fetchOrdersAsync = async () => {
      let orderData = await getOrder()
      setOrderData(orderData)
    }
    fetchOrdersAsync()
  }, [])

  if (!getOrderData) {
    return (
        <Layout>
        <SEO title="Order Progress" />
        <h2 className={styles.noOrdersTitle}>Loading.</h2>
      </Layout>
    )
  }

  let { data } = getOrderData
  let { line_items, total_money } = data[0]

  if (!line_items) {
    return (
      <Layout>
        <SEO title="Order Progress" />
        <Link className={styles.goBack} to="/">
          {"< Back to Home"}
        </Link>
        <h2 className={styles.noOrdersTitle}>You haven't ordered yet.</h2>
      </Layout>
    )
  }

  let waitingOn = line_items.filter(
    line_item =>
    !line_item.metadata || line_item.metadata["status"] == "PREPARING"
  )

  let served = line_items.filter(
    line_item => line_item.metadata && line_item.metadata["status"] == "SERVED"
  )

  console.log(getOrderData)

  return (
    <Layout>
      <SEO title="Order Progress" />
      <Link className={styles.goBack} to="/">
        {"< Back to Home"}
      </Link>
      <h2 className={styles.waitingOnTitle}>You're Waiting On...</h2>
      <div className={styles.items}>
        {waitingOn.map(item => (
          <>
            <p>{item.name}</p>
            <p>{item.quantity}</p>
            <p>
              {currency(item.total_money.amount / 100, {
                symbol: "$",
                precision: 2,
              }).format(true)}
            </p>
          </>
        ))}
      </div>
      <h3>You've Previously Received...</h3>
      <div className={styles.items}>{served.map(item => item.name)}</div>
      <div className={styles.total}>
        Running Total:{" "}
        {currency(total_money.amount / 100, {
          symbol: "$",
          precision: 2,
        }).format(true)}
      </div>
    </Layout>
  )
}

export default OrderProgress
