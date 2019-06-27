import React, {useState, useContext, useEffect} from "react";
import cx from "classnames";

export type Severity = "info" | "success" | "danger";

interface Notification {
  id: number;
  severity: Severity;
  body: React.ReactNode;
}

class NotificationHub {
  private nextID: number;
  private notifications: Notification[];
  private subscribers: ((ns: Notification[]) => any)[];

  constructor() {
    this.nextID = 0;
    this.notifications = [];
    this.subscribers = [];
  }

  addInfo(body: React.ReactNode) {
    this.add("info", body);
  }

  addSuccess(body: React.ReactNode) {
    this.add("info", body);
  }

  addDanger(body: React.ReactNode) {
    this.add("info", body);
  }

  onNotification(callback: (ns: Notification[]) => any) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub === callback);
    };
  }

  protected add(severity: Severity, body: React.ReactNode) {
    const id = this.nextID;
    this.nextID++;
    this.notifications.push({id, severity, body});
  }
}

class DevNull extends NotificationHub {
  protected add() {}

  onNotification() {
    return () => {};
  }
}

const nullHub = new DevNull();

const NotificationContext = React.createContext<NotificationHub>(nullHub);

export function NotificationsProvider(props: {children: React.ReactNode}) {
  const [hub] = useState(() => new NotificationHub());

  return (
    <NotificationContext.Provider value={hub}>
      {props.children}
    </NotificationContext.Provider>
  );
}

export function NotificationsView() {
  const hub = useContext(NotificationContext);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => hub.onNotification(setNotifications), [hub]);

  return (
    <>
      {notifications.map(n => (
        <div key={n.id} className={cx("alert", `alert-${n.severity}`)}>
          {n.body}
          <button className="btn btn-link">
            <i className="fa far fa-window-close" />
          </button>
        </div>
      ))}
    </>
  );
}
