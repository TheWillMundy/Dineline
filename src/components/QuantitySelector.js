import React, { useState } from "react"

export default ({ value, onChange, style }) => {
  const subtract = () => (value > 1 ? onChange(value - 1) : value)
  const add = () => onChange(value + 1)

  return (
    <div className={style.quantitySelector}>
      <button disabled={value == 1} onClick={subtract} className={style.button}>
        -
      </button>
      <p className={style.value}>{value}</p>
      <button onClick={add} className={style.button}>
        +
      </button>
    </div>
  )
}
