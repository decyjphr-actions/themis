export interface TeamInputs {
  /**
   * Bump the version number semantically. The value must be one of: \n
   * major: Bump the major version number, e.g. 1.0.0 -> 2.0.0.\n
   * minor: Bump the minor version number, e.g. 0.1.0 -> 0.2.0.\n
   * patch: Bump the patch version number, e.g. 0.0.1 -> 0.0.2.\n
   * final: Promote the version to a final version, e.g. 1.0.0-rc.1 -> 1.0.0.
   */
  members: string[]

  /**
   * When bumping, bump to a prerelease (e.g. rc or alpha), or bump an existing prerelease.
   * If present, and the version is already a prerelease matching this value, its number is bumped.
   * If the version is already a prerelease of another type, (e.g. alpha vs. beta), the type is switched
   * and the prerelease version is reset to 1. If the version is not already a pre-release,
   * then pre is added, starting at 1.
   *
   */
  teams: string[]

  pat_token: string
}
