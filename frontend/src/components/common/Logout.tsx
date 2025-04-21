import { signInWithRedirect } from "@aws-amplify/auth";
import { Button } from "react-bootstrap";

export default function LoggedOut() {
  const login = () => {
    signInWithRedirect(); // THIS triggers the Hosted UI login flow
  };

  return (
    <div style={{ textAlign: "center", paddingTop: "4rem" }}>
      <h2>You have been logged out</h2>
      <p>To continue, please log back in.</p>
      <Button variant="outline-primary" size="sm" onClick={login}>
        Log In
      </Button>
    </div>
  );
}
