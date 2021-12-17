import {wait} from '../src/wait'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {type} from 'os'
import * as core from '@actions/core'
import * as github from '@actions/github'
import {Collaborator} from '../src/collaborator'
import {TeamInputs, CollaboratorInputs} from '../src/TeamInputs'

import * as inputHelper from '../src/input-helper'

beforeAll(() => {
  //process.env['INPUT_PAT_TOKEN'] = 'abc'
  process.env['INPUT_ISSUE_BODY_JSON'] =
    '{"collaborators":"yjayaraman\\r\\nregpaco","repos":"test\\r\\nsecdemo","issue_name":"permissioninputs","permission":"write"}'
  process.env['GITHUB_REPOSITORY'] = 'decyjphr-org/admin'
  process.env['GITHUB_ACTOR'] = 'decyjphr'
  process.env['INPUT_ISSUE_NAME'] = 'collaboratorinputs'
})

beforeEach(() => {
  //delete process.env['INPUT_BUMP']
})

test('Input Helper test', () => {
  const inputs:
    | TeamInputs
    | CollaboratorInputs
    | undefined = inputHelper.getInputs()

  core.debug(`Inputs ${JSON.stringify(inputs)}`)
  core.debug(`Inputs is Collaborator ${inputs instanceof CollaboratorInputs}`)
  if (inputs instanceof CollaboratorInputs) {
    const collaboratorInputs: CollaboratorInputs = inputs
    expect(collaboratorInputs.collaborators).toContain('yjayaraman')
    expect(collaboratorInputs.repos).toContain('test')
    expect(collaboratorInputs.requestor).toBe('decyjphr')
    expect(collaboratorInputs.pat_token).toBeDefined()
  }
})

test('Unit test Collaborator.sync', async () => {
  const inputs:
    | TeamInputs
    | CollaboratorInputs
    | undefined = inputHelper.getInputs()

  core.debug(`Inputs ${JSON.stringify(inputs)}`)
  core.debug(`Inputs is Collaborator ${inputs instanceof CollaboratorInputs}`)
  if (inputs instanceof CollaboratorInputs) {
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
  } else {
    throw new Error('Input not a Collaborator input')
  }
})
/*
test('Unit test requestor not member for Team.sync', async () => {
  process.env['GITHUB_ACTOR'] = 'devasena'
  const inputs:
    | collaboratorInputs
    | CollaboratorInputs
    | undefined = inputHelper.getInputs()
  const collaboratorInputs: collaboratorInputs = inputs as collaboratorInputs
  const token = core.getInput('pat_token', {required: true})
  const octokit = github.getOctokit(token)
  const team: Team = new Team(
    octokit,
    github.context.repo.owner,
    collaboratorInputs.members,
    collaboratorInputs.teams,
    collaboratorInputs.requestor
  )
  try {
    await team.sync()
  } catch (e) {
    expect(e).toBeInstanceOf(Error)
    core.error(`Main exited ${e}`)
    core.setFailed(`${e.message}`)
  }
})

test('Unit test Team.sync with error', async () => {
  jest.setTimeout(10000)
  process.env['INPUT_ISSUE_BODY_JSON'] =
    '{"collaborators":"yjayaraman\\r\\nregpaco","repos":"test\\r\\njquery", "issue_name":"permissioninputs"}'
  const inputs:
    | collaboratorInputs
    | CollaboratorInputs
    | undefined = inputHelper.getInputs()
  const collaboratorInputs: collaboratorInputs = inputs as collaboratorInputs
  const token = core.getInput('pat_token', {required: true})
  const octokit = github.getOctokit(token)
  const team: Team = new Team(
    octokit,
    github.context.repo.owner,
    collaboratorInputs.members,
    collaboratorInputs.teams,
    collaboratorInputs.requestor
  )
  try {
    await team.sync()
  } catch (e) {
    expect(e).toBeInstanceOf(Error)
    core.error(`Main exited ${e}`)
    core.setFailed(`${e.message}`)
  }
})
*/
