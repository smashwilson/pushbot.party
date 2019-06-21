import React, {Component} from "react";
import {QueryRenderer, Environment} from "react-relay";
import {graphql} from "babel-plugin-relay/macro";

import {getEnvironment, QueryResult} from "./Transport";
import {QuotesPageQuery} from "./__generated__/QuotesPageQuery.graphql";
import {QuotesRandomQuery} from "./__generated__/QuotesRandomQuery.graphql";

import "./Quotes.css";

interface QueryModeCases<R> {
  containing?(): R;
  by?(): R;
  about?(): R;
  default?(): R;
}

interface QueryMode {
  when<R>(cases: QueryModeCases<R>): R | null;
  label: string;
}

const CONTAINING: QueryMode = {
  when<R>(cases: QueryModeCases<R>): R | null {
    return (cases.containing || cases.default || (() => null))();
  },

  label: "containing",
};

const BY = {
  when<R>(cases: QueryModeCases<R>): R | null {
    return (cases.by || cases.default || (() => null))();
  },

  label: "by",
};

const ABOUT = {
  when<R>(cases: QueryModeCases<R>): R | null {
    return (cases.about || cases.default || (() => null))();
  },

  label: "about",
};

const modes: QueryMode[] = [CONTAINING, BY, ABOUT];

type IQuotes = NonNullable<
  QuotesPageQuery["response"]["documents"]
>["all"]["edges"];

interface QuoteProps {
  text: string;
}

const Quote = (props: QuoteProps) => (
  <blockquote className="pushbot-quote">
    <p>{props.text}</p>
  </blockquote>
);

interface QuotePageProps {
  query: string;
  people: string[];
  mode: QueryMode;
}

class QuotePage extends Component<QuotePageProps> {
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

    const variables: QuotesPageQuery["variables"] = {
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

  renderResult = ({error, props}: QueryResult<QuotesPageQuery>) => {
    if (error) {
      return <div>{error.message}</div>;
    }

    if (!props && !this.lastResults) {
      return (
        <div className="pushbot-loading">
          <i className="fa fa-circle-o-notch fa-spin" aria-hidden="true" />
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
      <div className="pushbot-results">
        <div className="well well-sm">
          <p>
            Showing {more} <strong>{total}</strong> {plural}.
          </p>
        </div>
        {quotes}
      </div>
    );
  }
}

interface RandomQuoteState {
  environment: Environment;
}

class RandomQuote extends Component<{}, RandomQuoteState> {
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

  renderResult = ({error, props}: QueryResult<QuotesRandomQuery>) => {
    if (error) {
      return <div>{error.message}</div>;
    }

    const quoteText = props ? props.documents!.random.text : this.lastQuote;

    if (!quoteText) {
      return null;
    }

    this.lastQuote = quoteText;

    return (
      <div className="pushbot-random-quote">
        <div className="well well-sm">
          <p>
            Type a search term above to find specific quotes. In the meantime,
            enjoy this random quote.
          </p>
          <button type="button" className="btn btn-sm" onClick={this.another}>
            <i className="fa fa-refresh" aria-hidden="true" />
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

interface Search {
  query: string;
  people: string;
  mode: QueryMode;
}

export class Quotes extends Component {
  readSearch(): Search {
    const params = new URLSearchParams(window.location.search);

    let mode = CONTAINING;
    let people = "";
    if (params.has("by")) {
      mode = BY;
      people = params.get("by")!;
    } else if (params.has("about")) {
      mode = ABOUT;
      people = params.get("about")!;
    }

    return {
      query: params.get("q") || "",
      people,
      mode,
    };
  }

  writeSearch(changes: Partial<Search>) {
    const previous = this.readSearch();
    const current = Object.assign(previous, changes);

    const params = new URLSearchParams();

    current.mode.when({
      by: () => params.set("by", current.people),
      about: () => params.set("about", current.people),
    });
    if (current.query.length) {
      params.set("q", current.query);
    }

    const nextSearch = params.toString();
    const nextURL =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      (nextSearch.length > 0 ? "?" + nextSearch : "") +
      window.location.hash;

    if (window.history.replaceState) {
      window.history.replaceState({}, "", nextURL);
    } else {
      window.location.href = nextURL;
    }
    this.forceUpdate();
  }

  render() {
    const search = this.readSearch();
    const showPeople = search.mode.when({
      containing: () => false,
      by: () => true,
      about: () => true,
    });

    return (
      <div>
        <form
          className={`pushbot-quote-form form-inline pushbot-mode-${search.mode.label}`}
        >
          <select
            className="pushbot-quote-mode form-control"
            value={search.mode.label}
            onChange={this.didChangeMode}
          >
            {modes.map((mode, index) => {
              return (
                <option key={index} value={mode.label}>
                  {mode.label}
                </option>
              );
            })}
          </select>
          {showPeople && (
            <input
              type="text"
              className="form-control"
              id="pushbot-quote-people"
              placeholder="fenris, iguanaditty"
              value={search.people}
              onChange={this.didChangePeople}
            />
          )}
          <input
            type="text"
            className="form-control"
            id="pushbot-quote-query"
            placeholder='"query"'
            value={search.query}
            onChange={this.didChangeQuery}
          />
        </form>
        {this.renderResult(search)}
      </div>
    );
  }

  renderResult(search: Search) {
    const people = search.people
      .split(/[,+;]|\s/)
      .map(person => person.replace(/^@/, ""))
      .map(person => person.trim())
      .filter(person => person.length > 0);

    const noQuery = search.mode.when({
      containing: () => search.query.length === 0,
      by: () => people.length === 0,
      about: () => people.length === 0,
    });

    if (noQuery) {
      return <RandomQuote />;
    } else {
      return (
        <QuotePage mode={search.mode} people={people} query={search.query} />
      );
    }
  }

  didChangeMode = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = modes.find(mode => mode.label === event.target.value);
    this.writeSearch({mode});
  };

  didChangeQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.writeSearch({query: event.target.value});
  };

  didChangePeople = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.writeSearch({people: event.target.value});
  };
}
