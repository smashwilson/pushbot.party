import React, {Component} from "react";
import {QueryRenderer, Environment} from "react-relay";
import {graphql} from "babel-plugin-relay/macro";
import CopyToClipboard from "react-copy-to-clipboard";

import {getEnvironment, QueryResult} from "../common/Transport";

import {EventsQuery} from "../__generated__/EventsQuery.graphql";

import "./Events.css";

interface FeedFormProps {
  ready: boolean;
  feedURL: string;
}

interface FeedFormState {
  copied: boolean;
}

class FeedForm extends Component<FeedFormProps, FeedFormState> {
  state = {
    copied: false,
  };

  render() {
    const btnClass = this.state.copied
      ? "btn btn-success"
      : "btn btn-secondary";
    const btnMessage = this.state.copied ? "Copied" : "Copy";

    return (
      <p className="form-inline">
        <input
          type="text"
          id="pushbot-events-feedurl"
          className="form-control"
          value={this.props.feedURL}
          readOnly
        />
        <CopyToClipboard
          text={this.props.feedURL}
          onCopy={() => this.setState({copied: true})}
        >
          <button className={btnClass} disabled={!this.props.ready}>
            {btnMessage}
          </button>
        </CopyToClipboard>
      </p>
    );
  }
}

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
