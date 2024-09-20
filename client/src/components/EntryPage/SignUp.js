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
      // if form is ok sending its content to server.
      await submitSignup(values);
    } catch (error) {
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

  //submitting signup. 
  const submitSignup = async (values) => {
    setLoading(true);
    const response = await fetch(`${SERVER_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (response.ok) {
      // current state render the Login page right after.
      handleSuccessfulSignup();
    } else {
      handleErrorResponse(response);
    }
    setLoading(false);
  };

  // handle error returned from the server.
  const handleErrorResponse = async (response) => {
    const error = await response.json();
    if (response.status === 400 && error.detail === "Username already exists") {
      setUsernameTaken(true);
      errorModal.current.showModal();
    } else {
      setInstrumentError("Signup failed. Please try again later.");
    }
  };

  /*rendering a sign up form. must enter username, password and to choose an instrument.*/
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
