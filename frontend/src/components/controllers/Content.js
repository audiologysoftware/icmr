import React from 'react'

export default function Content({sk,instruction,displayScript,showOptions}) {
    return (
        <div className="content">
            <h2>{sk}</h2>
            <h4>{instruction}</h4>
            <div className="audio-icon" onClick={() => audioRef.current && audioRef.current.play()}>
                <span role="img" aria-label="speaker">🔊</span>
            </div>
            <h2 className="display-script">{displayScript}</h2>
            <div className="button-row">
                <button className="show-options-button" onClick={handleShowOptions}>
                    {showOptions ? 'Hide Options' : 'Show Options'}
                </button>
            </div>
            {showOptions && (
                <div className="option-buttons">
                    {options.map((option, index) => (
                        <button
                            key={index}
                            className="option-button"
                            onClick={() => handleResponse(option)} // Handle option selection
                            disabled={buttonsDisabled}
                        >
                            {option.replace('.wav', '')}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
