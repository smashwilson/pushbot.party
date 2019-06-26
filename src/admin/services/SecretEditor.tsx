import React, {useState, useRef, useEffect} from "react";

import {ToggleableInput} from "../../common/ToggleableInput";

interface ExistingSecretProps {
  name: string;
  onDelete: () => any;
}

export function ExistingSecretEditor(props: ExistingSecretProps) {
  return (
    <div className="form-row">
      <div className="col-sm-2">
        <label className="text-monospace text-success">
          <i className="fas fa-lock d-inline mr-2" />
          {props.name}
        </label>
      </div>
      <div className="col-sm-8" />
      <div
        className="col-sm-2 d-flex justify-content-end"
        onClick={props.onDelete}
      >
        <button className="btn btn-outline-danger">
          <i className="far fa-trash-alt text-danger" />
        </button>
      </div>
    </div>
  );
}

interface AddSecretProps {
  availableSecrets: string[];
  onAddExisting: (name: string) => any;
  onCreateNew: (name: string, value: string) => any;
}

type DisplayMode = "collapsed" | "existing" | "create";

export function NewSecretEditor(props: AddSecretProps) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>("collapsed");
  const [currentName, setName] = useState("");
  const [currentValue, setValue] = useState("");

  const canAdd = currentName.length > 0;
  const canCreate = currentName.length > 0 && currentValue.length > 0;
  const nameFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (displayMode === "create" && nameFieldRef.current) {
      nameFieldRef.current.focus();
    }
  }, [displayMode]);

  if (displayMode === "collapsed") {
    return (
      <div className="form-row">
        <div className="col-sm-2">
          <button
            className="btn btn-outline-info"
            onClick={evt => {
              evt.preventDefault();
              setDisplayMode("existing");
            }}
          >
            <i className="far fa-plus-square" />
          </button>
        </div>
      </div>
    );
  }

  if (displayMode === "existing") {
    return (
      <div className="form-row">
        <div className="col-sm-10 input-group">
          <div className="input-group-prepend d-flex align-items-center">
            <i className="fas fa-lock-open text-success d-inline mr-2" />
          </div>
          <select
            className="form-control text-success"
            value={currentName}
            onChange={evt => setName(evt.target.value)}
            required={true}
          >
            <option value="">Choose an existing secret</option>
            {props.availableSecrets.map(secretName => (
              <option key={`secret-${secretName}`} value={secretName}>
                {secretName}
              </option>
            ))}
          </select>
        </div>
        <div className="col-sm-2 d-flex justify-content-end">
          <div className="btn-group">
            <button
              className="btn btn-outline-success"
              disabled={!canAdd}
              onClick={evt => {
                evt.preventDefault();
                props.onAddExisting(currentName.toLocaleUpperCase());
                setName("");
                setValue("");
                setDisplayMode("collapsed");
              }}
            >
              <i className="fas fa-plus" />
            </button>
            <button
              className="btn btn-outline-info"
              onClick={evt => {
                evt.preventDefault();
                setName("");
                setValue("");
                setDisplayMode("create");
              }}
            >
              <i className="fas fa-pencil-alt" />
            </button>
            <button
              className="btn btn-outline-info"
              onClick={evt => {
                evt.preventDefault();
                setDisplayMode("collapsed");
              }}
            >
              <i className="far fa-minus-square" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-row">
      <div className="col-sm-2">
        <div className="input-group">
          <div className="input-group-prepend d-flex align-items-center">
            <i className="fas fa-lock-open text-success d-inline mr-2" />
          </div>
          <input
            ref={nameFieldRef}
            type="text"
            className="form-control text-monospace border-success d-inline"
            value={currentName}
            onChange={evt => setName(evt.target.value)}
          />
        </div>
      </div>
      <div className="col-sm-8">
        <ToggleableInput
          controlClassName="text-monospace border-success"
          value={currentValue}
          onChange={setValue}
        />
      </div>
      <div className="col-sm-2 d-flex justify-content-end">
        <div className="btn-group">
          <button
            className="btn btn-outline-success"
            disabled={!canCreate}
            onClick={evt => {
              evt.preventDefault();
              props.onCreateNew(currentName.toLocaleUpperCase(), currentValue);
              setName("");
              setValue("");
              setDisplayMode("collapsed");
            }}
          >
            <i className="fas fa-plus" />
          </button>
          <button
            className="btn btn-outline-info"
            onClick={evt => {
              evt.preventDefault();
              setName("");
              setValue("");
              setDisplayMode("existing");
            }}
          >
            <i className="fas fa-list" />
          </button>
          <button
            className="btn btn-outline-info"
            onClick={evt => {
              evt.preventDefault();
              setDisplayMode("collapsed");
            }}
          >
            <i className="far fa-minus-square" />
          </button>
        </div>
      </div>
    </div>
  );
}
