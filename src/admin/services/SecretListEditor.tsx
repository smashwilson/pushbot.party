import React from "react";

import {ExistingSecretEditor, NewSecretEditor} from "./SecretEditor";

interface SecretListProps {
  secrets: string[];
  availableSecrets: string[];
  onDelete: (name: string) => any;
  onAdd: (name: string) => any;
  onCreate: (name: string, value: string) => any;
}

export function SecretListEditor(props: SecretListProps) {
  const existingSecretEditors = props.secrets.map(name => (
    <ExistingSecretEditor
      key={`existingSecret-${name}`}
      name={name}
      onDelete={() => props.onDelete(name)}
    />
  ));

  return (
    <>
      {existingSecretEditors}
      <NewSecretEditor
        availableSecrets={props.availableSecrets}
        onAddExisting={props.onAdd}
        onCreateNew={props.onCreate}
      />
    </>
  );
}
