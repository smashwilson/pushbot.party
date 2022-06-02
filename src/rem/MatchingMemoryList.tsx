import React, {useContext} from "react";
import {QueryRenderer} from "react-relay";
import {graphql} from "babel-plugin-relay/macro";

import {getEnvironment, QueryResult} from "../common/Transport";
import {NotificationContext} from "../common/Notifications";
import {Loading} from "../common/Loading";
import {MatchingMemoryListQuery} from "../__generated__/MatchingMemoryListQuery.graphql";
import {MatchingMemoryPage} from "./MatchingMemoryPage";

type Result = QueryResult<MatchingMemoryListQuery>;

interface Props {
  query: string;
}

export function MatchingMemoryList(props: Props) {
  const env = getEnvironment();

  const query = graphql`
    query MatchingMemoryListQuery($pattern: String!) {
      rem {
        ...MatchingMemoryPage_rem @arguments(pattern: $pattern, count: 10)
      }
    }
  `;

  const variables = {
    pattern: props.query,
  };

  return (
    <QueryRenderer<MatchingMemoryListQuery>
      environment={env}
      query={query}
      variables={variables}
      render={(results) => <MatchingMemoryResults {...results} />}
    />
  );
}

function MatchingMemoryResults(results: Result) {
  const hub = useContext(NotificationContext);

  if (results.error) {
    hub.addError(results.error);
    return <div className="alert alert-danger">Unable to perform query.</div>;
  }

  if (!results.props) {
    return <Loading />;
  }

  return <MatchingMemoryPage rem={results.props.rem} />;
}
