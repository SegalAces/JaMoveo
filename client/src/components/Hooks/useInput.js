import { useState } from "react";

export default function useInput(defaultValue = "", validationFunc = () => true) {
    const [enteredValue, setEnteredValue] = useState(defaultValue);
    const [didEdit, setDidEdit] = useState(false); // Tracks if the user has started typing
    const [isFocused, setIsFocused] = useState(false); // Tracks if the input field is focused

    const isValueValid = validationFunc(enteredValue); // Validate the input value
    const hasError = !isValueValid && didEdit && !isFocused && enteredValue.trim() !== ""; // Error is shown only after typing and leaving the input

    function handleInputChange(event) {
        setEnteredValue(event.target.value); // Update the value on typing
        setDidEdit(true); // Mark that the user has started editing
    }

    function handleInputFocus() {
        setIsFocused(true); // Reset the error state when the input is focused
    }

    function handleInputBlur() {
        setIsFocused(false); // Set to false on blur (when user leaves the field)
        setDidEdit(true); // Only show error if the user leaves the field after typing
    }

    return {
        value: enteredValue,
        hasError,
        handleInputBlur,
        handleInputChange,
        handleInputFocus,
    };
}



// import {useState} from "react";
// export default function useInput(defaultValue = "", validationFunc = () => true) {
//     const [enteredValue, setEnteredValue] = useState(defaultValue);
//     const [didEdit, setDidEdit] = useState(false);
//     const isValueValid = validationFunc(enteredValue);
  
//     function handleInputChange(event) {
//         setEnteredValue(event.target.value);
//         setDidEdit(true); // Set to true when user starts typing
//     }

//     function handleInputBlur() {
//         setDidEdit(true);
//     }

//     return {
//         value: enteredValue,
//         hasError: didEdit && !isValueValid, 
//         handleInputBlur,
//         handleInputChange,
//     };
// }