import { exec, execSync } from 'node:child_process'
import c from '@nyxb/picocolors'
import { cancel, intro, isCancel, select } from '@tyck/prompts'
import { error, info, nyxbLoader } from './logger'

export enum PackageManager {
  npm,
  yarn,
  pnpm,
  bun,
  none,
}

export async function GetPackageManager(): Promise<PackageManager | null> {
  intro('Pick package manager 📦')

  const selected = await select({
    message: 'Pick package manager',
    options: [
      {
        value: PackageManager.npm.toString(),
        label: 'npm',
      },
      {
        value: PackageManager.yarn.toString(),
        label: 'yarn',
      },
      {
        value: PackageManager.pnpm.toString(),
        label: 'pnpm',
      },
      {
        value: PackageManager.bun.toString(),
        label: 'bun',
      },
      {
        value: PackageManager.none.toString(),
        label: 'none - do not install packages',
      },
    ],
  })

  if (isCancel(selected)) {
    cancel('nevermind. ❌')
    process.exit(0)
  }

  const manager = Number(selected) as PackageManager

  try {
    switch (manager) {
      case PackageManager.none:
        break

      case PackageManager.npm:
        execSync('npm --version', { stdio: 'ignore' })
        break

      case PackageManager.yarn:
        execSync('yarn --version', { stdio: 'ignore' })
        break

      case PackageManager.pnpm:
        execSync('pnpm --version', { stdio: 'ignore' })
        break

      case PackageManager.bun:
        execSync('bun --version', { stdio: 'ignore' })
        break
    }
  }
  catch (err) {
    error(('×'),
      `Could not found ${c.nicegreen(
        PackageManager[manager],
      )} package manager, Please install it from:`,
      PackageManager.pnpm === manager
        ? 'https://pnpm.io'
        : PackageManager.yarn === manager
          ? 'https://yarnpkg.com'
          : PackageManager.bun === manager
            ? 'https://github.com/bunpkg/bun'
            : 'https://nodejs.org/en/download',
    )

    return GetPackageManager()
  }

  return manager
}

export async function InstallPackage(
  root: string,
  manager: PackageManager,
): Promise<void> {
  if (PackageManager.none === manager) {
    info(
      c.blue('?'),
      c.bold('skipped package installation...'),
    )
    return
  }

  const spinner = nyxbLoader('Installing packages...').start()

  try {
    switch (manager) {
      case PackageManager.npm:
        await new Promise((resolve, reject) => {
          exec('npm install', { cwd: root }, (err) => {
            if (err)
              reject(err)

            resolve(true)
          })
        })
        break

      case PackageManager.yarn:
        await new Promise((resolve, reject) => {
          exec('yarn install', { cwd: root }, (err) => {
            if (err)
              reject(err)

            resolve(true)
          })
        })
        break

      case PackageManager.pnpm:
        await new Promise((resolve, reject) => {
          exec('pnpm install', { cwd: root }, (err) => {
            if (err)
              reject(err)

            resolve(true)
          })
        })
        break

      case PackageManager.bun:
        await new Promise((resolve, reject) => {
          exec('bun install', { cwd: root }, (err) => {
            if (err)
              reject(err)

            resolve(true)
          })
        })
        break
    }

    spinner.succeed(c.bold('Installed packages'))
  }
  catch (err) {
    spinner.fail(c.bold('Failed to install packages :('))
  }
}
