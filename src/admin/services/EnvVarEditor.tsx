import React, {useState, useRef, useEffect} from "react";

import {ToggleableInput} from "../../common/ToggleableInput";

let envVarCounter = 0;

interface EnvVarEditorProps {
  value: string;
  onChangeValue: (newValue: string) => any;

  renderName: (uniqueID: string) => React.ReactNode;
  renderControls: () => React.ReactNode;
}

function EnvVarEditor(props: EnvVarEditorProps) {
  const uniqueID = `envVarEditor--${envVarCounter}`;
  envVarCounter++;

  return (
    <div className="form-row">
      <div className="col-sm-2">{props.renderName(uniqueID)}</div>
      <div className="col-sm-8">
        <ToggleableInput
          controlID={uniqueID}
          controlClassName="text-monospace"
          value={props.value}
          onChange={props.onChangeValue}
        />
      </div>
      <div className="col-sm-2 d-flex justify-content-end">
        {props.renderControls()}
      </div>
    </div>
  );
}

interface ExistingEnvVarProps {
  name: string;
  value: string;
  onChange: (newValue: string) => any;
  onDelete: () => any;
}

export function ExistingEnvVarEditor(props: ExistingEnvVarProps) {
  return (
    <EnvVarEditor
      value={props.value}
      onChangeValue={props.onChange}
      renderName={uniqueID => (
        <label htmlFor={uniqueID} className="text-monospace">
          {props.name}
        </label>
      )}
      renderControls={() => (
        <button className="btn btn-outline-danger" onClick={props.onDelete}>
          <i className="far fa-trash-alt text-danger" />
        </button>
      )}
    />
  );
}

interface NewEnvVarProps {
  onAccept: (name: string, value: string) => any;
}

export function NewEnvVarEditor(props: NewEnvVarProps) {
  const [expanded, setExpanded] = useState(false);
  const [currentName, setName] = useState("");
  const [currentValue, setValue] = useState("");
  const nameFieldRef = useRef<HTMLInputElement>(null);

  const canAccept = currentName.length > 0;

  useEffect(() => {
    if (expanded && nameFieldRef.current) {
      nameFieldRef.current.focus();
    }
  }, [expanded]);

  if (!expanded) {
    return (
      <div className="form-row">
        <div className="col-sm-2">
          <button
            className="btn btn-outline-info"
            onClick={evt => {
              evt.preventDefault();
              setExpanded(true);
            }}
          >
            <i className="far fa-plus-square" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <EnvVarEditor
      value={currentValue}
      onChangeValue={v => setValue(v)}
      renderName={() => (
        <input
          ref={nameFieldRef}
          type="text"
          className="form-control text-monospace"
          value={currentName}
          onChange={evt => setName(evt.target.value)}
        />
      )}
      renderControls={() => (
        <div className="btn-group">
          <button
            className="btn btn-outline-success"
            disabled={!canAccept}
            onClick={evt => {
              evt.preventDefault();
              props.onAccept(currentName.toLocaleUpperCase(), currentValue);
              setName("");
              setValue("");
              setExpanded(false);
            }}
          >
            <i className="fas fa-plus" />
          </button>
          <button
            className="btn btn-outline-info"
            onClick={evt => {
              evt.preventDefault();
              setExpanded(false);
            }}
          >
            <i className="far fa-minus-square" />
          </button>
        </div>
      )}
    />
  );
}
