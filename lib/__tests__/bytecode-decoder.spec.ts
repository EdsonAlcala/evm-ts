import { expect } from "chai";

import bytecodeDecoder from "../bytecode-decoder";
import { PushOpcode } from "../opcodes";
import { byteStringToNumberArray } from "../utils/bytes";

describe("BytecodeDecoder", () => {
  it("should decode push operation", () => {
    const input = "7f4e616d6552656700000000000000000000000000000000000000000000000000";
    const expected = [
      new PushOpcode(32, byteStringToNumberArray("4e616d6552656700000000000000000000000000000000000000000000000000")),
    ];

    expect(bytecodeDecoder(input)).to.be.deep.eq(expected);
  });

  it("should not decode malformed push opcode", () => {
    const input = "60";
    const expected = "Decoding PUSH failed at 1 byte of the bytecode";

    expect(() => bytecodeDecoder(input)).to.throw(Error, expected);
  });

  it("should not decode malformed opcodes", () => {
    const input = "606";
    const expected = "Byte string cannot be properly read as bytes.";

    expect(() => bytecodeDecoder(input)).to.throw(Error, expected);
  });

  it("should not decode unknown opcode", () => {
    const input = "fe";
    const expected = "Unknown opcode: 0xfe at 0 byte of the bytecode";

    expect(() => bytecodeDecoder(input)).to.throw(Error, expected);
  });
});
