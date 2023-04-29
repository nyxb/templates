import { readFile } from 'node:fs/promises'
import boxen from 'boxen'
import c from '@nyxb/picocolors'
import isInstalledGlobally from 'is-installed-globally'
import checkForUpdate from 'update-check';

(async function () {
  /**
   * Read package.json
   */
  const packageJson = JSON.parse(
    await readFile(new URL('../../package.json', import.meta.url), 'utf-8'),
  )

  /**
   * Check for update
   */

  let update = null

  try {
    update = await checkForUpdate(packageJson)
  }
  catch (err) {
    // console.log(
    //   boxen('Failed to check for updates', {
    //     align: 'center',
    //     borderColor: 'red',
    //     borderStyle: 'round',
    //     margin: 1,
    //     padding: 1,
    //   }),
    // )
  }

  if (update) {
    const updateCmd = isInstalledGlobally
      ? 'npm i -g create-nyxb-template@latest'
      : 'npm i create-nyxb-template@latest'

    const template = `Update available ${c.dim(
      `${packageJson.version}`,
    )}${c.reset(' → ')}${c.green(`${update.latest}`)} \nRun ${c.cyan(
      updateCmd,
    )} to update`

    console.log(
      boxen(template, {
        align: 'center',
        borderColor: 'yellow',
        borderStyle: 'round',
        margin: 1,
        padding: 1,
      }),
    )
  }

  return packageJson.version
})()
