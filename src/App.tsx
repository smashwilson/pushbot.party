import React, {Component} from "react";
import {QueryRenderer, Environment} from "react-relay";
import {graphql} from "babel-plugin-relay/macro";
import {HashRouter as Router} from "react-router-dom";

import {getEnvironment, AUTH_URL, QueryResult} from "./common/Transport";
import {isNetworkError} from "./common/errors";
import {Authenticated} from "./Authenticated";
import {Banner} from "./Banner";
import {Login} from "./Login";

import {AppQuery} from "./__generated__/AppQuery.graphql";

import "./App.css";

export class App extends Component {
  private environment: Environment;

  constructor(props: {}) {
    super(props);
    this.environment = getEnvironment();
  }

  render() {
    const query = graphql`
      query AppQuery {
        users {
          me {
            id
            name
            avatar {
              image48
            }
            roles {
              name
            }
            coordinatorToken
          }
        }

        title: documents(set: "title") {
          mine {
            text
            found
          }
        }
      }
    `;

    return (
      <QueryRenderer<AppQuery>
        environment={this.environment}
        query={query}
        variables={{}}
        render={this.renderResult}
      />
    );
  }

  renderResult = (result: QueryResult<AppQuery>) => {
    let body = null;
    let username = "";
    let title = "";
    let avatar = "";

    if (isNetworkError(result.error)) {
      if (result.error.responseStatus === 401) {
        const backTo = encodeURIComponent(document.location!.pathname);
        body = <Login authUrl={`${AUTH_URL}?backTo=${backTo}`} />;
      } else {
        body = <div>{result.error.message}</div>;
      }
    } else if (result.props) {
      const user = result.props.users.me;
      username = user.name;
      if (result.props.title) {
        title = result.props.title.mine.text;
      }
      if (user.avatar && user.avatar.image48) {
        avatar = user.avatar.image48;
      }

      body = <Authenticated user={user} />;
    } else {
      body = (
        <div className="row mt-md-5 pushbot-loading">
          <p className="mx-auto">
            <i className="fas fa-circle-notch fa-spin" aria-hidden="true" />
            loading
          </p>
        </div>
      );
    }

    return (
      <Router>
        <div className="container-fluid">
          <div className="row">
            <Banner username={username} title={title} avatar={avatar} />
          </div>
          {body}
        </div>
      </Router>
    );
  };
}
