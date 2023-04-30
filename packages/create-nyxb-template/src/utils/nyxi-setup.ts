import { execSync } from 'node:child_process'
import * as fs from 'fs-extra'
import { error } from '../logger.js'

export async function checkIfPackageIsInstalled(packageName: string): Promise<boolean> {
  try {
    const command = process.platform === 'win32' ? 'findstr' : 'grep'
    const result = execSync(`npm list -g --depth=0 | ${command} ${packageName}`, {
      stdio: 'pipe',
      encoding: 'utf-8',
    })
    return result.includes(packageName)
  }
  catch (e) {
    return false
  }
}

export async function installPackage(packageName: string): Promise<void> {
  try {
    execSync(`npm install -g ${packageName}`)
  }
  catch (e: any) {
    error(`Fehler beim Installieren von ${packageName}: ${e}`)
    process.exit(1)
  }
}

export async function createNyxircFileIfNotExists(filePath: string, content: string): Promise<void> {
  try {
    await fs.access(filePath)
  }
  catch (e: any) {
    if (e.code === 'ENOENT') {
      await fs.writeFile(filePath, content, { encoding: 'utf-8' })
    }
    else {
      error(`Fehler beim Zugriff auf ${filePath}: ${e}`)
      process.exit(1)
    }
  }
}
