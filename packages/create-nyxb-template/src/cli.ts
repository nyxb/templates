#!/usr/bin/env node
import path from 'node:path'
import { execSync } from 'node:child_process'
import os from 'node:os'
import c from '@nyxb/picocolors'
import {
  confirm,
  intro,
  isCancel,
  outro,
  select,
  text,

} from '@tyck/prompts'
import { error, info, nyxbGradient, nyxbLoader, warn } from './logger'
import { IsFolderEmpty, MakeDir } from './utils/dir.js'
import { TryGitInit } from './utils/git.js'
import { ValidateNpmName } from './utils/npm.js'
import {
  GetPackageManager,
  InstallPackage,
  PackageManager,
} from './utils/package-manager.js'
import { DownloadAndExtractTemplate, GetTemplates } from './utils/template.js'
import {
  checkIfPackageIsInstalled,
  createNyxircFileIfNotExists,
  installPackage,
} from './utils/nyxi-setup'
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
  checkAndInstallNyxi()
  /**
 * nyxi package manager
 */

  // Verify that the package is installed
  const packageName = '@nyxb/nyxi'
  const isPackageInstalled = await checkIfPackageIsInstalled(packageName)

  // Query whether the package should be installed
  if (!isPackageInstalled) {
    const shouldInstallPackage = await confirm({
      message: 'Do you want to install the "Always Right" package manager Nyxi? (Recommended)',
      initialValue: true,
    })

    if (shouldInstallPackage) {
      const loader = nyxbLoader(`Install ${packageName} global...`).start()
      await installPackage(packageName)
      info(`${packageName} successfully installed.`)
      loader.stop()

      // Create .nyxirc file if it does not exist yet
      const nyxircFilePath = `${os.homedir()}/.nyxirc`
      const nyxircContent = 'defaultAgent=pnpm'

      warn(`Check if ${nyxircFilePath} exists...`)
      await createNyxircFileIfNotExists(nyxircFilePath, nyxircContent)
      info(`The ${nyxircFilePath} file exists or has been created.`)
    }
    else {
      error('Nyxi will not be installed. 🤔')
    }
  }
  else {
    info(`${packageName} is already installed.`)
  }

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
    error(('> Unable to load templates 🥹'))
    process.exit()
  }

  const templateRes = await select({
    message: 'Pick template',
    options: templateList.map(template => ({
      value: template.value,
      label: template.title,
    })),
  })

  if (isCancel(templateRes))
    process.exit()

  if (!templateRes || typeof templateRes !== 'string') {
    warn(('> Please select a template :('))
    process.exit()
  }

  /**
 * Make project directory
 */

  try {
    await MakeDir(resolvedProjectPath)
  }
  catch (err) {
    error(('> Failed to create specified directory :('))
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

  const spinner = nyxbLoader(c.bold('Downloading template...')).start()

  try {
    await DownloadAndExtractTemplate(resolvedProjectPath, templateRes)
    spinner.succeed(c.bold('Downloaded template'))
  }
  catch (err) {
    spinner.fail(c.bold('Failed to download selected template :('))
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
    error(('> Failed to update project name :('))
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
    c.nicegreen('√'),
    c.bold('Created nyxb project'),
    c.gray('»'),
    nyxbGradient(projectName),
  )
  outro(nyxbGradient('Youre all set! 🎉'))

  info(c.blue('?'), c.bold('Next Steps!'))
  info(`\t> cd ${projectPath}`)

  if (PackageManager.none === packageManager)
    info('\t> nyxi')

  if (PackageManager.none === packageManager)
    info('\t> nyxr dev')

  else
    console.log(`\t> ${PackageManager[packageManager]} run dev`)

  console.log()
  info(c.blue('?'), c.bold('Support'))
  warn('    Discord Server: https://discord.💻nyxb.ws')
  warn('     Homepage: https://💻nyxb.ws')
  warn('         Templates: https://github.com/nyxb/templates')
  warn('            GitHub: https://github.com/nyxb')
  console.log()
  console.log(
    info('√'),
    nyxbGradient('Best regards, nyxb'),
    c.red('❤️'),
  )
}
main()
