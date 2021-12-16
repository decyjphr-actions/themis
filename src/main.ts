import * as core from '@actions/core'
import * as github from '@actions/github'
import * as inputHelper from './input-helper'
import {Team} from './team'
import {TeamInputs, CollaboratorInputs} from './TeamInputs'

async function run(): Promise<void> {
  try {
    const inputs:
      | TeamInputs
      | CollaboratorInputs
      | undefined = inputHelper.getInputs()

    core.debug(`Inputs ${JSON.stringify(inputs)}`)
    core.debug(`Inputs is TEamInputs ${inputs instanceof TeamInputs}`)
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
    }
  } catch (e) {
    //core.error(`Main exited ${e}`)
    core.setOutput('status', e.message)
    core.setFailed(`${e.message}`)
  }
}

run()
