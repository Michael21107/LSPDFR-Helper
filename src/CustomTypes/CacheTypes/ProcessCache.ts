import { addMinutes } from 'date-fns';
import { Interaction, Message } from 'discord.js';
import { Logger } from '../../Functions/Messages/Logger';
import { ProcessorType } from '../../Cache';

export class ProcessCache<T extends ProcessorType> {
  public Expire = addMinutes(new Date(), 15);
  public OriginalMessage!: Message;
  public Interaction: Interaction;
  public Processor: T;

  constructor(originalMessage: Message, interaction: Interaction, processor: T) {
    this.Interaction = interaction;
    this.OriginalMessage = originalMessage;
    this.Processor = processor;
  }

  public Update(newCache: ProcessCache<T>): ProcessCache<T> {
    if ((this.OriginalMessage ?? newCache.OriginalMessage) != undefined && this.OriginalMessage.id != newCache.OriginalMessage.id) {
      Logger.ErrLog(`Attempted to update process cache that belongs to a different message!\r\n${this}`);
      return this;
    }

    this.OriginalMessage = newCache.OriginalMessage ?? this.OriginalMessage;
    this.Processor = newCache.Processor ?? this.Processor;
    this.Expire = addMinutes(new Date(), 5);
    return this;
  }

  public static IsCacheAvailable(cache: ProcessCache<ProcessorType> | undefined): boolean {
    if (!cache || !cache.Processor || !cache.Processor.log || !cache.OriginalMessage) return false;
    return true;
  }
}
