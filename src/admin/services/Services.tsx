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
        {(state, isLoading) => {
          if (isLoading) {
            return <Loading />;
          }

          return (
            <>
              {state.units.map(unit => (
                <ServiceDisplay unit={unit} key={unit.id} />
              ))}
              <div className="my-3">
                <Link className="btn btn-primary" to="/admin/services/create">
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
