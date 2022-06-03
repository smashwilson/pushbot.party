import React, {useContext} from "react";
import {NavLink} from "react-router-dom";

import {Role} from "./common/Role";
import {PendingDiffContext, hasPendingDelta} from "./common/PendingDiff";

interface PillProps {
  to: string;
  exact?: boolean;
  children: React.ReactNode;
}

function Pill(props: PillProps) {
  return (
    <li role="presentation" className="nav-item">
      <NavLink
        to={props.to}
        end={props.exact}
        className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
      >
        {props.children}
      </NavLink>
    </li>
  );
}

export const SideNav = () => {
  const showBadge = hasPendingDelta(useContext(PendingDiffContext).delta);

  return (
    <ul className="nav nav-pills flex-column">
      <Pill to="/" exact>
        dashboard
      </Pill>
      <Pill to="/people">dramatis personae</Pill>
      <Pill to="/recent">recent chatter</Pill>
      <hr />
      <Pill to="/quotes">quotes</Pill>
      <Pill to="/rem">rem</Pill>
      <Pill to="/events">events</Pill>
      <Role name="admin">
        <>
          <hr />
          <p className="bg-warning text-white font-weight-bold p-2 rounded text-center">
            <i className="fas fa-id-badge me-2" />
            admin only
          </p>
          <Pill to="/admin/services">services</Pill>
          <Pill to="/admin/sync">
            sync{" "}
            {showBadge && (
              <span className="badge badge-info float-end">pending</span>
            )}
          </Pill>
        </>
      </Role>
    </ul>
  );
};
