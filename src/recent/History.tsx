import React, {Component} from "react";

import {ILine} from "./queryTypes";
import {Selection} from "./selection";
import {Line} from "./Line";

interface HistoryProps {
  lines: ReadonlyArray<ILine> | null;
  selection: Selection;
}

export class History extends Component<HistoryProps> {
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
