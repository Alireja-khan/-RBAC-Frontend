export type ProjectStatus = "ACTIVE" | "ARCHIVED" | "DELETED";

export interface CreateProjectPayload {
  name: string;
  description: string;
}
