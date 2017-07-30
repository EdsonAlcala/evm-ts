import * as invariant from 'invariant';
import {chunk, Dictionary, keyBy} from 'lodash';
import * as opcodes from './opcodes'

const opcodesById: Dictionary<new () => opcodes.Opcode> = keyBy(opcodes as any, 'id');

export default function bytecodeDecoder(bytecode: string): opcodes.Opcode[] {
    invariant(bytecode.length % 2 === 0, "Bytecode cannot be properly read as bytes.");

    const bytes: number[] = chunk(bytecode.split(''), 2).map(byte => parseInt(`${byte[0]}${byte[1]}`, 16));

    const bytesIterator = bytes[Symbol.iterator]();

    let opcodes: opcodes.Opcode[] = [];
    let byte = bytesIterator.next();
    while (!byte.done) {
        opcodes.push(decodeOpcode(byte.value, bytesIterator));
        byte = bytesIterator.next();
    }
    return opcodes;
}

function decodeOpcode(opcodeByte: number, bytes: Iterator<number>): opcodes.Opcode {
    const OpcodeClass = opcodesById[opcodeByte.toString()];

    if (!OpcodeClass) {
        throw new Error(`Unrecognized opcode: ${opcodeByte.toString(16)}`)
    }

    if (OpcodeClass as any === opcodes.PushOpcode) {
        return new opcodes.PushOpcode(bytes.next().value);
    }

    return new OpcodeClass()
}