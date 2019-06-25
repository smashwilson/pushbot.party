import React, {Component} from "react";
import CopyToClipboard from "react-copy-to-clipboard";

interface FeedFormProps {
  ready: boolean;
  feedURL: string;
}

interface FeedFormState {
  copied: boolean;
}

export class FeedForm extends Component<FeedFormProps, FeedFormState> {
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
