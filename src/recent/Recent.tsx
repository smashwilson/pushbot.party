import React, {Component} from "react";
import {QueryRenderer, commitMutation} from "react-relay";
import {Environment} from "relay-runtime";
import {graphql} from "babel-plugin-relay/macro";
import moment from "moment";

import {getEnvironment, QueryResult} from "../common/Transport";
import {Role} from "../common/Role";

import {RecentChannelQuery} from "../__generated__/RecentChannelQuery.graphql";
import {RecentHistoryQuery} from "../__generated__/RecentHistoryQuery.graphql";

import "./Recent.css";

type ILine = NonNullable<
  RecentHistoryQuery["response"]["cache"]["linesForChannel"]
> extends ReadonlyArray<infer E>
  ? E
  : void;

const ALL = Symbol("all");

type Change = ILine | typeof ALL;

interface Disposable {
  dispose(): void;
}

class Selection {
  public isSelecting: boolean;
  private ids: Set<string>;
  private subs: ((arg: Change) => any)[];

  constructor() {
    this.ids = new Set();
    this.isSelecting = false;
    this.subs = [];
  }

  onDidChange(cb: (arg: Change) => any): Disposable {
    this.subs.push(cb);
    return {
      dispose: () => {
        const index = this.subs.indexOf(cb);
        this.subs.splice(index, 1);
      },
    };
  }

  didChange(payload: Change) {
    for (const sub of this.subs) {
      sub(payload);
    }
  }

  isSelected(line: ILine): boolean {
    return this.ids.has(line.id!);
  }

  select(line: ILine): boolean {
    const wasSelected = this.ids.has(line.id!);
    this.ids.add(line.id!);
    if (!wasSelected) this.didChange(line);
    return !wasSelected;
  }

  startSelecting() {
    this.isSelecting = true;
  }

  stopSelecting() {
    this.isSelecting = false;
  }

  toggle(line: ILine) {
    if (!this.ids.delete(line.id!)) {
      this.ids.add(line.id!);
    }
    this.didChange(line);
  }

  clear() {
    this.ids.clear();
    this.didChange(ALL);
  }

  getLineIDs(): string[] {
    return Array.from(this.ids);
  }

  isEmpty(): boolean {
    return this.ids.size === 0;
  }

  describe(): string {
    if (this.ids.size === 0) {
      return "nothing selected";
    } else if (this.ids.size === 1) {
      return "1 line selected";
    } else {
      return `${this.ids.size} lines selected`;
    }
  }
}

interface LineProps {
  previous?: ILine;
  line: ILine;
  selection: Selection;
}

class Line extends Component<LineProps> {
  private sub?: Disposable;

  componentDidMount() {
    this.sub = this.props.selection.onDidChange(kind => {
      if (kind === ALL) this.forceUpdate();
    });
  }

  componentWillUnmount() {
    this.sub && this.sub.dispose();
  }

  render() {
    const {line, previous} = this.props;
    const ts = moment(parseInt(line.timestamp));
    const sameSpeaker = previous && previous.speaker!.id === line.speaker!.id;

    const lineClasses = ["pushbot-line"];
    if (this.props.selection.isSelected(line))
      lineClasses.push("pushbot-line-selected");

    let speakerBanner = null;
    if (!sameSpeaker) {
      speakerBanner = (
        <div className="pushbot-speaker-banner">
          <span className="pushbot-line-avatar">
            <img src={line.speaker!.avatar!.image32!} alt="" />
          </span>
          <span className="pushbot-line-name">{line.speaker!.name}</span>
        </div>
      );
    }

    return (
      <div
        className={lineClasses.join(" ")}
        onMouseDown={this.didMouseDown}
        onMouseMove={this.didMouseMove}
      >
        {speakerBanner}
        <span className="pushbot-line-timestamp">{ts.format("h:mm:ss")}</span>
        <span className="pushbot-line-text">{line.text}</span>
      </div>
    );
  }

  didMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    event.preventDefault();
    this.props.selection.toggle(this.props.line);
    this.props.selection.startSelecting();
    this.forceUpdate();
  };

  didMouseMove = (event: React.MouseEvent) => {
    if (!this.props.selection.isSelecting) return;

    event.preventDefault();
    if (this.props.selection.select(this.props.line)) {
      this.forceUpdate();
    }
  };
}

interface HistoryProps {
  lines: ReadonlyArray<ILine> | null;
  selection: Selection;
}

class History extends Component<HistoryProps> {
  private bottom?: HTMLElement | null;

  componentDidMount() {
    window.addEventListener("mouseup", this.didMouseUp);

    this.bottom && this.bottom.scrollIntoView();
  }

  componentDidUpdate() {
    this.bottom && this.bottom.scrollIntoView();
  }

  componentWillUnmount() {
    window.removeEventListener("mouseup", this.didMouseUp);
  }

  render() {
    if (this.props.lines === null) {
      return this.renderLoading();
    } else {
      return this.renderLines();
    }
  }

  renderLoading() {
    return (
      <div className="pushbot-history border pushbot-loading">
        <i className="fas fa-circle-notch fa-spin" aria-hidden="true" />
        loading
      </div>
    );
  }

  renderLines() {
    return (
      <div
        className="pushbot-history border pushbot-history-loaded"
        onMouseOut={this.didMouseOut}
      >
        {this.props.lines!.map((line, i) => {
          return (
            <Line
              key={line.id!}
              line={line}
              previous={this.props.lines![i - 1]}
              selection={this.props.selection}
            />
          );
        })}
        <div
          ref={element => {
            this.bottom = element;
          }}
        />
      </div>
    );
  }

  didMouseUp = () => {
    this.props.selection.stopSelecting();
  };

  didMouseOut = () => {
    this.props.selection.stopSelecting();
  };
}

interface ActionBarProps {
  environment: Environment;
  channel: string;
  selection: Selection;
}

class ActionBar extends Component<ActionBarProps> {
  private sub?: Disposable;
  private didSubmitQuote: () => void;
  private didSubmitLim: () => void;

  constructor(props: ActionBarProps) {
    super(props);

    this.didSubmitQuote = this.submit.bind(this, "quote");
    this.didSubmitLim = this.submit.bind(this, "lim");
  }

  componentDidMount() {
    this.sub = this.props.selection.onDidChange(() => this.forceUpdate());
  }

  componentWillUnmount() {
    this.sub && this.sub.dispose();
  }

  render() {
    const textClassNames = ["text-muted"];
    let clearBtn = null;
    let disable = true;
    if (this.props.selection.isEmpty()) {
      textClassNames.push("pushbot-empty");
    } else {
      disable = false;
      clearBtn = (
        <button className="btn btn-link" onClick={this.didClear}>
          clear
        </button>
      );
    }

    return (
      <div className="pushbot-recent-actions">
        <p className={textClassNames.join(" ")}>
          {this.props.selection.describe()}
          {clearBtn}
        </p>
        <div className="btn-group pushbot-recent-actions">
          <Role name="quote pontiff">
            <button
              className="btn btn-primary"
              disabled={disable}
              onClick={this.didSubmitQuote}
            >
              Quote
            </button>
          </Role>
          <Role name="poet laureate">
            <button
              className="btn btn-primary"
              disabled={disable}
              onClick={this.didSubmitLim}
            >
              Limerick
            </button>
          </Role>
        </div>
      </div>
    );
  }

  didClear = () => {
    this.props.selection.clear();
  };

  submit(set: string) {
    if (!this.props.channel) return;

    const mutation = graphql`
      mutation RecentSubmitMutation(
        $set: String!
        $channel: String!
        $lines: [ID!]!
      ) {
        createDocument(set: $set, channel: $channel, lines: $lines) {
          id
        }
      }
    `;

    const variables = {
      set,
      channel: this.props.channel,
      lines: this.props.selection.getLineIDs(),
    };

    commitMutation(this.props.environment, {
      mutation,
      variables,
      onCompleted: () => this.props.selection.clear(),
    });
  }
}

interface RecentState {
  environment: Environment;
  currentChannel: string | null;
  selection: Selection;
}

export class Recent extends Component<{}, RecentState> {
  private knownChannels: ReadonlyArray<string> | null;
  private history: ReadonlyArray<ILine> | null;

  constructor() {
    super({});

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

  renderChannelResult = ({error, props}: QueryResult<RecentChannelQuery>) => {
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

  renderHistoryResult = ({error, props}: QueryResult<RecentHistoryQuery>) => {
    if (error) {
      return this.renderError(error);
    }

    const channelNames = props ? props.cache.knownChannels : this.knownChannels;
    const history = props ? props.cache.linesForChannel : this.history;

    return this.renderCurrent(channelNames, history);
  };

  renderCurrent(
    channelNames: ReadonlyArray<string> | null,
    history: ReadonlyArray<ILine> | null
  ) {
    if (channelNames) {
      if (!this.state.currentChannel && channelNames.length > 0) {
        setTimeout(() => this.setState({currentChannel: channelNames[0]}), 0);
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
              {displayChannelNames.map(name => {
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
