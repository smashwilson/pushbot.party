import React from "react";
import {NavLink} from "react-router-dom";

interface PillProps {
  to: string;
  exact?: boolean;
  children: string;
}

const Pill = (props: PillProps) => (
  <li role="presentation" className="nav-item">
    <NavLink
      to={props.to}
      exact={props.exact}
      className="nav-link"
      activeClassName={"active"}
    >
      {props.children}
    </NavLink>
  </li>
);

export const SideNav = () => (
  <ul className="nav nav-pills flex-column">
    <Pill to="/" exact>
      dashboard
    </Pill>
    <Pill to="/people">dramatis personae</Pill>
    <Pill to="/recent">recent chatter</Pill>
    <hr />
    <Pill to="/quotes">quotes</Pill>
    <Pill to="/events">events</Pill>
  </ul>
);
