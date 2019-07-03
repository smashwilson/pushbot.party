import React, {useContext} from "react";
import {QueryRenderer} from "react-relay";
import {graphql} from "babel-plugin-relay/macro";
import {Link} from "react-router-dom";

import {getEnvironment, QueryResult} from "../common/Transport";
import {NotificationContext} from "../common/Notifications";
import {Loading} from "../common/Loading";
import {RemEntryQuery} from "../__generated__/RemEntryQuery.graphql";

type RemEntryQueryResult = QueryResult<RemEntryQuery>;

interface Props {
  match: {
    params: {
      key: string;
    };
  };
}

export function RemEntry(props: Props) {
  const env = getEnvironment();

  const query = graphql`
    query RemEntryQuery($key: String!) {
      rem {
        get(key: $key) {
          key
          value
        }
      }
    }
  `;

  const variables = {key: decodeURIComponent(props.match.params.key)};

  return (
    <QueryRenderer<RemEntryQuery>
      environment={env}
      query={query}
      variables={variables}
      render={results => <RemEntryWrapper {...results} />}
    />
  );
}

function RemEntryWrapper(results: RemEntryQueryResult) {
  return (
    <>
      <h3>rem</h3>
      <p className="my-2">
        <Link to="/rem">
          <i className="fas fa-angle-double-left mr-2" />
          rem search
        </Link>
      </p>
      <RemEntryResult {...results} />
    </>
  );
}

function RemEntryResult(results: RemEntryQueryResult) {
  const hub = useContext(NotificationContext);

  if (results.error) {
    hub.addError(results.error);
    return <div className="alert alert-danger">Unable to perform query.</div>;
  }

  if (!results.props) {
    return <Loading />;
  }

  const {get} = results.props.rem;
  if (!get) {
    return <div className="alert alert-danger">Key not found.</div>;
  }

  const {key, value} = get;

  if (/^http(?:s)?:\/\//.test(value)) {
    return (
      <div className="container-fluid">
        <h2 className="my-5 text-center">{key}</h2>
        <img
          className="d-block mx-auto"
          style={{maxWidth: "100%"}}
          src={value}
          alt=""
        />
      </div>
    );
  }

  return (
    <div className="row my-5">
      <h2 className="col-3 text-muted text-right">{key}</h2>
      <h2 className="col-9 font-weight-bolder">{value}</h2>
    </div>
  );
}
