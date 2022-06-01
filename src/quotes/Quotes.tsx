import React, {Component} from "react";

import {QueryMode, CONTAINING, BY, ABOUT, modes} from "./queryMode";
import {RandomQuote} from "./RandomQuote";
import {QuotePage} from "./QuotePage";

import "./Quotes.css";

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
      .map((person) => person.replace(/^@/, ""))
      .map((person) => person.trim())
      .filter((person) => person.length > 0);

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
    const mode = modes.find((mode) => mode.label === event.target.value);
    this.writeSearch({mode});
  };

  didChangeQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.writeSearch({query: event.target.value});
  };

  didChangePeople = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.writeSearch({people: event.target.value});
  };
}
