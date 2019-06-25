import React, {useContext} from "react";

import {IUser} from "./userTypes";

export type IUser = IUser;
export const UserContext = React.createContext<IUser | null>(null);

interface RoleProps {
  name: string;
  children: JSX.Element;
}

export const Role = (props: RoleProps) => {
  const user = useContext(UserContext);
  if (!user) return null;

  const match = user.roles.some(role => role.name === props.name);
  if (!match) return null;

  return props.children;
};
