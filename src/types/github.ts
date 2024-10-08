// Generated

export interface GithubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: null | string;
  [property: string]: any;
}

export type GithubEmails = GithubEmail[];

export interface GithubUser {
  avatar_url: string;
  bio: null | string;
  blog: null | string;
  business_plus?: boolean;
  collaborators?: number;
  company: null | string;
  created_at: Date;
  disk_usage?: number;
  email: null | string;
  events_url: string;
  followers: number;
  followers_url: string;
  following: number;
  following_url: string;
  gists_url: string;
  gravatar_id: null | string;
  hireable: boolean | null;
  html_url: string;
  id: number;
  ldap_dn?: string;
  location: null | string;
  login: string;
  name: null | string;
  node_id: string;
  notification_email?: null | string;
  organizations_url: string;
  owned_private_repos?: number;
  plan?: Plan;
  private_gists?: number;
  public_gists: number;
  public_repos: number;
  received_events_url: string;
  repos_url: string;
  site_admin: boolean;
  starred_url: string;
  subscriptions_url: string;
  suspended_at?: Date | null;
  total_private_repos?: number;
  twitter_username?: null | string;
  two_factor_authentication?: boolean;
  type: string;
  updated_at: Date;
  url: string;
  [property: string]: any;
}

export interface Plan {
  collaborators: number;
  name: string;
  private_repos: number;
  space: number;
  [property: string]: any;
}
