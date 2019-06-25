import React from "react";
import {Route} from "react-router-dom";

import {SideNav} from "./SideNav";
import {Dashboard} from "./dashboard/Dashboard";
import {People} from "./people/People";
import {Profile} from "./profile/Profile";
import {Quotes} from "./quotes/Quotes";
import {Events} from "./events/Events";
import {Recent} from "./recent/Recent";
import {UserContext, IUser} from "./common/Role";

interface AuthenticatedProps {
  user: IUser;
}

export const Authenticated = (props: AuthenticatedProps) => (
  <UserContext.Provider value={props.user}>
    <div className="row mt-md-5">
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
