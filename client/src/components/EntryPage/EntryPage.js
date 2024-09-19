import {useState} from "react";
import Login from './Login.js';
import SignUp from './SignUp.js';
import Button from '../Button/Button.js';
import "./EntryPage.css";

function EntryPage({ onLogin, role = 'user', defaultAction = ""}) {
  console.log('inside Entry page');
  const [chosenAction, setChosenAction] = useState(defaultAction);
  return (
    <>
      <h1 className="entry-title">Welcome to JaMoveo!</h1>
      <div className="entry-container">
        {chosenAction === "" && (<>
        <Button onClick={() => setChosenAction("Signup")} title = 'Signup'/>
        <Button onClick={() => setChosenAction("Login")} title = 'Login'/>
        </>)}
        {chosenAction === 'Signup' && <SignUp role = {role} handleSuccessfulSignup = {() => {setChosenAction("Login")}}/>}
        {chosenAction === 'Login' && <Login role = {role} handleLogin = {onLogin}/>}
      </div>
    </>
  );
}

export default EntryPage;



// (
//   <>
//     <h1 className="entry-title">Welcome to JaMoveo</h1>
//     <div className="button-container">
//       {chosenAction === "" && (<>
//       <Button onClick={() => setChosenAction("Signup")} title = 'Signup'/>
//       <Button onClick={() => setChosenAction("Login")} title = 'Login'/>
//       </>)}
//       {chosenAction === 'Signup' && <SignUp role = {role} handleSuccessfulSignup = {() => {setChosenAction("Login")}}/>}
//       {chosenAction === 'Login' && <Login role = {role} handleLogin = {onLogin}/>}
//     </div>
//   </>
// );