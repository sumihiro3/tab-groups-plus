/**
 * 指定文字列を圧縮する
 * @param target 圧縮対象の文字列
 * @returns 圧縮された文字列
 */
export const compress = async (target: string): Promise<string> => {
  const arrayBufferToBinaryString = (arrayBuffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(arrayBuffer);
    let binaryString = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binaryString += String.fromCharCode(bytes[i]);
    }
    return binaryString;
  };

  const blob = new Blob([target]);
  const stream = blob.stream();
  const compressedStream = stream.pipeThrough(
    new CompressionStream('deflate-raw'),
  );
  const buf = await new Response(compressedStream).arrayBuffer();
  const binaryString = arrayBufferToBinaryString(buf);
  const encodedByBase64 = btoa(binaryString);
  return encodedByBase64;
};

/**
 * 指定の圧縮文字列を解凍する
 * @param target 解凍対象の圧縮文字列
 * @returns 解凍された文字列
 */
export const decompress = async (target: string): Promise<string> => {
  const binaryStringToBytes = (str: string): Uint8Array => {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }
    return bytes;
  };

  const decodedByBase64 = atob(target);
  const bytes = binaryStringToBytes(decodedByBase64);
  const stream = new Blob([bytes]).stream();
  const decompressedStream = stream.pipeThrough(
    new DecompressionStream('deflate-raw'),
  );
  return await new Response(decompressedStream).text();
};

/**
 * 指定文字列のバイト数を取得する
 * @param str 圧縮文字列
 * @returns 文字列のバイト数
 */
export const byteCountFor = (str: string) => {
  return new Blob([str]).size;
};
