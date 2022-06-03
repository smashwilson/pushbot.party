import React from "react";
import {Link} from "react-router-dom";

export interface User {
  readonly name: string;
  readonly presence: string;
  readonly avatar: {image48: string | null};
  readonly status: {readonly message: string | null};
}

interface PersonProps {
  user: User;
  title: string;
}

export function Person(props: PersonProps) {
  const {name, presence, avatar, status} = props.user;
  const avatarURL = avatar.image48;
  const presenceIcon =
    presence === "ACTIVE"
      ? "pushbot-status-active fa-dot-circle"
      : "pushbot-status-inactive fa-circle";
  const {message} = status;

  return (
    <div className="pushbot-person row">
      <div className="col-sm-1 px-2">
        <img src={avatarURL!} className="rounded" alt="" />
      </div>
      <div className="col-sm-11 px-2">
        <p>
          <i
            className={`far pushbot-status me-2 ${presenceIcon}`}
            aria-hidden="true"
          />
          <Link to={`/people/${name}`} className="pushbot-person-name me-2">
            {name}
          </Link>
          <span className="pushbot-person-title font-weight-bold">
            {props.title}
          </span>
        </p>
        <p className="pushbot-person-status-message font-italic font-weight-light">
          {message}
        </p>
      </div>
    </div>
  );
}
