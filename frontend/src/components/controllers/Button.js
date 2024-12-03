import React from 'react'
import './Button.css'

function Button({ handleClick, buttonName,backgroundColor,visible }) {
  return (
    <button
      className="button"
      style={{ backgroundColor,visible}}
      onClick={handleClick}
    >
      {buttonName}
    </button>
  );
}


export default Button



