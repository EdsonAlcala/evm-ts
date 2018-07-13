import { Opcode, notImplementedError } from "./common";
import { IMachineState } from "../VM";
import { BN } from "bn.js";

export class StopOpcode extends Opcode {
  static id = 0x00;
  static type = "STOP";

  run(state: IMachineState): void {
    state.stopped = true;
  }
}

export class RevertOpcode extends Opcode {
  static id = 0xfd;
  static type = "REVERT";

  run(state: IMachineState): void {
    state.stopped = true;
    // @todo: proper impl
  }
}

export class ReturnOpcode extends Opcode {
  static id = 0xf3;
  static type = "RETURN";

  run(state: IMachineState): void {
    const offset = state.stack.pop().toNumber();
    const size = state.stack.pop().toNumber();

    const ret = new BN(state.memory.slice(offset, size));

    state.return = ret.toArray();
    state.stopped = true;
  }
}

export class BlockHashOpcode extends Opcode {
  static id = 0x40;
  static type = "BLOCKHASH";

  run(_state: IMachineState): void {
    notImplementedError();
  }
}

export class Sha3Opcode extends Opcode {
  static id = 0x20;
  static type = "SHA3";

  run(_state: IMachineState): void {
    notImplementedError();
  }
}
