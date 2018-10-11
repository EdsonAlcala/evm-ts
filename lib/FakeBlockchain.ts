import { BN } from "bn.js";
import * as invariant from "invariant";
import { Dictionary } from "ts-essentials";
import * as ethUtil from "ethereumjs-util";

import { VM } from "./VM";
import { IAccount, ITransaction, ITransactionResult, IBlockchain } from "./types";
import { isString } from "util";
import { LayeredMap } from "./utils/LayeredMap";

export class FakeBlockchain implements IBlockchain {
  public readonly vm = new VM(this);
  public accounts: Dictionary<IAccount> = {};

  public getAddress(_address: string): IAccount {
    const address = _address.startsWith("0x") ? _address.slice(2) : _address;
    const account = this.accounts[address];

    if (!account) {
      return this.createNewAccount(address);
    }
    return account;
  }

  private createNewAccount(fromAccount: IAccount): IAccount;
  private createNewAccount(desiredAddress: string): IAccount;
  private createNewAccount(fromAccountOrDesiredAccount: IAccount | string): IAccount {
    let address: string;
    if (isString(fromAccountOrDesiredAccount)) {
      address = fromAccountOrDesiredAccount;
    } else {
      // @todo reimplement ethUtils in TS
      address = ethUtil
        .generateAddress(
          new BN(fromAccountOrDesiredAccount.address, 16).toArray(),
          new BN(fromAccountOrDesiredAccount.nonce).toArray(),
        )
        .toString("hex");
      fromAccountOrDesiredAccount.nonce += 1;
    }

    const account: IAccount = {
      address,
      nonce: 0,
      value: new BN(0),
      code: [],
      storage: new LayeredMap(),
    };

    this.accounts[account.address] = account;

    return account;
  }

  public runTx(tx: ITransaction): ITransactionResult {
    invariant(tx.data || tx.to || tx.value || tx.from, "Tx is empty");

    const fromAccount = this.getAddress(tx.from);

    const deployingNewContract = !tx.to;

    const account = deployingNewContract ? this.createNewAccount(fromAccount) : this.getAddress(tx.to!);
    invariant(account, `Account ${tx.to} not found!`);

    const codeToExecute = (deployingNewContract ? tx.data : account.code)!;
    const dataToSend = (deployingNewContract ? [] : tx.data)!;

    const result = this.vm.runCode({
      account: account,
      caller: fromAccount,
      code: codeToExecute,
      data: dataToSend,
      value: tx.value!,
      depth: 0,
    });

    if (deployingNewContract) {
      invariant(result.state.return, "Contract deploy should RETURN code!");
      account.code = result.state.return!;
    }

    return {
      account,
      runState: result.state,
      accountCreated: deployingNewContract ? "0x" + account.address : undefined,
    };
  }
}
