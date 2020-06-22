import React, { useState, useEffect } from "react"
import { Link } from "gatsby"
import { ToastContainer, toast } from "react-toastify"
import axios from "axios"

import Layout from "../components/layout"
import SEO from "../components/seo"

import "react-toastify/dist/ReactToastify.css"
import styles from "../styles/pay-with-square.module.css"

const PayWithSquare = () => {

  const handleCheckout = () => toast.warning("This feature is currently disabled as the app is not in production.")

  return (
    <Layout>
      <SEO title="Checkout with Square" />
      <ToastContainer />
      
      <div className={styles.main}>
      <Link className={styles.goBack} to="/home">
          {"< Back to Home"}
        </Link>
        <h3 className={styles.title}>Checkout with Square.</h3>
        <p>Pay with Square using the button below. <br /> A fully contactless dine-in payment solution.</p>
        <div onClick={handleCheckout} className={styles.purchase}>
        Pay With Square
        </div>
      </div>
    </Layout>
  )
}

export default PayWithSquare
