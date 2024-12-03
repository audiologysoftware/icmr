import React from 'react'
import './Goal.css'


export default function Goal({g,sk}) {
    return (
        <div className="header-section">
            <span className="group-goal">{g}</span>
            <span className="group-skill">{sk}</span>
        </div>
    )
}
