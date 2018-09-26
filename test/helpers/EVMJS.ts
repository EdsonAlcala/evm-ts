import * as VMJS from "ethereumjs-vm";
import * as Transaction from "ethereumjs-tx";
import * as Trie from "merkle-patricia-tree";
import * as Account from "ethereumjs-account";
import * as utils from "ethereumjs-util";

import { IEnvironment } from "../../lib/VM";
import { IExternalTransaction, ITransactionResult } from "lib/FakeBlockchain";
import invariant = require("invariant");
const keyPair = require("./keyPair");

export class EVMJS {
  private nonce = 0;
  public readonly vm: any;
  private stateTrie = new Trie();

  constructor() {
    this.vm = new VMJS({ state: this.stateTrie });
  }

  public async setup(): Promise<void> {
    return new Promise<void>(res => {
      const publicKeyBuf = Buffer.from(keyPair.publicKey, "hex");
      const address = utils.pubToAddress(publicKeyBuf, true);

      const account = new Account();
      account.balance = "0xf00000000000000001";

      this.stateTrie.put(address, account.serialize(), res);
    });
  }

  public async runCode(code: string, env: Partial<IEnvironment> = {}): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      const data = env.data && Buffer.from(env.data as any);

      try {
        this.vm.runCode(
          {
            code: Buffer.from(code, "hex"),
            // data: Buffer.from("0x0", "hex"),
            data,
            value: env.value,
            gasLimit: Buffer.from("ffffffff", "hex"),
          },
          (err: Error | undefined, results: any) => {
            if (err) {
              reject(err);
              return;
            }

            resolve(results);
          },
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  public async runTx(transaction: IExternalTransaction): Promise<ITransactionResult> {
    invariant(transaction.data, "Tx data is required");

    if (!transaction.data!.startsWith("0x")) {
      return this.runTx({
        data: "0x" + transaction.data!,
        to: transaction.to,
        value: transaction.value,
      });
    }

    const nonce = "0x" + this.nonce.toString(16);
    this.nonce += 1; // advance nonce for next tx;

    const tx = new Transaction({
      data: transaction.data,
      value: transaction.value,
      to: transaction.to,
      nonce,
      gasPrice: "0x09184e72a000",
      gasLimit: "0x90710",
    });

    tx.sign(Buffer.from(keyPair.secretKey, "hex"));

    return new Promise<any>(async (resolve, reject) => {
      try {
        this.vm.runTx(
          {
            tx: tx,
          },
          (err: Error | undefined, results: any) => {
            if (err) {
              reject(err);
              return;
            }

            // @todo translating evmjs result to our internal type is not fully done
            resolve({
              account: {},
              runState: {},
              accountCreated: results.createdAddress && `0x${results.createdAddress.toString("hex")}`,
            });
          },
        );
      } catch (e) {
        reject(e);
      }
    });
  }
}
