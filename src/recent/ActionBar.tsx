import React, {Component} from "react";
import {Environment, commitMutation} from "relay-runtime";
import {graphql} from "babel-plugin-relay/macro";

import {IDisposable} from "./queryTypes";
import {Selection} from "./selection";
import {Role} from "../common/Role";

interface ActionBarProps {
  environment: Environment;
  channel: string;
  selection: Selection;
}

export class ActionBar extends Component<ActionBarProps> {
  private sub?: IDisposable;
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
      mutation ActionBarSubmitMutation(
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
