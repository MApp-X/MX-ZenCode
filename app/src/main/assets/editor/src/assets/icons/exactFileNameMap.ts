/**
 * Special full filename matches (Exact case-insensitive match)
 */
export const exactFileNameMap: Record<string, string> = {
  // Package Managers
  "package.json": "npm.svg",
  "package-lock.json": "npm.svg",
  ".npmignore": "npm_ignored.svg",
  ".npmrc": "npm.svg",
  "yarn.lock": "yarn.svg",
  ".yarnrc": "yarn.svg",
  "pnpm-lock.yaml": "npm.svg",

  // TypeScript
  "tsconfig.json": "tsconfig.svg",
  "tsconfig.app.json": "tsconfig.svg",
  "tsconfig.node.json": "tsconfig.svg",

  // Git & Version Control
  ".gitignore": "git_ignore.svg",
  ".gitattributes": "git_ignore.svg",
  ".gitmodules": "git_ignore.svg",

  // Linters & Formatters
  ".editorconfig": "editorconfig.svg",
  ".eslintrc": "eslint.svg",
  ".eslintrc.js": "eslint.svg",
  ".eslintrc.cjs": "eslint.svg",
  ".eslintrc.json": "eslint.svg",
  ".eslintrc.yml": "eslint.svg",
  ".eslintrc.yaml": "eslint.svg",
  ".eslintignore": "eslint.svg",
  "stylelint.config.js": "stylelint.svg",
  ".stylelintrc": "stylelint.svg",
  ".prettierrc": "settings.svg",
  ".prettierignore": "settings.svg",

  // Licensing & Documentation
  "license": "license.svg",
  "license.md": "license.svg",
  "license.txt": "license.svg",
  "licence": "license.svg",
  "licence.md": "license.svg",
  "readme.md": "info.svg",
  "readme.txt": "info.svg",
  "readme": "info.svg",
  "changelog.md": "clock.svg",
  "todo.md": "todo.svg",
  "todo.txt": "todo.svg",

  // Infrastructure & Build
  "dockerfile": "docker.svg",
  "docker-compose.yml": "docker.svg",
  "docker-compose.yaml": "docker.svg",
  ".dockerignore": "docker.svg",
  "makefile": "makefile.svg",
  "jenkinsfile": "jenkins.svg",
  "pipeline": "pipeline.svg",
  "karma.conf.js": "karma.svg",
  "rollup.config.js": "rollup.svg",
  "rollup.config.ts": "rollup.svg",
  "vite.config.js": "vite.svg",
  "vite.config.ts": "vite.svg",
  "webpack.config.js": "webpack.svg",
  "webpack.config.ts": "webpack.svg"
};
