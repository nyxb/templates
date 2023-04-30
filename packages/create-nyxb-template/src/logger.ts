import chalk from 'chalk'
import ora from 'ora'
import gradient from 'gradient-string'

const PURPLE = '#9945FF'
const GREEN = '#14F195'
const RED = '#F11712'
const YELLOW = '#FFFF00'

export const nyxbGradient = gradient(GREEN, PURPLE)

export const nyxbRed = chalk.hex(RED)
export const yellow = chalk.hex(YELLOW)
export const nyxbPurple = chalk.hex(PURPLE)
export const nyxbGreen = chalk.hex(GREEN)

export function nyxbLoader(text: string) {
  return ora({
    text,
    spinner: {
      frames: ['   ', nyxbGreen('>  '), nyxbPurple('>> '), nyxbGreen('>>>')],
    },
  })
}

export function info(...args: any[]) {
  console.log(nyxbGreen.bold('>'), ...args)
}

export function error(...args: any[]) {
  console.error(nyxbRed.bold('>'), ...args)
}

export function warn(...args: any[]) {
  console.error(yellow.bold('>'), ...args)
}
