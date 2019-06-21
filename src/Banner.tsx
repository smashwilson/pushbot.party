import React from "react";
import {Link} from "react-router-dom";

import "./Banner.css";

const LOGOUT_URL = `${process.env.REACT_APP_API_BASE_URL}/logout?backTo=true`;

interface BannerProps {
  username: string;
  title: string;
  avatar: string;
}

export default Banner = (props: BannerProps) => {
  let accountControl = null;

  if (props.username) {
    let accountElements = [];
    if (props.title) {
      accountElements.push(
        <span key="0" className="pushbot-navbar-title">
          {props.title}
        </span>
      );
      accountElements.push(
        <i
          key="1"
          className="fa fa-circle pushbot-navbar-separator"
          aria-hidden="true"
        />
      );
    }
    accountElements.push(
      <Link
        to={`/people/${props.username}`}
        key="2"
        className="pushbot-navbar-username"
      >
        @{props.username}
      </Link>
    );

    accountControl = (
      <ul className="nav navbar-nav navbar-right">
        <li>
          <p className="navbar-text">{accountElements}</p>
        </li>
        <li>
          <img className="pushbot-navbar-avatar" src={props.avatar} />
        </li>
        <li>
          <a href={LOGOUT_URL} className="pushbot-navbar-logout">
            <i className="fa fa-sign-out" aria-hidden="true" />
            Log out
          </a>
        </li>
      </ul>
    );
  }

  return (
    <nav className="navbar navbar-default">
      <div className="container-fluid">
        <div className="navbar-header">
          <button
            type="button"
            className="navbar-toggle collapsed"
            data-toggle="collapse"
            data-target="#bs-example-navbar-collapse-1"
            aria-expanded="false"
          >
            <span className="sr-only">Toggle navigation</span>
          </button>
          <p className="navbar-brand">pushbot party</p>
        </div>

        <div
          className="collapse navbar-collapse"
          id="bs-example-navbar-collapse-1"
        >
          {accountControl}
        </div>
      </div>
    </nav>
  );
};
