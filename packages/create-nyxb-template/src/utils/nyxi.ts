import * as fs from 'node:fs'
import * as os from 'node:os'
import { execSync } from 'node:child_process'
import { confirm } from '@tyck/prompts'
import { error, info } from '../logger'

export async function checkAndInstallNyxi() {
  const nyxiPackageName = '@nyxb/nyxi'

  try {
    let installedPackages = ''

    if (os.platform() === 'win32')
      installedPackages = execSync('npm list -g --depth=0 --parseable --long').toString()

    else
      installedPackages = execSync('npm list -g --depth=0 --parseable --long | grep -o "@nyxb/nyxi@[^\s]*"').toString()

    const isNyxiInstalled = installedPackages.includes(nyxiPackageName)

    if (!isNyxiInstalled) {
      const shouldInstallNyxi = await confirm({
        message: `${nyxiPackageName} is not installed. Do you want to install it? (Recommend)`,
        initialValue: true,
      })

      if (shouldInstallNyxi) {
        info(`Install ${nyxiPackageName} global...`)
        try {
          execSync(`npm install -g ${nyxiPackageName}`)
          info(`${nyxiPackageName} successfully installed.`)

          const nyxircPath = `${os.homedir()}/.nyxirc`
          const nyxircContent = 'defaultAgent=npm # default "prompt".'

          fs.writeFileSync(nyxircPath, nyxircContent)
          console.log(`file ${nyxircPath} created.`)
        }
        catch (e) {
          error(`Error installing ${nyxiPackageName}:`, e)
        }
      }
    }
    else {
      info(`${nyxiPackageName} is already installed.`)
    }
  }
  catch (e) {
    error('Error retrieving the installed packages:', e)
  }
}
