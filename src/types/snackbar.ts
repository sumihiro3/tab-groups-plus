export interface Snackbar {
  /**
   * 表示するかのフラグ
   */
  show: boolean;
  /**
   * 表示するメッセージ
   */
  message: string;

  /**
   * 表示するメッセージの色
   */
  color: string;

  /**
   * 表示するメッセージのアイコン
   */
  // icon: string;

  /**
   * タイムアウトするまでの時間（秒数）
   */
  timeout: number;
}
