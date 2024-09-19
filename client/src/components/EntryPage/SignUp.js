import { useState, useRef } from "react";
import Input from "../Input/Input.js";
import ErrorModal from "../ErrorModal/ErrorModal";
import Button from "../Button/Button";
import useInput from "../Hooks/useInput.js";
import { SERVER_URL } from "../../config.js";
import "./SignUp.css";

function isUsernameValid(username) {
  return username.length >= 2;
}

function isPasswordValid(password) {
  return password.length >= 6;
}

function SignUp({ role = "user", handleSuccessfulSignup }) {
  const [usernameTaken, setUsernameTaken] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState("");
  const [instrumentError, setInstrumentError] = useState("");
  const [loading, setLoading] = useState(false);
  const errorModal = useRef();

  const {
    value: usernameValue,
    handleInputChange: handleUsernameChange,
    handleInputBlur: handleUsernameBlur,
    handleInputFocus: handleUsernameFocus,
    hasError: usernameHasError,
  } = useInput("", isUsernameValid);

  const {
    value: passwordValue,
    handleInputChange: handlePasswordChange,
    handleInputBlur: handlePasswordBlur,
    handleInputFocus: handlePasswordFocus,
    hasError: passwordHasError,
  } = useInput("", isPasswordValid);

  const instruments = [
    "drums",
    "guitars",
    "bass",
    "saxophone",
    "keyboards",
    "vocals",
  ];

  const handleInstrumentChange = (event) => {
    setSelectedInstrument(event.target.value);
    setInstrumentError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetErrors();

    if (!validateForm()) return;

    const values = {
      username: usernameValue,
      password: passwordValue,
      instrument: selectedInstrument,
      role: role,
    };

    try {
      await submitSignup(values);
    } catch (error) {
      console.error("Network error:", error);
      setInstrumentError("Network error. Please check your connection.");
    }
  };

  const resetErrors = () => {
    setUsernameTaken(false);
    setInstrumentError("");
  };

  const validateForm = () => {
    if (!selectedInstrument) {
      setInstrumentError("Please select an instrument.");
      return false;
    }
    return true;
  };

  const submitSignup = async (values) => {
    setLoading(true);
    const response = await fetch(`${SERVER_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (response.ok) {
      handleSuccessfulSignup();
    } else {
      handleErrorResponse(response);
    }
    setLoading(false);
  };

  const handleErrorResponse = async (response) => {
    const error = await response.json();
    if (response.status === 400 && error.detail === "Username already exists") {
      setUsernameTaken(true);
      errorModal.current.showModal();
    } else {
      console.error("Signup failed:", error.detail);
      setInstrumentError("Signup failed. Please try again later.");
    }
  };

  return (
    <div className="sign-up-container">
      <h2>{role === "user" ? "User" : "Admin"} Signup</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="Username"
          type="text"
          id="username"
          name="username"
          value={usernameValue}
          onChange={handleUsernameChange}
          onBlur={handleUsernameBlur}
          onFocus={handleUsernameFocus}
          error={
            usernameHasError && "Username must be at least 2 characters long"
          }
        />
        <Input
          label="Password"
          type="password"
          id="password"
          name="password"
          value={passwordValue}
          onChange={handlePasswordChange}
          onBlur={handlePasswordBlur}
          onFocus={handlePasswordFocus}
          error={
            passwordHasError && "Password must be at least 6 characters long"
          }
        />
        <label htmlFor="instrument">Instrument</label>
        <select
          id="instrument"
          value={selectedInstrument}
          onChange={handleInstrumentChange}
        >
          <option value="" disabled>
            Select your instrument
          </option>
          {instruments.map((instrument) => (
            <option key={instrument} value={instrument}>
              {instrument}
            </option>
          ))}
        </select>
        {instrumentError && <p className="error-message">{instrumentError}</p>}
        <Button
          type="submit"
          title={loading ? "Signing up..." : "Signup"}
          disabled={loading}
        />
      </form>

      <ErrorModal
        ref={errorModal}
        header="Username is taken"
        content="Please choose another username."
      />
    </div>
  );
}

export default SignUp;
