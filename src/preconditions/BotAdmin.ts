import { AllFlowsPrecondition } from '@sapphire/framework';
import type { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';
import { Cache } from '../Cache';

export class BotAdminPrecondition extends AllFlowsPrecondition {
  public override chatInputRun(interaction: ChatInputCommandInteraction) {
    return this.checkAdmin(interaction.user.id);
  }

  public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
    return this.checkAdmin(interaction.user.id);
  }

  public override messageRun(message: Message) {
    return this.checkAdmin(message.author.id);
  }

  private async checkAdmin(userId: string) {
    const usr = Cache.getUser(userId);
    if (!usr) return this.ok();
    return usr.botAdmin === true ? this.ok() : this.error({ message: '__No Permission__\r\n>>> You do not have permission to use this command!' });
  }
}
