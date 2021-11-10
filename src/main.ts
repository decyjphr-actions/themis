import * as core from '@actions/core'
import * as github from '@actions/github'
import * as inputHelper from './input-helper'
import {Team} from './team'
import {TeamInputs} from './TeamInputs'

async function run(): Promise<void> {
  try {
    const teamInputs: TeamInputs = inputHelper.getInputs()
    core.debug(`Members ${teamInputs.members}`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    core.debug(`Teams ${teamInputs.teams}`)
    //const token = core.getInput('github_token', {required: true})
    const octokit = github.getOctokit(teamInputs.pat_token)

    const team: Team = new Team(
      octokit,
      github.context.repo.owner,
      teamInputs.members,
      teamInputs.teams
    )
    core.debug(`Team is ${team}`)
    await team.sync()
    core.setOutput(
      'status',
      `Successfully created members ${JSON.stringify(
        teamInputs.members
      )} for teams ${JSON.stringify(teamInputs.members)}`
    )
  } catch (e) {
    //core.error(`Main exited ${e}`)
    core.setOutput('status', e.message)
    core.setFailed(`${e.message}`)
  }
}

run()
