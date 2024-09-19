import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

function Login({ handleLogin, role = "user" }) {
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const errorModal = useRef();
  const navigate = useNavigate();

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetErrors();

    if (usernameHasError || passwordHasError) return; // Validate fields

    const values = {
      username: usernameValue,
      password: passwordValue,
    };

    await submitLogin(values); // Call the submitLogin function
  };

  const resetErrors = () => {
    setLoginError(false);
  };

  const submitLogin = async (values) => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const data = await response.json();
        handleLogin(data.access_token); // Call handleLogin with the token
        if (role === "admin") {
          console.log('user role is admin');
          navigate("/");
        }
      } else {
        handleErrorResponse(response);
      }
    } catch (error) {
      console.error("Network error:", error);
      setLoginError(true);
      errorModal.current.showModal(); // Show error modal on network error
    } finally {
      setLoading(false);
    }
  };

  const handleErrorResponse = async (response) => {
    const error = await response.json();
    if (response.status === 401) {
      setLoginError(true); // Set login error for invalid credentials
      errorModal.current.showModal(); // Show error modal for invalid credentials
    } else {
      console.error("Login failed:", error.detail);
    }
  };

  return (
    <div className="sign-up-container">
      <h2>{role === 'user'? "User" : "Admin"} Login</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="Username"
          type="text"
          id="username"
          name="username"
          onBlur={handleUsernameBlur}
          onChange={handleUsernameChange}
          onFocus={handleUsernameFocus}
          value={usernameValue}
          error={usernameHasError && "Username must be 2 characters minimum"}
        />
        <Input
          label="Password"
          type="password"
          id="password"
          name="password"
          onBlur={handlePasswordBlur}
          onChange={handlePasswordChange}
          onFocus={handlePasswordFocus}
          value={passwordValue}
          error={passwordHasError && "Password must be 6 characters minimum"}
        />
        <Button
          type="submit"
          title={loading ? "Logging in..." : "Login"}
          disabled={loading}
        />
      </form>

      <ErrorModal
        ref={errorModal}
        header="Login Error"
        content={
          loginError
            ? "Invalid username or password."
            : "An error occurred. Please try again."
        }
      />
    </div>
  );
}

export default Login;
