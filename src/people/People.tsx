import React, {Component} from "react";
import {QueryRenderer, Environment} from "react-relay";
import {graphql} from "babel-plugin-relay/macro";

import {getEnvironment, QueryResult} from "../common/Transport";
import {User, Person} from "./Person";

import {PeopleQuery} from "../__generated__/PeopleQuery.graphql";

import "./People.css";

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
