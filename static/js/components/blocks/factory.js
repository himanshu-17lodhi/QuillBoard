import { TextBlock } from './text.js';
import { HeadingBlock } from './heading.js';
import { ListBlock } from './list.js';
import { CodeBlock } from './code.js';
import { ImageBlock } from './image.js';

export class BlockFactory {
    constructor() {
        this.blockTypes = {
            text: TextBlock,
            heading: HeadingBlock,
            list: ListBlock,
            code: CodeBlock,
            image: ImageBlock
        };
    }

    createBlock(type, options = {}) {
        const BlockClass = this.blockTypes[type];
        if (!BlockClass) {
            throw new Error(`Unknown block type: ${type}`);
        }
        return new BlockClass(options);
    }

    registerBlockType(type, blockClass) {
        this.blockTypes[type] = blockClass;
    }
}