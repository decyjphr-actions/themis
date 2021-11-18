import * as core from '@actions/core'
import {Inputs} from './constants'
import {TeamInputs} from './TeamInputs'

/**
 * Helper to get all the inputs for the action
 */
export function getInputs(): TeamInputs {
  const issue_body: string = core.getInput(Inputs.IssueBody, {required: true})
  core.debug(issue_body)
  const parsed_body = JSON.parse(issue_body)
  const requestor: string = core.getInput(Inputs.Requestor, {required: true})
  const pat_token: string = core.getInput(Inputs.Token, {required: true})

  const inputs: TeamInputs = {
    members: parsed_body.members.split('\r\n'),
    teams: parsed_body.teams.split('\r\n'),
    requestor,
    pat_token
  }

  /**
     if (bump == null) {
    core.setFailed(
      `Testing ${
        Inputs.Prelabel
      } input. Provided: ${pre}. Available options: ${Object.keys(Bumps)}`
    )
  }
   * const retentionDaysStr = core.getInput(Inputs.RetentionDays)
    if (retentionDaysStr) {
       inputs.retentionDays = parseInt(retentionDaysStr)
    if (isNaN(inputs.retentionDays)) {
      core.setFailed('Invalid retention-days')
    }
  }
 */

  return inputs
}
