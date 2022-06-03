import React from "react";
import {Link} from "react-router-dom";

import {IDesiredState} from "../../common/coordinator";
import {CoordinatorContainer} from "../../common/CoordinatorContainer";
import {Loading} from "../../common/Loading";
import {ServiceDisplay} from "./ServiceDisplay";

import "./Services.css";

const nullDesiredState: IDesiredState = {units: []};

export function Services() {
  return (
    <>
      <h3>services</h3>
      <CoordinatorContainer<IDesiredState>
        getter={c => c.getDesiredState()}
        nullValue={nullDesiredState}
      >
        {(state, isLoading, refresh) => {
          const list = isLoading ? (
            <Loading />
          ) : (
            state.units.map(unit => (
              <ServiceDisplay unit={unit} key={unit.id} />
            ))
          );

          return (
            <>
              <div className="my-3 d-flex justify-content-end">
                <button
                  className="btn btn-secondary"
                  onClick={refresh}
                  disabled={isLoading}
                >
                  <i className="fas fa-sync-alt me-2" />
                  Refresh
                </button>
              </div>
              {list}
              <div className="my-3 d-flex justify-content-end">
                <Link className="btn btn-primary" to="/admin/services/create">
                  <i className="fas fa-plus me-2" />
                  Create
                </Link>
              </div>
            </>
          );
        }}
      </CoordinatorContainer>
    </>
  );
}
