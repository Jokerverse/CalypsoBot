import Command from 'structures/Command'
import {
  Client as DiscordClient,
  ClientEvents,
  Collection,
  type ClientOptions,
} from 'discord.js'
import { promisify } from 'util'
import glob from 'glob'
import type Event from 'structures/Event'

const glob_ = promisify(glob)

interface ModuleType {
  default: Event<keyof ClientEvents>
}

interface ClientConfig {
  token: string
  name: string
}

export default class Client extends DiscordClient {
  #token: string
  public name: string
  public commands: Collection<string, Command> = new Collection()

  public constructor(config: ClientConfig, options: ClientOptions) {
    super(options)

    this.#token = config.token

    this.name = config.name
  }

  async #registerEvents(): Promise<void> {
    const files = await glob_(`${__dirname}/../events/*{.ts,.js}`)
    for (const f of files) {
      const event: Event<keyof ClientEvents> = ((await import(f)) as ModuleType)
        .default
      this.on(event.event, event.run)
    }
  }

  async init(): Promise<void> {
    await this.#registerEvents()
    await this.login(this.#token)
  }
}
