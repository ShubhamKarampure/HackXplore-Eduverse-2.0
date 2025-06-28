"use client"
import { createContext, useState, useContext, useEffect, Children} from "react"

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({
    children
}) =>{
    const [theme, setTheme] = useState("light");
    
}