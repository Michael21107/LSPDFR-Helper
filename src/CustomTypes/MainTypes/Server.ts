import { container } from '@sapphire/framework';
import { Guild } from 'discord.js';

export class Server {
  id: string;
  name?: string;
  ownerId?: string;
  enabled?: boolean = true;
  banned?: boolean = false;
  autoSupport?: boolean = true;
  ahCases: boolean = true;
  ahChId?: string;
  ahMonChId?: string;
  announceChId?: string;
  updateChId?: string;

  constructor(id: string = '') {
    this.id = id;
  }

  clone(): Server {
    return Object.assign(new Server(), JSON.parse(JSON.stringify(this)));
  }

  getGuild(): Guild | undefined {
    return container.client.guilds.cache.filter((x) => x.id === this.id).first();
  }
}
