import {createDecipheriv} from "crypto";
import {Buffer} from 'buffer';
import {inflateRawSync} from 'zlib';

export default class MargERPEncryption {
    private static readonly key = process.env.MargERP_Encryption_KEY as string;

    public static decodeAndDecompress(data: string, key: string = this.key): string {
        key = key.padEnd(16, "\0")
        const decoded = this.decrypt(data, key);
        const decompressed = this.decompress(decoded).trim();
        const result = JSON.parse(decompressed);
        return result;
    }

    private static decrypt(data: string, key: string): string {
        const rijndaelCipher = createDecipheriv("aes-128-cbc", key, key);

        const encryptedData = Buffer.from(data, "base64");

        let plainText = rijndaelCipher.update(encryptedData);
        plainText = Buffer.concat([plainText, rijndaelCipher.final()]);

        return plainText.toString("utf-8");
    }

    private static decompress(data: string): string {
        const input = Buffer.from(data, 'base64');
        const uncompressed = inflateRawSync(input);
        return uncompressed.toString('utf8');
    }
}
