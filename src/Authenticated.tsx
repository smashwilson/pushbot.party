import React from "react";
import {Route} from "react-router-dom";

import {SideNav} from "./SideNav";
import {Dashboard} from "./Dashboard";
import {People} from "./People";
import {Profile} from "./Profile";
import {Quotes} from "./Quotes";
import {Events} from "./Events";
import {Recent} from "./Recent";
import {UserContext, IUser} from "./Role";

interface AuthenticatedProps {
  user: IUser;
}

export const Authenticated = (props: AuthenticatedProps) => (
  <UserContext.Provider value={props.user}>
    <div className="row">
      <div className="col-md-2">
        <SideNav />
      </div>
      <div className="col-md-8">
        <Route path="/" component={Dashboard} exact />
        <Route path="/people" component={People} exact />
        <Route path="/people/:name" component={Profile} />
        <Route path="/quotes" component={Quotes} />
        <Route path="/events" component={Events} />
        <Route path="/recent" component={Recent} />
      </div>
    </div>
  </UserContext.Provider>
);
