import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

import styles from "../styles/home.module.css"

const Home = () => (
  <Layout>
    <SEO title="Home of DineLine" />
    <h1>Welcome to DineLine</h1>
    <div className={styles.options}>
        <Link to="/menu">View Menu</Link>
        <Link to="/waiter">Call Waiter/Waitress</Link>
        <Link to="/order-progress">Check on Order Progress</Link>
        <div className={styles.paymentOptions}>
            <Link to="/check">Ask for the Check</Link>
            <Link to="/pay-with-square">Pay with Square</Link>
        </div>
    </div>
    <Link to="/">Go back to the homepage</Link>
  </Layout>
)

export default Home
