import React, {Component} from "react";
import {QueryRenderer, Environment} from "react-relay";
import {graphql} from "babel-plugin-relay/macro";

import {Quote} from "./Quote";
import {getEnvironment} from "../common/Transport";
import {QueryMode} from "./queryMode";
import {QuotesPageQuery, QuotesPageResult, IQuotes} from "./queryTypes";

interface QuotePageProps {
  query: string;
  people: string[];
  mode: QueryMode;
}

export class QuotePage extends Component<QuotePageProps> {
  private environment: Environment;
  private lastTotal: number | null;
  private lastResults: IQuotes | null;

  constructor(props: QuotePageProps) {
    super(props);
    this.environment = getEnvironment();
    this.lastTotal = null;
    this.lastResults = null;
  }

  render() {
    const query = graphql`
      query QuotesPageQuery($c: Criteria!) {
        documents(set: "quote") {
          all(criteria: $c, first: 20) {
            edges {
              node {
                id
                text
              }
            }

            pageInfo {
              count
              hasNextPage
            }
          }
        }
      }
    `;

    const criteria: any = {query: this.props.query};
    this.props.mode.when({
      by: () => {
        criteria.speakers = this.props.people;
      },
      about: () => {
        criteria.mentions = this.props.people;
      },
    });

    const variables = {
      c: criteria,
    };

    return (
      <QueryRenderer<QuotesPageQuery>
        environment={this.environment}
        query={query}
        variables={variables}
        render={this.renderResult}
      />
    );
  }

  renderResult = ({error, props}: QuotesPageResult) => {
    if (error) {
      return <div>{error.message}</div>;
    }

    if (!props && !this.lastResults) {
      return (
        <div className="pushbot-loading">
          <i className="fas fa-circle-notch fa-spin" aria-hidden="true" />
          performing query
        </div>
      );
    } else if (!props && this.lastResults && this.lastTotal) {
      return this.renderDocuments(this.lastTotal, this.lastResults);
    } else if (props) {
      this.lastTotal = props.documents!.all.pageInfo.count;
      this.lastResults = props.documents!.all.edges;

      return this.renderDocuments(this.lastTotal, this.lastResults);
    }
  };

  renderDocuments(total: number, documents: IQuotes) {
    const quotes = documents.map(document => {
      return <Quote key={document.node.id!} text={document.node.text} />;
    });

    const more = documents.length < total ? "the first of" : "";
    const plural = total === 1 ? `matching quote` : `matching quotes`;

    return (
      <div className="pushbot-results card border-0">
        <div className="card-body">
          <p>
            Showing {more} <strong>{total}</strong> {plural}.
          </p>
        </div>
        {quotes}
      </div>
    );
  }
}
