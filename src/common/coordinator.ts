import React from "react";
import {createNetworkError} from "./errors";

const COORDINATOR_URL = `${process.env.REACT_APP_AZ_COORDINATOR_URL}`;

export interface IContainer {
  name?: string;
  image_name: string;
  image_tag: string;
}

export interface IEnvMap {
  [varName: string]: string;
}

export interface IPortMap {
  [hostPort: string]: number;
}

export interface IVolumeMap {
  [hostPath: string]: string;
}

interface IDesiredUnitCommon {
  type: "simple" | "oneshot" | "timer" | "self";
  secrets: string[];
  env: IEnvMap;
  ports: IPortMap;
  volumes: IVolumeMap;
  container?: IContainer;
  calendar?: string;
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
    return this.requestJSON<IDesiredState>("GET", "/desired");
  }

  async createDesiredUnit(unit: IDesiredUnitCreate): Promise<IDesiredUnit> {
    return this.requestJSON<IDesiredUnit>("POST", "/desired", unit);
  }

  async updateDesiredUnit(
    id: number,
    unit: IDesiredUnitUpdate
  ): Promise<IDesiredUnit> {
    return this.requestJSON<IDesiredUnit>(
      "PUT",
      `/desired/${encodeURIComponent(id.toString())}`,
      unit
    );
  }

  async deleteDesiredUnit(id: number): Promise<void> {
    await this.request(
      "DELETE",
      `/desired/${encodeURIComponent(id.toString())}`
    );
  }

  async getActualUnits(): Promise<IActualState> {
    return this.requestJSON<IActualState>("GET", "/actual");
  }

  async getSecrets(): Promise<ISecrets> {
    return this.requestJSON<ISecrets>("GET", "/secrets");
  }

  async createSecrets(secrets: ISecretsCreate): Promise<void> {
    await this.request("POST", "/secrets", secrets);
  }

  async deleteSecrets(secretNames: ISecretsDelete): Promise<void> {
    await this.request("DELETE", "/secrets", secretNames);
  }

  async getDiff(): Promise<IDelta> {
    return this.requestJSON<IDelta>("GET", "/diff");
  }

  async getSync(): Promise<ISync> {
    return this.requestJSON<ISync>("GET", "/sync");
  }

  async createSync(): Promise<void> {
    await this.request("POST", "/sync");
  }

  isPresent(): boolean {
    return true;
  }

  protected async request(
    method: string,
    subPath: string,
    payload?: any
  ): Promise<Response> {
    const url = `${COORDINATOR_URL}${subPath}`;
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
    return response;
  }

  protected async requestJSON<R>(
    method: string,
    subPath: string,
    payload?: any
  ): Promise<R> {
    const response = await this.request(method, subPath, payload);
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
