import React, {Component} from "react";
import {QueryRenderer, Environment} from "react-relay";
import {graphql} from "babel-plugin-relay/macro";

import {getEnvironment} from "../common/Transport";
import {QuotesRandomQuery, QuotesRandomResult} from "./queryTypes";
import {Quote} from "./Quote";

interface RandomQuoteState {
  environment: Environment;
}

export class RandomQuote extends Component<{}, RandomQuoteState> {
  private lastQuote: string | null;

  constructor() {
    super({});

    this.lastQuote = null;
    this.state = {
      environment: getEnvironment(),
    };
  }

  render() {
    const query = graphql`
      query QuotesRandomQuery {
        documents(set: "quote") {
          random(criteria: {}) {
            found
            text
          }
        }
      }
    `;

    return (
      <QueryRenderer<QuotesRandomQuery>
        environment={this.state.environment}
        query={query}
        variables={{}}
        render={this.renderResult}
      />
    );
  }

  renderResult = ({error, props}: QuotesRandomResult) => {
    if (error) {
      return <div>{error.message}</div>;
    }

    const quoteText = props ? props.documents!.random.text : this.lastQuote;

    if (!quoteText) {
      return null;
    }

    this.lastQuote = quoteText;

    return (
      <div className="pushbot-random-quote card border-0">
        <div className="card-body">
          <p className="card-text">
            Type a search term above to find specific quotes. In the meantime,
            enjoy this random quote.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={this.another}
          >
            <i className="fas fa-sync" aria-hidden="true" />
            Another
          </button>
        </div>
        <Quote text={quoteText} />
      </div>
    );
  };

  another = () => {
    this.setState({
      environment: getEnvironment(),
    });
  };
}
