import React from 'react'

const Version = ({ color = "#9ca3af", backgroundColor = "white" }) => {
  return (
    <div
      style={{
        textAlign: "center",
        backgroundColor: backgroundColor,
        fontSize: "12px",
        width: "100%",
        color: color,
      }}
    >
      App Version 1.0.0
    </div>
  )
}

export default Version
