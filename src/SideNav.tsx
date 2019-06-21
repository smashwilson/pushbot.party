import React from 'react'
import {Link, Route} from 'react-router-dom'

interface PillProps {
  to: string,
  exact: boolean;
  children: string;
}

const Pill = (props: PillProps) => {
  return (
    <Route path={props.to} exact={props.exact} children={props => {
      const klass = props.match ? 'active' : ''

      return (
        <li role='presentation' className={klass}>
          <Link to={props.to}>{props.children}</Link>
        </li>
      )
    }} />
  )
}

export const SideNav = () => (
  <ul className='nav nav-pills nav-stacked'>
    <Pill to='/' exact>dashboard</Pill>
    <Pill to='/people'>dramatis personae</Pill>
    <Pill to='/recent'>recent chatter</Pill>
    <hr />
    <Pill to='/quotes'>quotes</Pill>
    <Pill to='/events'>events</Pill>
  </ul>
)
