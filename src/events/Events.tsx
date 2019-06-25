import React, {Component} from "react";
import {QueryRenderer, Environment} from "react-relay";
import {graphql} from "babel-plugin-relay/macro";

import {FeedForm} from "./FeedForm";
import {getEnvironment, QueryResult} from "../common/Transport";

import {EventsQuery} from "../__generated__/EventsQuery.graphql";

import "./Events.css";

export class Events extends Component {
  private environment: Environment;

  constructor() {
    super({});
    this.environment = getEnvironment();
  }

  render() {
    const query = graphql`
      query EventsQuery {
        calendarURL
      }
    `;

    return (
      <QueryRenderer<EventsQuery>
        environment={this.environment}
        query={query}
        variables={{}}
        render={this.renderResult}
      />
    );
  }

  renderResult = (result: QueryResult<EventsQuery>) => {
    return (
      <div>
        <h3>Goings On and Happenings</h3>
        {this.renderResultBody(result)}
      </div>
    );
  };

  renderResultBody({error, props}: QueryResult<EventsQuery>) {
    if (error) {
      return <div>{error.message}</div>;
    }

    const ready = Boolean(props);
    const feedURL = props ? props.calendarURL : "...";

    return (
      <div>
        <p>
          Keep up with #~s events planned in the <code>#events</code> channel
          with your own, personal iCal feed.
        </p>
        <FeedForm ready={ready} feedURL={feedURL} />
        <p>
          Subscribe to this URL with any compatible calendar software, including{" "}
          <a
            href="https://calendar.google.com/calendar/r/settings/addbyurl"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google calendar
          </a>
          .
        </p>
      </div>
    );
  }
}
