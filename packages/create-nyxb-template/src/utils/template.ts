import path from 'node:path'
import { tmpdir } from 'node:os'
import { createWriteStream } from 'node:fs'
import fs from 'node:fs/promises'
import { promisify } from 'node:util'
import { Stream } from 'node:stream'
import tar from 'tar'
import got from 'got'

const pipeline = promisify(Stream.pipeline)

export async function GetTemplates() {
  const TEMPLATE_REPO_URL = 'https://api.github.com/repos/nyxb/templates/contents/examples'

  try {
    const response = await got(TEMPLATE_REPO_URL, {
      headers: {
        'User-Agent': 'nyxb-template-fetcher', // Fügen Sie einen benutzerdefinierten User-Agent hinzu
      },
    })
    const files = JSON.parse(response.body)

    return files
      .filter((file: any) => file.type === 'dir')
      .map((file: any) => ({
        title: file.name,
        value: file.name,
      }))
  }
  catch (e: any) {
    console.error('Error fetching templates:', e.message)
    return []
  }
}

async function downloadTar(url: string, name: string) {
  const tempFile = path.join(tmpdir(), `${name}.temp-${Date.now()}`)
  await pipeline(got.stream(url), createWriteStream(tempFile))
  return tempFile
}

export async function downloadAndExtractExample(
  root: string,
  templateName: string,
) {
  const tarUrl = 'https://codeload.github.com/nyxb/templates/tar.gz/main'
  const tempFile = await downloadTar(tarUrl, 'nyxb-template')

  await tar.x({
    file: tempFile,
    cwd: root,
    strip: 2 + templateName.split('/').length,
    filter: (p: string) => p.includes(`templates-main/examples/${templateName}/`),
  })

  await fs.unlink(tempFile)
}
