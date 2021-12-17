export class TeamInputs {
  members: string[]
  teams: string[]
  requestor: string
  pat_token: string
  constructor(
    _members: string[],
    _teams: string[],
    _requestor: string,
    _pat_token: string
  ) {
    this.members = _members
    this.teams = _teams
    this.requestor = _requestor
    this.pat_token = _pat_token
  }
}
export class CollaboratorInputs {
  permission: 'admin' | 'read' | 'write' | 'maintain' | 'triage' | undefined
  collaborators: string[]
  repos: string[]
  requestor: string
  pat_token: string
  constructor(
    _permission: 'admin' | 'read' | 'write' | 'maintain' | 'triage' | undefined,
    _collaborators: string[],
    _repos: string[],
    _requestor: string,
    _pat_token: string
  ) {
    this.permission = _permission
    this.repos = _repos
    this.collaborators = _collaborators
    this.requestor = _requestor
    this.pat_token = _pat_token
  }
}
