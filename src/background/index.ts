const AUTO_SAVE_ALARM_NAME = 'auto-save-alarm';

async function checkAlarmState() {
  console.log('checkAlarmState start!');
  const alarm = await chrome.alarms.get(AUTO_SAVE_ALARM_NAME);

  if (!alarm) {
    await chrome.alarms.create(AUTO_SAVE_ALARM_NAME, {
      periodInMinutes: 1,
      delayInMinutes: 1,
    });
  }
}

checkAlarmState();

/**
 * Chrome のアラームが発火したことを検知して実行される
 */
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('alarm onAlarm', alarm);
});

/**
 * Chrome のタブグループが作成されたことを検知して実行される
 */
chrome.tabGroups.onCreated.addListener((tabGroup) => {
  console.log('tabGroup onCreated', tabGroup);
});

/**
 * Chrome のタブグループが更新されたことを検知して実行される
 */
chrome.tabGroups.onUpdated.addListener((tabGroup) => {
  console.log('tabGroup onUpdated', tabGroup);
  // タブグループに属するタブを取得する
  // chrome.tabs.query({ groupId: tabGroup.id }, (tabs) => {
  //   // タブグループに属するタブ
  //   for (const tab of tabs) {
  //     console.log('updated tabGroup tab', tab);
  //   }
  // });
});

/**
 * Chrome のタブグループが削除されたことを検知して実行される
 */
chrome.tabGroups.onRemoved.addListener((tabGroup) => {
  console.log('tabGroup onRemoved', tabGroup);
  // // タブグループに属するタブを取得する
  // chrome.tabs.query({ groupId: tabGroup.id }, (tabs) => {
  //   // タブグループに属するタブをすべて削除する
  //   for (const tab of tabs) {
  //     console.log('removed tab', tab);
  //   }
  // });
});

/**
 * Chrome のタブが更新されたことを検知して実行される
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const { status } = changeInfo;
  if (status !== 'complete') {
    return;
  }
  console.log('tab onUpdated', tabId, changeInfo, tab);
  // タブがタブグループに属している場合は、タブグループを取得する
  if (tab.groupId > 0) {
    chrome.tabGroups.get(tab.groupId, (tabGroup) => {
      console.log(`tabGroup of tab[${tab.id}]`, tabGroup);
    });
  }
});

/**
 * Chrome のタブが削除されたことを検知して実行される
 */
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  console.log('tab onRemoved', tabId, removeInfo);
});

/**
 * ウィンドウ内でタブが移動されたことを検知して実行される
 */
chrome.tabs.onMoved.addListener((tabId, moveInfo) => {
  console.log('tab onMoved', tabId, moveInfo);
});

/**
 * タブがウィンドウからデタッチされたことを検知して実行される
 * タブがウインドウ間を移動した場合も発火する
 */
chrome.tabs.onDetached.addListener((tabId, detachInfo) => {
  console.log('tab onDetached', tabId, detachInfo);
});

/**
 * 事前レンダリングまたは Instant によってタブが別のタブに置き換えられたことを検知して実行される
 */
chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
  console.log('tab onReplaced', addedTabId, removedTabId);
});

/**
 * ウィンドウ内のアクティブなタブが変更されたことを検知して実行される
 */
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('tab onActivated', activeInfo);
});
