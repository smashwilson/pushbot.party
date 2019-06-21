import React, {Component, useContext} from "react";

export interface IUser {
  id: string;
  name: string;
  roles: {name: string}[];
}

export const UserContext = React.createContext<IUser | null>(null);

interface RoleProps {
  name: string;
  children: JSX.Element;
}

export const Role = (props: RoleProps) => {
  const user = useContext(UserContext);
  const match = user.roles.some(role => role.name === this.props.name);
  if (!match) return null;

  return this.props.children;
};
