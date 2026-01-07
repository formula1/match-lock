
import { useUser } from "../../globals/user";
import { Login } from "./login";
import { Self } from "./self";

export function Auth() {
  const { user } = useUser();
  if(!user) return <Login />;
  return <Self />;
}
