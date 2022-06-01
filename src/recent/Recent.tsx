import React, {Component} from "react";
import {QueryRenderer} from "react-relay";
import {Environment} from "relay-runtime";
import {graphql} from "babel-plugin-relay/macro";

import {getEnvironment} from "../common/Transport";
import {
  ILine,
  RecentChannelQuery,
  RecentChannelResult,
  RecentHistoryQuery,
  RecentHistoryResult,
} from "./queryTypes";
import {Selection} from "./selection";
import {History} from "./History";
import {ActionBar} from "./ActionBar";

import "./Recent.css";

interface RecentState {
  environment: Environment;
  currentChannel: string | null;
  selection: Selection;
}

export class Recent extends Component<{}, RecentState> {
  private knownChannels: ReadonlyArray<string> | null;
  private history: ReadonlyArray<ILine> | null;

  constructor(props: {}) {
    super(props);

    this.knownChannels = null;
    this.history = null;

    this.state = {
      environment: getEnvironment(),
      currentChannel: null,
      selection: new Selection(),
    };
    this.didChangeChannel = this.didChangeChannel.bind(this);
  }

  render() {
    if (this.knownChannels === null) {
      return this.renderChannelQuery();
    }

    return this.renderHistoryQuery();
  }

  renderError(error: Error) {
    return (
      <div className="pushbot-recent pushbot-recent-error">
        <h3>Recent Chatter</h3>
        <form className="pushbot-recent-form form-inline">
          <select
            className="pushbot-recent-channel form-control"
            value="..."
            disabled
          >
            <option value="...">...</option>
          </select>
        </form>
        <div className="pushbot-error-message">{error.message}</div>
      </div>
    );
  }

  renderChannelQuery() {
    const query = graphql`
      query RecentChannelQuery {
        cache {
          knownChannels
        }
      }
    `;

    return (
      <QueryRenderer<RecentChannelQuery>
        environment={this.state.environment}
        query={query}
        variables={{}}
        render={this.renderChannelResult}
      />
    );
  }

  renderChannelResult = ({error, props}: RecentChannelResult) => {
    if (error) {
      return this.renderError(error);
    }

    const channelNames = props ? props.cache.knownChannels : this.knownChannels;
    return this.renderCurrent(channelNames || [], null);
  };

  renderHistoryQuery() {
    const query = graphql`
      query RecentHistoryQuery($channel: String!) {
        cache {
          knownChannels
          linesForChannel(channel: $channel) {
            id
            speaker {
              id
              name
              avatar {
                image32
              }
            }
            timestamp
            text
          }
        }
      }
    `;

    const variables = {
      channel: this.state.currentChannel || "",
    };

    return (
      <QueryRenderer<RecentHistoryQuery>
        environment={this.state.environment}
        query={query}
        variables={variables}
        render={this.renderHistoryResult}
      />
    );
  }

  renderHistoryResult = ({error, props}: RecentHistoryResult) => {
    if (error) {
      return this.renderError(error);
    }

    let channelNames = this.knownChannels;
    if (props) {
      channelNames = props.cache.knownChannels.slice().sort();
    }
    const history = props ? props.cache.linesForChannel : this.history;

    return this.renderCurrent(channelNames, history);
  };

  renderCurrent(
    channelNames: ReadonlyArray<string> | null,
    history: ReadonlyArray<ILine> | null
  ) {
    if (channelNames) {
      if (!this.state.currentChannel && channelNames.length > 0) {
        const currentChannel = channelNames.includes("general")
          ? "general"
          : channelNames[0];
        setTimeout(() => this.setState({currentChannel}), 0);
      }
      this.knownChannels = channelNames;
    }

    if (history) {
      this.history = history;
    }

    const displayChannelNames = channelNames || ["..."];
    const displayChannel = this.state.currentChannel || "...";

    return (
      <div className="pushbot-recent">
        <h3>Recent Chatter</h3>
        <form className="pushbot-recent-form form-inline">
          <label className="mr-md-3" htmlFor="pushbot-recent-channel">
            Channel
          </label>
          <div className="input-group">
            <select
              className="pushbot-recent-channel form-control input-group-prepend"
              id="pushbot-recent-channel"
              value={displayChannel}
              disabled={!channelNames}
              onChange={this.didChangeChannel}
            >
              {displayChannelNames.map((name) => {
                return (
                  <option key={name} value={name}>
                    {name}
                  </option>
                );
              })}
            </select>
            <button
              className="btn btn-secondary pushbot-recent-refresh"
              onClick={this.refresh}
            >
              <i className="fas fa-sync" aria-hidden /> Refresh
            </button>
          </div>
        </form>
        <History lines={history} selection={this.state.selection} />
        <ActionBar
          environment={this.state.environment}
          channel={this.state.currentChannel || ""}
          selection={this.state.selection}
        />
      </div>
    );
  }

  didChangeChannel = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.history = null;
    this.state.selection.clear();
    this.setState({currentChannel: event.target.value});
  };

  refresh = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    this.setState({environment: getEnvironment()});
  };
}
