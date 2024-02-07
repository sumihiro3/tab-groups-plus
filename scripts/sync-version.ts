import * as fs from 'fs';

/**
 * manifest.json のバージョンを package.json のバージョン番号と同期させる
 */
const syncManifestVersion = () => {
  // package.json のバージョン番号を取得する
  const packageVersion = process.env.npm_package_version;
  if (!packageVersion) {
    throw new Error('package.json からバージョン番号を取得できませんでした');
  }
  // マニフェストファイルを読み込む
  const manifestJson = JSON.parse(fs.readFileSync('./manifest.json', 'utf-8'));
  // バージョン番号を取得する
  const manifestVersion = manifestJson.version as string;
  // バージョン番号を更新する
  if (packageVersion !== manifestVersion) {
    manifestJson.version = packageVersion;
    // マニフェストファイルを更新する
    fs.writeFileSync('./manifest.json', JSON.stringify(manifestJson, null, 2));
    console.log(
      `manifest.json のバージョンを ${packageVersion} に更新しました`,
    );
  } else {
    console.log(
      `manifest.json のバージョン [${manifestVersion}] は package.json と合致しています`,
    );
  }
};

syncManifestVersion();
