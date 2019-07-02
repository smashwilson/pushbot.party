import React from "react";
import {createPaginationContainer} from "react-relay";
import {graphql} from "babel-plugin-relay/macro";

import {MatchingMemoryPageRem} from "./memoryTypes";

interface Props {
  relay: {
    hasMore(): boolean;
    isLoading(): boolean;
    loadMore(): any;
  };
  rem: MatchingMemoryPageRem;
}

function MemoryPageView(props: Props) {
  function loadNextPage() {
    if (props.relay.hasMore() && !props.relay.isLoading()) {
      return;
    }
  }

  const pageSize = props.rem.search.edges.length;
  const count = props.rem.search.pageInfo.count;

  return (
    <>
      <p className="my-2">
        Showing {pageSize} result{pageSize === 1 ? "" : "s"}
        {count > pageSize ? `out of ${count}` : ""}.
      </p>
      <ul className="list-group">
        {props.rem.search.edges.map(edge => (
          <li key={edge.cursor} className="list-group-item">
            {edge.node.key}
          </li>
        ))}
      </ul>
      <div className="my-2">
        {props.relay.hasMore() && (
          <button className="btn btn-info" onClick={loadNextPage}>
            Next page
          </button>
        )}
      </div>
    </>
  );
}

export const MatchingMemoryPage = createPaginationContainer(
  MemoryPageView,
  {
    rem: graphql`
      fragment MatchingMemoryPage_rem on Rem
        @argumentDefinitions(
          pattern: {type: "String!"}
          count: {type: "Int!"}
          cursor: {type: "String"}
        ) {
        search(query: $pattern, first: $count, after: $cursor)
          @connection(key: "MatchingMemoryPage_search") {
          pageInfo {
            count
            hasPreviousPage
            hasNextPage
          }

          edges {
            cursor
            node {
              key
            }
          }
        }
      }
    `,
  },
  {
    direction: "forward",
    getConnectionFromProps(props) {
      return props.rem && props.rem.search;
    },
    getVariables(_props, {count, cursor}, fragmentVariables) {
      return {
        pattern: fragmentVariables.pattern,
        count,
        cursor,
      };
    },
    query: graphql`
      query MatchingMemoryPageQuery(
        $pattern: String!
        $count: Int!
        $cursor: String
      ) {
        rem {
          ...MatchingMemoryPage_rem
            @arguments(pattern: $pattern, count: $count, cursor: $cursor)
        }
      }
    `,
  }
);
