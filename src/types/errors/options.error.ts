import { ErrorBase, ErrorOptions } from './base.error';

/**
 *  拡張機能設定への値の保存時エラーを表すエラークラス
 */
export class ExtensionOptionsSaveError extends ErrorBase {
  override name = 'ExtensionOptionsSaveError';
  constructor(message: string, options?: ErrorOptions) {
    super(message);
    this.cause = options?.cause;
  }
}

/**
 * 拡張機能設定の値の取得時エラーを表すエラークラス
 */
export class ExtensionOptionsGetError extends ExtensionOptionsSaveError {
  override name = 'ExtensionOptionsGetError';
  constructor(message: string, options?: ErrorOptions) {
    super(message);
    this.cause = options?.cause;
  }
}
