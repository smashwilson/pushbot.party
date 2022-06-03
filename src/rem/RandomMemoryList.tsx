import React, {useContext} from "react";
import {QueryRenderer} from "react-relay";
import {graphql} from "babel-plugin-relay/macro";
import {Link} from "react-router-dom";

import {getEnvironment} from "../common/Transport";
import {NotificationContext} from "../common/Notifications";
import {Loading} from "../common/Loading";
import {RandomMemoryListQuery, RandomMemoryListResult} from "./memoryTypes";

export function RandomMemoryList() {
  const env = getEnvironment();

  const query = graphql`
    query RandomMemoryListQuery {
      rem {
        search(first: 10, orderField: RANDOM) {
          edges {
            cursor
            node {
              key
            }
          }
        }
      }
    }
  `;

  return (
    <QueryRenderer<RandomMemoryListQuery>
      environment={env}
      query={query}
      variables={{}}
      render={(result) => <RandomMemoryResults {...result} />}
    />
  );
}

function RandomMemoryResults({error, props, retry}: RandomMemoryListResult) {
  const hub = useContext(NotificationContext);

  if (error !== null) {
    hub.addError(error);
    return <div className="alert alert-danger">Unable to perform query.</div>;
  }

  if (props === null) {
    return <Loading />;
  }

  function another() {
    return retry && retry();
  }

  const results = props.rem.search.edges.map((edge) => (
    <li key={edge.cursor} className="list-group-item">
      <Link to={`/rem/${encodeURIComponent(edge.node.key)}`}>
        {edge.node.key}
      </Link>
    </li>
  ));

  return (
    <div className="card card-light">
      <div className="card-body">
        <p className="card-text">
          Type above to search known memory keys. Here's a random sample of
          what's available:
        </p>
        <p className="card-text mt-1 mb-3">
          <button className="btn btn-secondary" onClick={another}>
            <i className="fas fa-sync me-2" aria-hidden="true" />
            Another
          </button>
        </p>
        <ul className="card-text list-group">{results}</ul>
      </div>
    </div>
  );
}
