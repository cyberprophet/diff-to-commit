export interface CommitMessage {
  type: string;
  scope?: string;
  subject: string;
  bodyBullets: string[];
}
