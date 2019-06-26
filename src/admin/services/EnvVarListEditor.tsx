import React from "react";

import {IEnvMap} from "../../common/coordinator";
import {ExistingEnvVarEditor, NewEnvVarEditor} from "./EnvVarEditor";

interface EnvVarListEditorProps {
  envVars: IEnvMap;
  onChange: (name: string, value: string) => any;
  onDelete: (name: string) => any;
}

export function EnvVarListEditor(props: EnvVarListEditorProps) {
  const varNames = Object.keys(props.envVars);
  varNames.sort();

  const existingVarEditors = varNames.map(varName => (
    <ExistingEnvVarEditor
      key={`envVarEditor-${varName}`}
      name={varName}
      value={props.envVars[varName]}
      onChange={value => props.onChange(varName, value)}
      onDelete={() => props.onDelete(varName)}
    />
  ));

  return (
    <>
      {existingVarEditors}
      <NewEnvVarEditor onAccept={props.onChange} />
    </>
  );
}
