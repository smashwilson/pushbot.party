import React from "react";
import {Link} from "react-router-dom";

import "./Banner.css";

const LOGOUT_URL = `${process.env.REACT_APP_API_BASE_URL}/logout?backTo=true`;

interface BannerProps {
  username: string;
  title: string;
  avatar: string;
}

export const Banner = (props: BannerProps) => {
  let accountControl = null;

  if (props.username) {
    let accountElements = [];
    if (props.title) {
      accountElements.push(
        <span key="0" className="navbar-text pushbot-navbar-title">
          {props.title}

          <i
            key="1"
            className="far fa-circle pushbot-navbar-separator"
            aria-hidden="true"
          />
        </span>
      );
    }
    accountElements.push(
      <Link
        to={`/people/${props.username}`}
        key="2"
        className="navbar-text pushbot-navbar-username font-weight-bolder"
      >
        @{props.username}
      </Link>
    );

    accountControl = (
      <>
        {accountElements}
        <img className="navbar-item pushbot-navbar-avatar" src={props.avatar} alt="" />
        <a href={LOGOUT_URL} className="navbar-item pushbot-navbar-logout">
          <i className="fas fa-sign-out-alt" aria-hidden="true" />
          Log out
        </a>
      </>
    );
  }

  return (
    <div className="container-fluid mx-0 px-0">
      <nav className="navbar navbar-expand-lg navbar-light bg-light mx-0 px-4">
        <button
          type="button"
          className="navbar-toggler collapsed"
          data-toggle="collapse"
          data-target="#bs-example-navbar-collapse-1"
          aria-expanded="false"
        >
          <span className="navbar-toggler-icon">Toggle navigation</span>
        </button>
        <div className="navbar-brand flex-grow-1">pushbot party</div>

        <div
          className="collapse navbar-collapse flex-grow-0"
          id="bs-example-navbar-collapse-1"
        >
          {accountControl}
        </div>
      </nav>
    </div>
  );
};
