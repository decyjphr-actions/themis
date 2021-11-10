//import {Bumps, PreRelease} from './constants'
import * as core from '@actions/core'
//import * as github from '@actions/github'
import {GitHub} from '@actions/github/lib/utils'
//import { HttpClient } from '@actions/http-client'
import {TeamData} from './TeamData'

//type OctoClientType = ReturnType<typeof github.getOctokit>
export class Team {
  octokitClient: InstanceType<typeof GitHub>
  org: string
  teamSlugs: string[]
  members: string[]

  constructor(
    octokitClient: InstanceType<typeof GitHub>,
    org: string,
    members: string[],
    teamSlugs: string[]
  ) {
    this.octokitClient = octokitClient
    this.org = org
    this.teamSlugs = teamSlugs
    this.members = members
  }

  private async find(org: string, team_slug: string): Promise<TeamData | null> {
    core.debug('Finding team')
    core.debug(`${team_slug}`)
    core.debug(`${org}`)
    const params = {
      org,
      team_slug
    }
    let res = {
      data: {
        name: ''
      }
    }
    try {
      res = await this.octokitClient.teams.getByName(params)
    } catch (e) {
      core.debug(`xxxx ${e} ${JSON.stringify(params)}`)
      if (e.status === 404) {
        core.debug(`xxxx ${e} ${JSON.stringify(params)} ${JSON.stringify(res)}`)
      }
    }
    const {data: team} = res
    return team
  }

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
      core.debug(`Adding team members  ${JSON.stringify(params)}`)

      let res = {
        data: {}
      }
      try {
        res = await this.octokitClient.teams.addOrUpdateMembershipForUserInOrg(
          params
        )
      } catch (e) {
        core.debug(`xxxx ${e}`)
        if (e.status === 404) {
          core.debug(
            `xxxx ${e} ${JSON.stringify(params)} ${JSON.stringify(res)}`
          )
        }
      }
    }
  }

  async sync(): Promise<void> {
    for (const teamSlug of this.teamSlugs) {
      const team = await this.find(this.org, teamSlug)
      core.debug(`${JSON.stringify(team)}`)
      await this.addMembers(this.org, teamSlug, this.members)
    }
  }
}
