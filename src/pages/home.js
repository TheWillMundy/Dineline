import React, { useState, useEffect } from "react"
import { Link } from "gatsby"
import { ToastContainer, toast } from "react-toastify"
import axios from "axios"

import Layout from "../components/layout"
import SEO from "../components/seo"

import "react-toastify/dist/ReactToastify.css"
import styles from "../styles/home.module.css"

const config = {
  headers: {
    "Content-Type": "application/json",
  },
}

const createInitialOrder = () => {
  let dummyCustomer = "EH3VN9T5Z0YS59EJBMRJ8CGE68"
  let location_id = "EPPF2N0FRVPVP"

  let backendUrl = "http://guarded-cove-46425.herokuapp.com/orders/startOrder"

  const orderRequestBody = {
    customer_id: dummyCustomer,
    location_id: location_id,
  }

  axios
    .post(backendUrl, JSON.stringify(orderRequestBody), config)
    .then(response => {
      localStorage.setItem("order_id", response.data.id);
      localStorage.setItem("version", response.data.version);
    })
}

const Home = () => {
  const [getOrderId, setOrderId] = useState("")

  useEffect(() => {
    // Check if there is an existing order in local storage; if not, create one
    if (localStorage.getItem("order_id")) {
      setOrderId(localStorage.getItem("order_id"))
    } else {
      // Create order & set order_id in localstorage
      createInitialOrder()
    }
  }, []);

  const callHost = () => toast.success("Your waiter/waitress has been called.")
  const callCheck = () => toast.success("Your check will be delivered shortly.")
  return (
    <Layout>
      <SEO title="Home of Dineline" />
      <ToastContainer />
      <h2 className={styles.title}>Welcome to Zuccarelli Pizza</h2>
      <div className={styles.options}>
        <Link to="/menu">View Menu</Link>
        <Link to="/home" onClick={callHost}>
          Call Waiter/Waitress
        </Link>
        <Link to="/order-progress">Check on Order Progress</Link>
        <div className={styles.paymentOptions}>
          <Link to="/home" onClick={callCheck}>
            Ask for the Check
          </Link>
          <Link to="/pay-with-square">Pay with Square</Link>
        </div>
      </div>
    </Layout>
  )
}

export default Home
