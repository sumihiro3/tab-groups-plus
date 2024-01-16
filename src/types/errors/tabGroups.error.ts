import { ErrorBase, ErrorOptions } from './base.error';

/**
 *  タブグループの保存時エラーを表すエラークラス
 */
export class TabGroupsSaveError extends ErrorBase {
  override name = 'TabGroupsSaveError';
  constructor(message: string, options?: ErrorOptions) {
    super(message);
    this.cause = options?.cause;
  }
}

/**
 * タブグループの取得時エラーを表すエラークラス
 */
export class TabGroupsGetError extends TabGroupsSaveError {
  override name = 'TabGroupsGetError';
  constructor(message: string, options?: ErrorOptions) {
    super(message);
    this.cause = options?.cause;
  }
}
