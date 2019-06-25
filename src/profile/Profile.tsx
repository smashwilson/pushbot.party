import React, {Component} from "react";
import {QueryRenderer, Environment} from "react-relay";
import {graphql} from "babel-plugin-relay/macro";
import EmojiConverter from "emoji-js";

import {getEnvironment, QueryResult} from "../common/Transport";
import {Chart} from "../common/Chart";
import {ProfileQuery} from "../__generated__/ProfileQuery.graphql";

import "./Profile.css";

interface ProfileProps {
  match: {
    params: {
      name: string;
    };
  };
}

type User = NonNullable<ProfileQuery["response"]["users"]["current"]>;

type EmojiCount = User["topReactionsGiven"] | User["topReactionsReceived"];

export class Profile extends Component<ProfileProps> {
  private environment: Environment;
  private emoji: EmojiConverter;

  constructor(props: ProfileProps) {
    super(props);

    this.environment = getEnvironment();
    this.emoji = new EmojiConverter();

    this.emoji.img_sets.apple.sheet = "/sheet_apple_64.png";
    this.emoji.use_sheet = true;
    this.emoji.include_title = true;
  }

  render() {
    const query = graphql`
      query ProfileQuery($name: String!, $titleCriteria: Criteria!) {
        users {
          current: withName(name: $name) {
            avatar {
              image192
            }

            topReactionsReceived(limit: 10) {
              count
              emoji {
                name
                url
              }
            }

            topReactionsGiven(limit: 10) {
              count
              emoji {
                name
                url
              }
            }
          }
        }

        titles: documents(set: "title") {
          all(first: 100, criteria: $titleCriteria) {
            edges {
              node {
                text
              }
            }
          }
        }

        quotes: documents(set: "quote") {
          rank(speaker: $name)
        }
      }
    `;

    const username = this.props.match.params.name;
    const variables = {
      name: username,
      titleCriteria: {subject: username},
    };

    return (
      <QueryRenderer<ProfileQuery>
        environment={this.environment}
        query={query}
        variables={variables}
        render={this.renderResult}
      />
    );
  }

  renderResult = ({error, props}: QueryResult<ProfileQuery>) => {
    if (error) {
      return <div>{error.message}</div>;
    }

    if (!props) {
      return (
        <div className="pushbot-loading">
          <i className="fas fa-circle-notch fa-spin" aria-hidden="true" />
          sluuuuurp
        </div>
      );
    }

    const user = props.users.current;
    if (!user) {
      return null;
    }

    const avatar = user.avatar.image192 || "";

    return (
      <div className="pushbot-profile row">
        <div className="col-md-6">
          <img
            className="pushbot-profile-avatar img-responsive img-rounded"
            src={avatar}
            alt=""
          />
          {this.renderReactionsReceivedChart(user)}
          {this.renderReactionsGivenChart(user)}
        </div>
        <div className="col-md-6">
          <h1 className="pushbot-profile-username">
            @{this.props.match.params.name}
          </h1>
          {this.renderTitles(props)}
          {this.renderQuoteRank(props)}
        </div>
      </div>
    );
  };

  renderReactionsGivenChart(user: User) {
    return this.renderReactionChart(
      user.topReactionsGiven,
      "Emoji reactions given"
    );
  }

  renderReactionsReceivedChart(user: User) {
    return this.renderReactionChart(
      user.topReactionsReceived,
      "Emoji reactions received"
    );
  }

  renderReactionChart(results: EmojiCount, name: string) {
    const data = {
      labels: results.map(each => {
        if (each.emoji.url) {
          return `<img class="emoji" alt="${each.emoji.name}" src="${each.emoji.url}" title="${each.emoji.name}">`;
        }

        return this.emoji.replace_colons(`:${each.emoji.name}:`);
      }),
      series: [results.map(each => each.count)],
    };

    const options = {
      low: 0,
      axisY: {
        onlyInteger: true,
      },
    };

    return (
      <p className="pushbot-profile-reaction-chart">
        <h4>{name}</h4>
        <Chart data={data} options={options} />
      </p>
    );
  }

  renderTitles(props: NonNullable<QueryResult<ProfileQuery>["props"]>) {
    const edges = props.titles ? props.titles.all.edges : [];
    if (edges.length === 0) {
      return (
        <p className="pushbot-profile-titles-empty">
          No titles yet. Set one with{" "}
          <code>!settitle {this.props.match.params.name}: ...</code>.
        </p>
      );
    }

    return (
      <p className="pushbot-profile-titles">
        {edges.map(t => this.titleFrom(t.node.text))}
      </p>
    );
  }

  renderQuoteRank(props: NonNullable<QueryResult<ProfileQuery>["props"]>) {
    if (!props.quotes) {
      return (
        <p className="pushbot-profile-quoterank">
          You have not yet been immortalized in the quotefile.
        </p>
      );
    }

    const rank = props.quotes.rank;
    return (
      <p className="pushbot-profile-quoterank">
        Rank #{rank} in the quotefile.
      </p>
    );
  }

  titleFrom(title: string) {
    if (/^https?:/.test(title)) {
      return (
        <img
          className="pushbot-profile-title img-responsive"
          alt=""
          src={title}
        />
      );
    }

    return <span className="pushbot-profile-title">{title}</span>;
  }
}
