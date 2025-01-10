module.exports = {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "angular",
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "angular",
      },
    ],
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
      },
    ],
    [
      "@semantic-release/npm",
      {
        npmPublish: false,
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: ["package.json", "CHANGELOG.md"],
        message: "Release ${nextRelease.version} 🚀\n\n${nextRelease.notes}",
      },
    ],
    [
      "@semantic-release/github",
      {
        assets: [
          {
            path: "build.zip",
            label: "Build",
          },
          {
            path: "coverage.zip",
            label: "Coverage",
          },
        ],
      },
    ],
  ],
};
