import React from "react";
import './Layout.css';
import Navbar from "./Navbar";

export default function Layout({children}){ 
    return(
        <>        
            <div className="layout">                
                <div className = "navbar">
                    <Navbar />
                </div>
                <div className = "body">
                    {children}
                </div>
            </div>
        </>
    )
}