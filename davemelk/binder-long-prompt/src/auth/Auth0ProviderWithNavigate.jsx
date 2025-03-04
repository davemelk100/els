import { Auth0Provider } from "@auth0/auth0-react";
import { auth0Config } from "./auth0-config";

export const Auth0ProviderWithNavigate = ({ children }) => {
  return <Auth0Provider {...auth0Config}>{children}</Auth0Provider>;
};
