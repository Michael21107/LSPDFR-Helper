import { Command } from '@sapphire/framework';
import { ApplicationCommandType, ApplicationIntegrationType, Attachment, ContextMenuCommandType, Message, MessageContextMenuCommandInteraction } from 'discord.js';
import { EmbedCreator } from '../Functions/Messages/EmbedCreator';
import { Logger } from '../Functions/Messages/Logger';
import { Cache } from '../Cache';
import { ProcessCache } from '../CustomTypes/CacheTypes/ProcessCache';
import { RPHProcessor } from '../Functions/Processors/RPH/RPHProcessor';
import { RPHValidator } from '../Functions/Processors/RPH/RPHValidator';
import { Reports } from '../Functions/Messages/Reports';
import { XMLProcessor } from '../Functions/Processors/XML/XMLProcessor';
import { ELSProcessor } from '../Functions/Processors/ELS/ELSProcessor';
import { ELSValidator } from '../Functions/Processors/ELS/ELSValidator';
import { ASIProcessor } from '../Functions/Processors/ASI/ASIProcessor';
import { ASIValidator } from '../Functions/Processors/ASI/ASIValidator';

export class ValidateFilesCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { ...options, description: 'Validate the selected files.' });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerContextMenuCommand((builder) =>
      builder
        .setName('Validate Files')
        .setType(ApplicationCommandType.Message as ContextMenuCommandType)
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    );
  }

  public override async contextMenuRun(interaction: MessageContextMenuCommandInteraction) {
    const targetMessage: Message = interaction.targetMessage;
    const acceptedTypes = ['ragepluginhook', 'els', 'asiloader', '.xml', '.meta'];
    let attach: Attachment | undefined;

    if (targetMessage.attachments.size === 0) {
      // prettier-ignore
      await interaction.reply({embeds: [EmbedCreator.Error('__No File Found!__\r\n>>> The selected message must include a valid log type!\r\n- RagePluginHook.log\r\n- ELS.log\r\n- ScriptHookVDotNet.log\r\n- asiloader.log\r\n- .xml\r\n- .meta')], ephemeral: true});
      return;
    } else if (targetMessage.attachments.size === 1) {
      attach = targetMessage.attachments.first();

      if (!attach) {
        // prettier-ignore
        await interaction.reply({embeds: [EmbedCreator.Error('__No File Found!__\r\n>>> The selected message must include a valid log type!\r\n- RagePluginHook.log\r\n- ELS.log\r\n- ScriptHookVDotNet.log\r\n- asiloader.log\r\n- .xml\r\n- .meta')], ephemeral: true});
        return;
      }

      if (!acceptedTypes.some((x) => attach!.name.toLowerCase().includes(x))) {
        // prettier-ignore
        await interaction.reply({embeds: [EmbedCreator.Error('__No Valid File Found!__\r\n>>> The selected message must include a valid log type!\r\n- RagePluginHook.log\r\n- ELS.log\r\n- ScriptHookVDotNet.log\r\n- asiloader.log\r\n- .xml\r\n- .meta')], ephemeral: true});
        return;
      }

      if (attach.size / 1000000 > 10) {
        Reports.largeLog(interaction, attach, true);
        return;
      } else if (attach.size / 1000000 > 3) {
        Reports.largeLog(interaction, attach);
        return;
      }
    } else if (targetMessage.attachments.size > 1) {
      // prettier-ignore
      await interaction.reply({embeds: [EmbedCreator.Error('__Multiple Files Found!__\r\n>>> The selected message must include only a single valid log type! The multi selector is implimented yet.')], ephemeral: true});
      return;
    }

    await interaction.reply({ embeds: [EmbedCreator.Loading(`__Validating!__\r\n>>> The file is currently being processed. Please wait...`)], ephemeral: true });

    if (attach!.name.toLowerCase().endsWith('.xml') || attach!.name.toLowerCase().endsWith('.meta')) {
      const xmlProc = new XMLProcessor(attach!.url);
      await xmlProc.SendReply(interaction);
      return;
    }

    if (attach!.name.toLowerCase().includes('ragepluginhook')) {
      let rphProc: RPHProcessor;
      const cache = Cache.getProcess(targetMessage.id);
      if (ProcessCache.IsCacheAvailable(cache)) rphProc = cache!.Processor as RPHProcessor;
      else {
        rphProc = new RPHProcessor(await RPHValidator.validate(attach!.url), targetMessage.id);
        Cache.saveProcess(targetMessage.id, new ProcessCache(targetMessage, interaction, rphProc));
      }
      if (rphProc.log.logModified) return Reports.modifiedLog(interaction, attach!);
      await rphProc.SendReply(interaction).catch(async (e) => {
        await Logger.ErrLog(`Failed to process file!\r\n${e}`);
        await interaction.editReply({ embeds: [EmbedCreator.Error(`__Failed to process file!__\r\n>>> The error has been sent to the bot developer!`)] });
      });
      return;
    }

    if (attach!.name.toLowerCase().includes('els')) {
      let elsProc: ELSProcessor;
      const cache = Cache.getProcess(targetMessage.id);
      if (ProcessCache.IsCacheAvailable(cache)) elsProc = cache!.Processor as ELSProcessor;
      else {
        elsProc = new ELSProcessor(await ELSValidator.validate(attach!.url), targetMessage.id);
        Cache.saveProcess(targetMessage.id, new ProcessCache(targetMessage, interaction, elsProc));
      }
      await elsProc.SendReply(interaction).catch(async (e) => {
        await Logger.ErrLog(`Failed to process file!\r\n${e}`);
        await interaction.editReply({ embeds: [EmbedCreator.Error(`__Failed to process file!__\r\n>>> The error has been sent to the bot developer!`)] });
      });
      return;
    }

    if (attach!.name.toLowerCase().includes('asiloader')) {
      let asiProc: ASIProcessor;
      const cache = Cache.getProcess(targetMessage.id);
      if (ProcessCache.IsCacheAvailable(cache)) asiProc = cache!.Processor as ASIProcessor;
      else {
        asiProc = new ASIProcessor(await ASIValidator.validate(attach!.url), targetMessage.id);
        Cache.saveProcess(targetMessage.id, new ProcessCache(targetMessage, interaction, asiProc));
      }
      await asiProc.SendReply(interaction).catch(async (e) => {
        await Logger.ErrLog(`Failed to process file!\r\n${e}`);
        await interaction.editReply({ embeds: [EmbedCreator.Error(`__Failed to process file!__\r\n>>> The error has been sent to the bot developer!`)] });
      });
      return;
    }
  }
}
