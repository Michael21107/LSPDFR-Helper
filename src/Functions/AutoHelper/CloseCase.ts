import { Cache } from '../../Cache';
import { Case } from '../../CustomTypes/MainTypes/Case';
import { DBManager } from '../DBManager';
import { EmbedCreator } from '../Messages/EmbedCreator';

export abstract class CloseCase {
  static async Close(ac: Case, force: boolean = false): Promise<boolean> {
    if (!ac.open) return false;
    ac.open = false;
    ac.expireDate = new Date();
    DBManager.editCase(ac);
    Cache.updateCases((await DBManager.getCases()) ?? []);
    if (force) return true;

    const ch = ac.getAhChannel();
    if (!ch) return false;

    await ch.send({
      embeds: [EmbedCreator.Warning('___Thread has been archived!___\r\n>>> It is now closed to replies. If you need further help you may open a new case!')],
    });
    await ch.setLocked(true);
    await ch.setArchived(true);

    //TODO: Update Monitor
    return true;
  }
}
