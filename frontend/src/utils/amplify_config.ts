import { Amplify } from "aws-amplify";

const isLocal = window.location.hostname === "localhost";

const signOutRedirectUrl = isLocal
  ? "http://localhost:3000/logout"
  : "https://myalexandria.ai/logout";

const signInRedirectUrl = isLocal
  ? "http://localhost:3000"
  : "https://myalexandria.ai/";

export const configure_amplify = () => {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: "us-east-1_NTcDM684J",
        userPoolClientId: "3rem3pcj16jbgi9sj4cp6l72sv",
        loginWith: {
          oauth: {
            domain: "auth.myalexandria.ai",
            scopes: ["openid", "email", "profile"],
            redirectSignIn: [signInRedirectUrl],
            redirectSignOut: [signOutRedirectUrl],
            responseType: "code",
          },
        },
      },
    },
  });
};
