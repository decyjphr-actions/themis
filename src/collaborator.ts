import * as core from '@actions/core'
import {GitHub} from '@actions/github/lib/utils'
import {CollaboratorData} from './InputData'
//import {OctokitResponse} from '@octokit/types'

//type OctoClientType = ReturnType<typeof github.getOctokit>
export class Collaborator {
  octokitClient: InstanceType<typeof GitHub>
  org: string
  permission: 'admin' | 'read' | 'write' | 'maintain' | 'triage' | undefined
  collaborators: string[]
  repos: string[]
  requestor: string

  constructor(
    octokitClient: InstanceType<typeof GitHub>,
    org: string,
    permission: 'admin' | 'read' | 'write' | 'maintain' | 'triage' | undefined,
    collaborators: string[],
    repos: string[],
    requestor: string
  ) {
    this.octokitClient = octokitClient
    this.org = org
    this.permission = permission
    this.collaborators = collaborators
    this.repos = repos
    this.requestor = requestor
  }
  private async find(
    owner: string,
    repo: string
  ): Promise<CollaboratorData[] | null> {
    const existing: CollaboratorData[] = []
    let x: CollaboratorData[] | null = await this.findDirect(owner, repo)
    if (x) {
      existing.push(...x)
    }

    x = await this.findOutside(owner, repo)
    if (x) {
      existing.push(...x)
    }
    x = await this.listInvitations(owner, repo)
    if (x) {
      existing.push(...x)
    }

    return existing
  }

  private async findDirect(
    owner: string,
    repo: string
  ): Promise<CollaboratorData[] | null> {
    core.debug('Finding collaborators')
    core.debug(`${owner}`)
    core.debug(`${repo}`)
    const existing: CollaboratorData[] = []

    const params = {
      repo,
      owner,
      affiliation: 'direct'
    }
    let res
    try {
      res = await this.octokitClient.repos.listCollaborators({
        repo,
        owner,
        affiliation: 'direct'
      })
    } catch (e) {
      if (e.status === 404) {
        const message404 = `No collaborator found for ${JSON.stringify(params)}`
        core.debug(message404)
        //throw new Error(message404)
      }
      const message = `${e} fetching the collaborators with ${JSON.stringify(
        params
      )}`
      core.debug(message)
      throw new Error(message)
    }
    const x = res.data.map(user => {
      return {
        // Force all usernames to lowercase to avoid comparison issues.
        username: user.login.toLowerCase(),
        pendinginvite: false,
        permission: user.permissions
      }
    })
    existing.push(...x)
    return existing
  }

  private async findOutside(
    owner: string,
    repo: string
  ): Promise<CollaboratorData[] | null> {
    core.debug('Finding collaborators')
    core.debug(`${owner}`)
    core.debug(`${repo}`)
    const existing: CollaboratorData[] = []

    const params = {
      repo,
      owner,
      affiliation: 'direct'
    }
    let res
    try {
      res = await this.octokitClient.repos.listCollaborators({
        repo,
        owner,
        affiliation: 'outside'
      })
    } catch (e) {
      if (e.status === 404) {
        const message404 = `No collaborator found for ${JSON.stringify(params)}`
        core.debug(message404)
        //throw new Error(message404)
      }
      const message = `${e} fetching the collaborators with ${JSON.stringify(
        params
      )}`
      core.debug(message)
      throw new Error(message)
    }
    const x = res.data.map(user => {
      return {
        // Force all usernames to lowercase to avoid comparison issues.
        username: user.login.toLowerCase(),
        pendinginvite: false,
        permission: user.permissions
      }
    })
    existing.push(...x)
    return existing
  }

  private async listInvitations(
    owner: string,
    repo: string
  ): Promise<CollaboratorData[] | null> {
    core.debug('Finding collaborators')
    core.debug(`${owner}`)
    core.debug(`${repo}`)
    const existing: CollaboratorData[] = []

    const params = {
      repo,
      owner,
      affiliation: 'direct'
    }
    let res
    try {
      res = await this.octokitClient.repos.listInvitations({
        repo,
        owner
      })
    } catch (e) {
      if (e.status === 404) {
        const message404 = `No collaborator found for ${JSON.stringify(params)}`
        core.debug(message404)
        //throw new Error(message404)
      }
      const message = `${e} fetching the collaborators with ${JSON.stringify(
        params
      )}`
      core.debug(message)
      throw new Error(message)
    }
    const x = res.data.map(invite => {
      const u: string = invite?.invitee?.login.toLowerCase() || ''

      return {
        // Force all usernames to lowercase to avoid comparison issues.
        username: u,
        pendinginvite: true,
        invitation_id: invite.id,
        permission: undefined
      }
    })
    existing.push(...x)
    return existing
  }

  private async updateInvite(
    owner: string,
    repo: string,
    invitation_id: number,
    permissions: 'admin' | 'read' | 'write' | 'maintain' | 'triage' | undefined
  ): Promise<void> {
    const data = {
      owner,
      repo,
      invitation_id,
      permissions
    }
    await this.octokitClient.repos.updateInvitation(data)
  }

  private async addCollaborator(
    owner: string,
    repo: string,
    username: string
  ): Promise<void> {
    const p: 'admin' | 'maintain' | 'triage' | 'pull' | 'push' | undefined =
      (this.permission === 'admin' && 'admin') ||
      (this.permission === 'write' && 'push') ||
      (this.permission === 'read' && 'pull') ||
      undefined
    const data = {
      owner,
      repo,
      username,
      p
    }
    await this.octokitClient.repos.addCollaborator(data)
  }

  /*
  private async addMembers(
    org: string,
    team_slug: string,
    members: string[]
  ): Promise<void> {
    for (const username of members) {
      const params = {
        org,
        team_slug,
        username
      }
      core.debug(`Adding team members ${JSON.stringify(params)}`)

      try {
        await this.octokitClient.teams.addOrUpdateMembershipForUserInOrg(params)
      } catch (e) {
        const message = `${e} when adding members to the team with ${JSON.stringify(
          params
        )}`
        core.debug(message)
        throw new Error(message)
      }
    }
  }

  private async isOrgAdmin(org: string, username: string): Promise<boolean> {
    try {
      const {
        data: {role: role}
      } = await this.octokitClient.orgs.getMembershipForUser({
        org,
        username
      })
      return role === 'admin'
    } catch (e) {
      if (e.status === 404) {
        core.debug(`${username} not a member of org ${e}`)
        return false
      } else {
        core.error(
          `Got error getting org role for ${username} in ${org} = ${e}`
        )
        return false
      }
    }
  }

  private async isCollaborator(
    org: string,
    repo: string,
    username: string
  ): Promise<boolean> {
    const collaborators = await this.find(this.org, repo)
    core.debug(`collaborators team ${collaborators}`)
    try {
      const {
        data: memberData
      } = await this.octokitClient.teams.getMembershipForUserInOrg({
        org,
        team_slug,
        username
      })
      core.debug(`Found member data = ${JSON.stringify(memberData)}`)
      return true
    } catch (e) {
      if (e.status === 404) {
        core.debug(`No team memberships found for ${username} ${e}`)
        return false
      } else {
        core.error(
          `Got error getting teams memberships team ${team_slug} in ${org} = ${e.message}`
        )
        return false
      }
    }
  }
*/

  async sync(): Promise<void> {
    //const isOrgAdmin = await this.isOrgAdmin(this.org, this.requestor)

    for (const repo of this.repos) {
      const existings = await this.find(this.org, repo)
      core.debug(`Existing collaborators are ${JSON.stringify(existings)}`)
      if (existings) {
        for (const existing of existings) {
          const found = this.collaborators.find(record => {
            return existing.username === record
          })
          if (found) {
            if (existing.pendinginvite) {
              // re-invite
              core.debug(
                `***** Will re-invite a pending invitation for the ${existing.username} with permission ${this.permission}`
              )
              this.updateInvite(
                this.org,
                repo,
                existing.invitation_id as number,
                this.permission
              )
            } else {
              core.debug(
                `***** Will modify the existing collaborator ${existing.username} with permission ${this.permission}`
              )
              this.addCollaborator(this.org, repo, existing.username)
            }
          }
        }
      }

      for (const collaborator of this.collaborators) {
        const found = existings?.find(record => {
          return record.username === collaborator
        })
        if (!found) {
          this.addCollaborator(this.org, repo, collaborator)
        }
      }
      /*
      if (
        isOrgAdmin ||
        (await this.isCollaborator(this.org, repo, this.requestor))
      ) {
        await this.addMembers(this.org, teamSlug, this.members)
      } else {
        const message = `Not authorized!. The requestor ${this.requestor} is neither an admin for ${this.org} org nor a member of ${teamSlug} team `
        core.debug(message)
        throw new Error(message)
      }
      */
    }
  }
}
