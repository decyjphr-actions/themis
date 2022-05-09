import * as core from '@actions/core'
import * as github from '@actions/github'
import * as inputHelper from './input-helper'
import {Team} from './team'
import {Collaborator} from './collaborator'
import {TeamInputs, CollaboratorInputs, RepoInputs} from './ThemisInputs'

async function run(): Promise<void> {
  try {
    const inputs:
      | TeamInputs
      | RepoInputs
      | CollaboratorInputs
      | undefined = inputHelper.getInputs()

    core.debug(`Inputs ${JSON.stringify(inputs)}`)
    core.debug(
      `Inputs instanceof TeamInputs is ${inputs instanceof TeamInputs}`
    )
    if (inputs instanceof TeamInputs) {
      const teamInputs: TeamInputs = inputs
      core.debug(`Members ${teamInputs.members}`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
      core.debug(`Teams ${teamInputs.teams}`)
      //const token = core.getInput('github_token', {required: true})
      const octokit = github.getOctokit(teamInputs.pat_token)
      const team: Team = new Team(
        octokit,
        github.context.repo.owner,
        teamInputs.members,
        teamInputs.teams,
        teamInputs.requestor
      )
      core.debug(`Team is ${team}`)
      await team.sync()
      core.setOutput(
        'status',
        `Successfully created members ${JSON.stringify(
          teamInputs.members
        )} for teams ${JSON.stringify(teamInputs.teams)}`
      )
    } else if (inputs instanceof CollaboratorInputs) {
      const collaboratorInputs: CollaboratorInputs = inputs
      core.debug(`permission ${collaboratorInputs.permission}`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
      core.debug(`collaborators ${collaboratorInputs.collaborators}`)
      core.debug(`repos ${collaboratorInputs.repos}`)
      //const token = core.getInput('github_token', {required: true})
      const octokit = github.getOctokit(collaboratorInputs.pat_token)
      const collaborator: Collaborator = new Collaborator(
        octokit,
        github.context.repo.owner,
        collaboratorInputs.permission,
        collaboratorInputs.collaborators,
        collaboratorInputs.repos,
        collaboratorInputs.requestor
      )
      core.debug(`Collaborator is ${collaborator}`)
      await collaborator.sync()
      core.setOutput(
        'status',
        `Successfully added Collaborators ${JSON.stringify(
          collaboratorInputs.collaborators
        )} for repos ${JSON.stringify(
          collaboratorInputs.repos
        )} with permissions ${collaboratorInputs.permission}`
      )
    }
  } catch (_e) {
    const e: Error = _e as Error
    //core.error(`Main exited ${e}`)
    core.setOutput('status', e.message)
    core.setFailed(`${e.message}`)
  }
}

run()
