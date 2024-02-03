import { ExtensionOptions } from '../../types';
import {
  ExtensionOptionsGetError,
  ExtensionOptionsSaveError,
} from '../../types/errors';
import {
  getBooleanValueFromSyncStorage,
  setBooleanValueToSyncStorage,
} from '../chrome/storage';

/**
 * 拡張機能のオプションを取得する
 */
export const getExtensionOptions = async (): Promise<ExtensionOptions> => {
  console.debug('getExtensionOptions called!');
  try {
    const options: ExtensionOptions = {
      removeSavedTabGroupWhenRestore: await getBooleanValueFromSyncStorage(
        'removeSavedTabGroupWhenRestore',
      ),
      reloadOnHighlight:
        await getBooleanValueFromSyncStorage('reloadOnHighlight'),
      overwriteTabGroup:
        await getBooleanValueFromSyncStorage('overwriteTabGroup'),
      openInNewWindow: await getBooleanValueFromSyncStorage('openInNewWindow'),
      showUnGroupedTabs:
        await getBooleanValueFromSyncStorage('showUnGroupedTabs'),
    };
    return options;
  } catch (error) {
    console.error(error);
    throw new ExtensionOptionsGetError(`拡張機能設定の取得に失敗しました`, {
      cause: error,
    });
  }
};

/**
 * 拡張機能のオプションをセットする
 * @param options オプション
 */
export const setExtensionOptions = async (
  options: ExtensionOptions,
): Promise<void> => {
  console.debug(
    `setExtensionOptions called! [options: ${JSON.stringify(options)}]`,
  );
  try {
    // removeSavedTabGroupWhenRestore
    await setBooleanValueToSyncStorage(
      'removeSavedTabGroupWhenRestore',
      options.removeSavedTabGroupWhenRestore,
    );
    // reloadOnHighlight
    await setBooleanValueToSyncStorage(
      'reloadOnHighlight',
      options.reloadOnHighlight,
    );
    // overwriteTabGroup
    await setBooleanValueToSyncStorage(
      'overwriteTabGroup',
      options.overwriteTabGroup,
    );
    // openInNewWindow
    await setBooleanValueToSyncStorage(
      'openInNewWindow',
      options.openInNewWindow,
    );
    // showUnGroupedTabs
    await setBooleanValueToSyncStorage(
      'showUnGroupedTabs',
      options.showUnGroupedTabs,
    );
  } catch (error) {
    console.error(error);
    throw new ExtensionOptionsSaveError(`拡張機能設定の保存に失敗しました`, {
      cause: error,
    });
  }
};
