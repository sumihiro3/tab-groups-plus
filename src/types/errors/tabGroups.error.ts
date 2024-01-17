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
 * タブグループ内容の圧縮時エラーを表すエラークラス
 */
export class TabGroupsCompressError extends TabGroupsSaveError {
  override name = 'TabGroupsCompressError';
  constructor(message: string, options?: ErrorOptions) {
    super(message);
    this.cause = options?.cause;
  }
}

/**
 * タブグループ保存サイズが上限を超えた場合のエラーを表すエラークラス
 */
export class TabGroupStorageCapacityExceededError extends TabGroupsSaveError {
  override name = 'TabGroupStorageCapacityExceededError';
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
