import {resolveResource} from "@tauri-apps/api/path";
import {readTextFile} from "@tauri-apps/plugin-fs";
import {randomService} from "./random.service.ts";

type WeightedString = {
    item: string;
    weight: number;
}

type Node = ConcatActionNode | CapitalizeActionNode | string;

type ConcatActionNode = {
    action: "concat";
    left: Node;
    right: Node;
}

type CapitalizeActionNode = {
    action: "capitalize";
    value: Node;
}

type Generator = {
    name: string;
    generator?: Node;
    rpn?: string[]; // Reverse Polish Notation
    data: {
        [key: string]: string[] | WeightedString[];
    };
}

class GeneratorService {
    generatorCache = new Map<string, Generator>();

    async cacheGenerators() {
        const resourcePath = await resolveResource("generators/generators.json");
        const files = JSON.parse(await readTextFile(resourcePath));
        for (const file of files) {
            const generator = JSON.parse(await readTextFile(await resolveResource(`generators/${file}.json`)));
            this.generatorCache.set(file, generator);
        }
    }

    async generate(type: string) {
        if (!this.generatorCache.has(type)) {
            const resourcePath = await resolveResource(`generators/${type}.json`);
            const generator = JSON.parse(await readTextFile(resourcePath));
            this.generatorCache.set(type, generator);
        }

        const generatorData = this.generatorCache.get(type);
        return this.generateData(generatorData);
    }

    generateData(generatorData: Generator) {
        if (generatorData.rpn)  {
            return this.generateRpn(generatorData);
        } else if (generatorData.generator) {
            return this.generateNode(generatorData.generator, generatorData.data);
        } else {
            return "INVALID GENERATOR";
        }
    }

    generateRpn(generatorData: Generator) {
        const stack: string[] = [];
        for (const node of generatorData.rpn) {
            if (typeof node === "string") {
                if (node.startsWith("$")) {
                    const strings = generatorData.data[node];
                    if (Array.isArray(strings)) {
                        stack.push(<string>randomService.pick(strings));
                        continue;
                    }
                }
            }

            switch (node) {
                case "concat":
                    const right = stack.pop();
                    const left = stack.pop();
                    stack.push(left + right);
                    break;
                case "capitalize":
                    const value = stack.pop();
                    stack.push(value.charAt(0).toUpperCase() + value.slice(1));
                    break;
                default:
                    stack.push(node);
            }
        }

        return stack.join("");
    }

    generateNode(node: Node, data: {[key: string]: string[] | WeightedString[]}): string {
        if (typeof node === "string") {
            if (node.startsWith("$")) {
                const strings = data[node];
                if (Array.isArray(strings)) {
                    return <string>randomService.pick(strings);
                }
            }

            return node;
        }

        switch (node.action) {
            case "concat":
                return this.generateConcatNode(node, data);
            case "capitalize":
                return this.generateCapitalizeNode(node, data);
        }
    }

    generateConcatNode(node: ConcatActionNode, data: {[key: string]: string[] | WeightedString[]}): string {
        const left = this.generateNode(node.left, data);
        const right = this.generateNode(node.right, data);
        return left + right;
    }

    generateCapitalizeNode(node: CapitalizeActionNode, data: {[key: string]: string[] | WeightedString[]}): string {
        const value = this.generateNode(node.value, data);
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
}

export const generatorService = new GeneratorService();