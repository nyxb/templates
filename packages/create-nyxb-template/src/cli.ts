#!/usr/bin/env node
import path from 'node:path'
import { execSync } from 'node:child_process'
import c from '@nyxb/picocolors'
import {
  intro,
  isCancel,
  outro,
  select,
  text,

} from '@tyck/prompts'
import { error, info, nyxbGradient, nyxbLoader, nyxbPurple, warn } from './logger'
import { IsFolderEmpty, MakeDir } from './utils/dir.js'
import { TryGitInit } from './utils/git.js'
import { ValidateNpmName } from './utils/npm.js'
import {
  GetPackageManager,
  InstallPackage,
  PackageManager,
} from './utils/package-manager.js'
import { GetTemplates, downloadAndExtractExample } from './utils/template.js'
import { checkAndInstallNyxi } from './utils/nyxi'

/**
 * Startup
 */

console.log(`
███╗   ██╗██╗   ██╗██╗  ██╗██████╗ 
████╗  ██║╚██╗ ██╔╝╚██╗██╔╝██╔══██╗
██╔██╗ ██║ ╚████╔╝  ╚███╔╝ ██████╔╝
██║╚██╗██║  ╚██╔╝   ██╔██╗ ██╔══██╗
██║ ╚████║   ██║   ██╔╝ ██╗██████╔╝
╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═════╝
`)

/**
 * Get project path and name
 */
export async function main() {
  let projectPath = './'

  intro('Welcome to the NyxTemplate Forge❗')
  /**
 * nyxi package manager
 */
  checkAndInstallNyxi()

  /**
 * Get project path and name
 */

  const projectPathRes = await text({
    initialValue: 'my-nyxb-template',
    message: 'What is your project named?',
    validate: (name) => {
      const validation = ValidateNpmName(path.basename(path.resolve(name)))
      if (validation.valid)
        return undefined
      return `Invalid project name: ${validation.problems?.[0] ?? 'unknown'}`
    },
  })

  if (isCancel(projectPathRes))
    process.exit()

  if (typeof projectPathRes === 'string')
    projectPath = projectPathRes.trim()

  const resolvedProjectPath = path.resolve(projectPath)
  const projectName = path.basename(resolvedProjectPath)

  /**
 * Select package manager
 */

  const packageManager = await GetPackageManager()

  if (packageManager === null)
    process.exit()

  /**
 * Select template prompt
 */

  const templateList = await GetTemplates()

  if (!templateList.length) {
    error(('Unable to load templates 🥹'))
    process.exit()
  }

  const templateRes = await select({
    message: 'Pick template📄',
    options: templateList.map((template: { value: any; title: any }) => ({
      value: template.value,
      label: template.title,
    })),
  })

  if (isCancel(templateRes))
    process.exit()

  if (!templateRes || typeof templateRes !== 'string') {
    warn(('Please select a template :('))
    process.exit()
  }

  /**
 * Make project directory
 */

  try {
    await MakeDir(resolvedProjectPath)
  }
  catch (err) {
    error(('Failed to create specified directory 😓'))
    process.exit()
  }

  /**
 * Make sure directory is clean
 */

  if (!IsFolderEmpty(resolvedProjectPath, projectName))
    process.exit()

  /**
 * Download and extract template
 */

  const spinner = nyxbLoader(('Downloading template...')).start()

  try {
    await downloadAndExtractExample(resolvedProjectPath, templateRes)
    spinner.succeed(('Downloaded template'))
  }
  catch (err) {
    spinner.fail(('Failed to download selected template😓'))
    process.exit()
  }

  /**
 * Update project name
 */

  try {
    execSync(
    `npx -y json -I -f package.json -e "this.name=\\"${projectName}\\""`,
    {
      cwd: resolvedProjectPath,
      stdio: 'ignore',
    },
    )
  }
  catch (err) {
    error(('Failed to update project name😓'))
  }

  /**
 * Init git
 */

  TryGitInit(resolvedProjectPath)

  /**
 * Install packages
 */

  await InstallPackage(resolvedProjectPath, packageManager)

  /**
 * End
 */

  info(
    c.bold('Created nyxb project'),
    c.gray('»'),
    nyxbPurple(projectName),
  )

  info(c.blue('?'), c.bold('Next Steps!'))
  info(`\t> cd ${projectPath}`)

  if (PackageManager.none === packageManager)
    info('\t> nyxi')

  if (PackageManager.none === packageManager)
    info('\t> nyxr dev')

  else
    info('\t> nyxr dev')
  console.log()
  console.log(nyxbPurple('?'), c.bold('Support'))
  warn('Discord Server: https://discord.💻nyxb.ws')
  warn('Homepage: https://💻nyxb.ws')
  warn('Templates: https://github.com/nyxb/templates/examples')
  warn('GitHub: https://github.com/nyxb')
  console.log()
  console.log(
    nyxbGradient('Best regards, nyxb'),
    c.red('❤️'),
  )
  outro(nyxbGradient('Youre all set! 🎉'))
}
main()
