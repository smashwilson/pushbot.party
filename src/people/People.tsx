import React, {Component} from "react";
import {QueryRenderer, Environment} from "react-relay";
import {graphql} from "babel-plugin-relay/macro";
import {Link} from "react-router-dom";

import {getEnvironment, QueryResult} from "../common/Transport";

import {PeopleQuery} from "../__generated__/PeopleQuery.graphql";

import "./People.css";

interface User {
  readonly name: string;
  readonly presence: string;
  readonly avatar: {image48: string | null};
  readonly status: {readonly message: string | null};
}

interface PersonProps {
  user: User;
  title: string;
}

const Person = (props: PersonProps) => {
  const {name, presence, avatar, status} = props.user;
  const avatarURL = avatar.image48;
  const presenceIcon =
    presence === "ACTIVE"
      ? "pushbot-status-active fa-dot-circle"
      : "pushbot-status-inactive fa-circle";
  const {message} = status;

  return (
    <div className="pushbot-person row">
      <div className="col-xs-1 px-2">
        <img src={avatarURL!} className="rounded" alt="" />
      </div>
      <div className="col-xs-11 px-2">
        <p>
          <i
            className={`far pushbot-status mr-2 ${presenceIcon}`}
            aria-hidden="true"
          />
          <Link to={`/people/${name}`} className="pushbot-person-name mr-2">
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
};

export class People extends Component {
  private environment: Environment;

  constructor(props: {}) {
    super(props);

    this.environment = getEnvironment();
  }

  render() {
    const query = graphql`
      query PeopleQuery {
        users {
          all {
            name
            presence

            avatar {
              image48
            }

            status {
              message
              emoji
            }
          }
        }

        titles: documents(set: "title") {
          all(criteria: {}) {
            edges {
              node {
                text
                subject
              }
            }
          }
        }
      }
    `;

    return (
      <QueryRenderer<PeopleQuery>
        environment={this.environment}
        query={query}
        variables={{}}
        render={this.renderResult}
      />
    );
  }

  renderResult = ({error, props}: QueryResult<PeopleQuery>) => {
    if (error) {
      return <div>{error.message}</div>;
    }

    return (
      <div>
        <h3>Dramatis Personae</h3>
        <blockquote className="blockquote text-right">
          Maybe the <em>real</em> lab was the friends we made along the way.
        </blockquote>
        <ul className="list-group">
          {this.collateUsers(props).map(({user, title}) => {
            return (
              <li key={user.name} className="list-group-item">
                <Person user={user} title={title} />
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  collateUsers(
    props: QueryResult<PeopleQuery>["props"]
  ): {user: User; title: string}[] {
    if (!props) {
      return [];
    }

    const titles = props.titles;
    if (!titles) {
      return [];
    }

    const titlesByUsername: {[username: string]: string} = {};
    for (const title of titles.all.edges) {
      if (title.node.subject) {
        titlesByUsername[title.node.subject] = title.node.text;
      }
    }

    const userData = props.users.all.map(user => {
      return {user, title: titlesByUsername[user.name] || ""};
    });

    userData.sort((a, b) => a.user.name.localeCompare(b.user.name));

    return userData;
  }
}
