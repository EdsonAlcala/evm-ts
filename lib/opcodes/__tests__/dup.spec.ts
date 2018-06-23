import { expect } from "chai";

import { compareWithReferentialImpl, runEvm } from "../../__tests__/helpers/compareWithReferentialImpl";

describe("DUP", () => {
  it("should work", () => compareWithReferentialImpl("60ff600081"));
  it("should fail on accessing not existing stack element", () => {
    expect(() => runEvm("81")).to.throw(
      "Error while running bytecode at 0: Tried to duplicate 2 element but stack has only 0 elements",
    );
  });
});
