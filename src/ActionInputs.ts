export interface ThemisInputs {
  /**
   * Bump the version number semantically. The value must be one of: \n
   * major: Bump the major version number, e.g. 1.0.0 -> 2.0.0.\n
   * minor: Bump the minor version number, e.g. 0.1.0 -> 0.2.0.\n
   * patch: Bump the patch version number, e.g. 0.0.1 -> 0.0.2.\n
   * final: Promote the version to a final version, e.g. 1.0.0-rc.1 -> 1.0.0.
   */
  issue_body_json: string
  pat_token: string
}
