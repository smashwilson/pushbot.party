import React from "react";
import {createNetworkError} from "./errors";

const COORDINATOR_URL = `${process.env.REACT_APP_AZ_COORDINATOR_URL}`;

interface IContainer {
  name?: string;
  image_name: string;
  image_tag: string;
}

interface IEnvMap {
  [varName: string]: string;
}

interface IPortMap {
  [hostPort: string]: number;
}

interface IVolumeMap {
  [hostPath: string]: string;
}

interface IDesiredUnitCommon {
  type: "simple" | "oneshot" | "timer" | "self";
  container?: IContainer;
  secrets: string[];
  env: IEnvMap;
  ports: IPortMap;
  volumes: IVolumeMap;
}

export interface IDesiredUnit extends IDesiredUnitCommon {
  id: number;
  path: string;
}

export interface IDesiredUnitCreate extends IDesiredUnitCommon {
  path: string;
}

export interface IDesiredUnitUpdate extends IDesiredUnitCommon {}

export interface IDesiredState {
  units: IDesiredUnit[];
}

export interface IActualUnit {
  path: string;
}

export interface IActualState {
  units: IActualUnit[];
}

export interface ISecretsCreate {
  [secretName: string]: string;
}

export type ISecretsDelete = string[];

export type ISecrets = string[];

export interface IDelta {
  units_to_add: IDesiredUnit[];
  units_to_change: IDesiredUnit[];
  units_to_restart: IDesiredUnit[];
  units_to_remove: IActualUnit[];
  files_to_write: string[];
}

export interface ISyncReport {
  timestamp: number;
  elapsed: number;
  message: string;
}

export interface ISync {
  in_progress: boolean;
  reports: ISyncReport[];
  errors: string[];
  delta?: IDelta;
}

export class Coordinator {
  constructor(private readonly token: string) {}

  async getDesiredState(): Promise<IDesiredState> {
    return this.request<IDesiredState>("GET", "/desired");
  }

  async createDesiredUnit(unit: IDesiredUnitCreate): Promise<IDesiredUnit> {
    return this.request<IDesiredUnit>("POST", "/desired", unit);
  }

  async updateDesiredUnit(
    id: number,
    unit: IDesiredUnitUpdate
  ): Promise<IDesiredUnit> {
    return this.request<IDesiredUnit>(
      "PUT",
      `/desired/${encodeURIComponent(id.toString())}`,
      unit
    );
  }

  async deleteDesiredUnit(id: number): Promise<void> {
    return this.request<void>(
      "DELETE",
      `/desired/${encodeURIComponent(id.toString())}`
    );
  }

  async getActualUnits(): Promise<IActualState> {
    return this.request<IActualState>("GET", "/actual");
  }

  async getSecrets(): Promise<ISecrets> {
    return this.request<ISecrets>("GET", "/secrets");
  }

  async createSecrets(secrets: ISecretsCreate): Promise<void> {
    return this.request<void>("POST", "/secrets", secrets);
  }

  async deleteSecrets(secretNames: ISecretsDelete): Promise<void> {
    return this.request<void>("DELETE", "/secrets", secretNames);
  }

  async getDiff(): Promise<IDelta> {
    return this.request<IDelta>("GET", "/diff");
  }

  async getSync(): Promise<ISync> {
    return this.request<ISync>("GET", "/sync");
  }

  async createSync(): Promise<void> {
    return this.request<void>("POST", "/sync");
  }

  isPresent(): boolean {
    return true;
  }

  protected async request<R>(
    method: string,
    subPath: string,
    payload?: any
  ): Promise<R> {
    const url = `${COORDINATOR_URL}/${subPath}`;
    const headers: HeadersInit = {
      Authorization: `Basic ${btoa("token:" + this.token)}`,
    };

    const options: RequestInit = {
      method,
      headers,
      credentials: "include",
    };

    if (payload) {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      throw await createNetworkError("Unable to contact coordinator", response);
    }
    return response.json() as any;
  }
}

class NullCoordinator extends Coordinator {
  protected async request(): Promise<any> {
    throw new Error("Coordinator is not available");
  }

  isPresent(): boolean {
    return false;
  }
}

export const nullCoordinator = new NullCoordinator("");

export const CoordinatorContext = React.createContext<Coordinator>(
  nullCoordinator
);
