import React, {useState, useRef, useEffect} from "react";
import cx from "classnames";

interface ToggleableInputProps {
  value: string;
  onChange: (newValue: string) => any;
  controlID?: string;
  controlClassName?: string;
}

export function ToggleableInput(props: ToggleableInputProps) {
  const [multiLineMode, setMode] = useState<boolean>(
    props.value.indexOf("\n") !== -1
  );
  const controlRef = useRef<HTMLTextAreaElement & HTMLInputElement>(null);

  const cn = cx("form-control", props.controlClassName);

  useEffect(() => {
    if (controlRef.current) {
      controlRef.current.focus();
    }
  }, [multiLineMode]);

  if (multiLineMode) {
    return (
      <div className="input-group">
        <textarea
          ref={controlRef}
          id={props.controlID}
          className={cn}
          onChange={evt => {
            evt.preventDefault();
            props.onChange(evt.target.value);
          }}
        >
          {props.value}
        </textarea>
        <div className="input-group-append">
          <button
            className="btn btn-light"
            onClick={evt => {
              evt.preventDefault();
              setMode(false);
            }}
          >
            <i className="fas fa-compress" />
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="input-group">
        <input
          ref={controlRef}
          id={props.controlID}
          type="text"
          className={cn}
          onChange={evt => {
            evt.preventDefault();
            props.onChange(evt.target.value);
          }}
          value={props.value}
        />
        <div className="input-group-append">
          <button
            className="btn btn-light"
            onClick={evt => {
              evt.preventDefault();
              setMode(true);
            }}
          >
            <i className="fas fa-expand" />
          </button>
        </div>
      </div>
    );
  }
}
