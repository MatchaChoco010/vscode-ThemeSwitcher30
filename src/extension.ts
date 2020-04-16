import * as vscode from 'vscode'
import * as dayjs from 'dayjs'
import * as duration from 'dayjs/plugin/duration'

dayjs.extend(duration)

function getInstalledThemes(): string[] {
  return vscode.extensions.all.reduce((acc, ext) => {
    ext?.packageJSON?.contributes?.themes?.forEach((theme: any) => {
      if (!(theme.id === undefined || theme.id === null)) {
        acc.push(theme.id)
      } else {
        acc.push(theme.label)
      }
    })
    return acc
  }, [] as string[])
}

async function getThemeList(): Promise<string[]> {
  const themeList: string[] = vscode.workspace
    .getConfiguration('themeswitcher30')
    .get('themeList', [])
  if (themeList.length === 0) {
    const installedThemes = getInstalledThemes()
    await vscode.workspace
      .getConfiguration('themeswitcher30')
      .update('themeList', installedThemes, true)
    return installedThemes
  } else {
    return themeList
  }
}

async function changeTheme(): Promise<void> {
  const currentTheme = vscode.workspace
    .getConfiguration()
    .get('workbench.colorTheme', '')
  const themeList = (await getThemeList()).filter(
    (theme) => theme !== currentTheme
  )
  const newTheme =
    themeList[Math.floor(Math.random() * Math.floor(themeList.length - 1))]
  await vscode.workspace
    .getConfiguration()
    .update('workbench.colorTheme', newTheme, true)
  await vscode.window.showInformationMessage(`Theme switched to ${newTheme}`)
  console.log(`Theme switched to ${newTheme}`)
}

function getDeltaTime(): number {
  const now = dayjs()
  const duration = dayjs.duration(30, 'minutes')
  const next30 = dayjs(
    Math.ceil(+now / duration.asMilliseconds()) * duration.asMilliseconds()
  )
  return dayjs.duration(next30.diff(now)).asMilliseconds()
}

async function addCurrentTheme(): Promise<void> {
  const themeList = await getThemeList()
  const currentTheme = vscode.workspace
    .getConfiguration()
    .get('workbench.colorTheme', '')
  if (!themeList.includes(currentTheme)) {
    themeList.push(currentTheme)
    await vscode.workspace
      .getConfiguration('themeswitcher30')
      .update('themeList', themeList, true)
  }
  await vscode.window.showInformationMessage(
    `Add ${currentTheme} to setting list`
  )
}

async function removeCurrentTheme(): Promise<void> {
  const themeList = await getThemeList()
  const currentTheme = vscode.workspace
    .getConfiguration()
    .get('workbench.colorTheme', '')
  const index = themeList.indexOf(currentTheme, 0)
  if (index > -1) {
    themeList.splice(index, 1)
    await vscode.workspace
      .getConfiguration('themeswitcher30')
      .update('themeList', themeList, true)
  }
  await vscode.window.showInformationMessage(
    `Remove ${currentTheme} from setting list`
  )
}

export function activate(context: vscode.ExtensionContext): void {
  console.log('themeswitcher30 extension started.')

  const callback = async (): Promise<void> => {
    await changeTheme()
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout(callback, getDeltaTime())
  }
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  setTimeout(callback, getDeltaTime())

  let disposable = vscode.commands.registerCommand(
    'themeswitcher30.addCurrentTheme',
    async () => {
      await addCurrentTheme()
    }
  )
  context.subscriptions.push(disposable)

  disposable = vscode.commands.registerCommand(
    'themeswitcher30.removeCurrentTheme',
    async () => {
      await removeCurrentTheme()
    }
  )
  context.subscriptions.push(disposable)

  disposable = vscode.commands.registerCommand(
    'themeswitcher30.switchTheme',
    async () => {
      await changeTheme()
    }
  )
  context.subscriptions.push(disposable)
}

export function deactivate(): void {}
