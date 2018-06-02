import { Opcode } from "./base";
import { Environment, IMachineState } from "../bytecode-runner";

export class PushOpcode extends Opcode {
  static id = 0x60;
  static type = "PUSH1";

  constructor(public arg: number) {
    super();

    // @todo handle undefined cases with helpers (lodash?, require?)
    if (arg === undefined) {
      throw new Error("Argument to PUSH opcode is missing!");
    }
  }

  run(_env: Environment, state: IMachineState): IMachineState {
    return {
      ...state,
      stack: [...state.stack, this.arg],
      pc: state.pc + 1,
    };
  }
}
