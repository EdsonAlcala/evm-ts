/* tslint:disable */
import { Opcode, notImplementedError } from "./common";
import { IEnvironment, IMachineState } from "../VM";

export class LoadCallData extends Opcode {
  static id = 0x35;
  static type = "CALLDATALOAD";

  run(_state: IMachineState): void {
    // const readIndex = getIndex(state.stack, -1);
    // const data = bitsToNumber(environment.slice(readIndex, readIndex + 32));

    // return {
    //   ...state,
    //   stack: [...state.stack.slice(0, -1), data],
    // };

    notImplementedError()
  }
}

export class CallValueOpcode extends Opcode {
  static id = 0x34;
  static type = "CALLVALUE";

  run(state: IMachineState, env: IEnvironment): void {
    state.stack.push(env.value);
    state.pc += 1;
  }
}

export class CallDataSizeOpcode extends Opcode {
  static id = 0x36;
  static type = "CALLDATASIZE";

  run(state: IMachineState, env: IEnvironment): void {
    notImplementedError()
  }
}
