import React, { useState } from 'react';

const TextBox = () => {
  const [inputValue, setInputValue] = useState('');

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleChange}
      placeholder="Enter text..."
    />
  );
};

export default TextBox;
