import React, {Component} from "react";
import moment from "moment";

import {ILine, IDisposable, ALL} from "./queryTypes";
import {Selection} from "./selection";

interface LineProps {
  previous?: ILine;
  line: ILine;
  selection: Selection;
}

export class Line extends Component<LineProps> {
  private sub?: IDisposable;

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
