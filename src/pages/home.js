import React from "react"
import { Link } from "gatsby"
import { ToastContainer, toast } from "react-toastify"

import Layout from "../components/layout"
import SEO from "../components/seo"

import "react-toastify/dist/ReactToastify.css"
import styles from "../styles/home.module.css"

const Home = () => {
  const callHost = () => toast.success("Your waiter/waitress has been called.");
  const callCheck = () => toast.success("Your check will be delivered shortly.");
  return (
    <Layout>
      <SEO title="Home of DineLine" />
      <ToastContainer />
      <h1>Welcome to DineLine</h1>
      <div className={styles.options}>
        <Link to="/menu">View Menu</Link>
        <Link to="/home" onClick={callHost}>Call Waiter/Waitress</Link>
        <Link to="/order-progress">Check on Order Progress</Link>
        <div className={styles.paymentOptions}>
          <Link to="/home" onClick={callCheck}>Ask for the Check</Link>
          <Link to="/pay-with-square">Pay with Square</Link>
        </div>
      </div>
      <Link to="/">Go back to the homepage</Link>
    </Layout>
  )
}

export default Home
