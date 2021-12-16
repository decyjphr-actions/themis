import * as core from '@actions/core'
import {Inputs} from './constants'
import {CollaboratorInputs, TeamInputs} from './TeamInputs'

/**
 * Helper to get all the inputs for the action
 */
export function getInputs(): TeamInputs | CollaboratorInputs | undefined {
  const issue_name: string = core.getInput(Inputs.IssueName, {required: true})
  core.debug(issue_name)
  const issue_body: string = core.getInput(Inputs.IssueBody, {required: true})
  core.debug(issue_body)
  const parsed_body = JSON.parse(issue_body)
  const actor = process.env.GITHUB_ACTOR //core.getInput(Inputs.Requestor, {required: true})
  if (!actor) {
    throw new Error('actor is undefined')
  }
  const pat_token: string = core.getInput(Inputs.Token, {required: true})

  if (issue_name === 'teaminputs') {
    let inputs: TeamInputs = new TeamInputs()
    inputs = Object.assign(inputs, {
      members: parsed_body.members.split('\r\n'),
      teams: parsed_body.teams.split('\r\n'),
      requestor: actor,
      pat_token
    })
    return inputs
  } else if (issue_name === 'collaboratorinputs') {
    const inputs: CollaboratorInputs = {
      members: parsed_body.members.split('\r\n'),
      teams: parsed_body.teams.split('\r\n'),
      requestor: actor,
      pat_token
    }
    return inputs
  }
  //return null
}
