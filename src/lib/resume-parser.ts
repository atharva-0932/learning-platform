// @ts-ignore
if (typeof Promise.withResolvers === 'undefined') {
    // @ts-ignore
    Promise.withResolvers = function () {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    };
}

// @ts-ignore
if (typeof global.DOMMatrix === 'undefined') {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {
        a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
        is2D = true;
        constructor() { }
        translate() { return this; }
        scale() { return this; }
        transform() { return this; }
        multiply() { return this; }
        toString() { return "matrix(1, 0, 0, 1, 0, 0)"; }
    };
}

// @ts-ignore
const { PDFParse } = require('pdf-parse');

export async function parseResume(buffer: Buffer): Promise<string> {
    try {
        const parser = new PDFParse({ data: buffer });
        const data = await parser.getText();
        return data.text;
    } catch (error) {
        console.error('Error parsing resume PDF:', error);
        throw new Error('Failed to parse resume content');
    }
}
