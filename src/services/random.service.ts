import Rand from "rand-seed";

export class RandomService {
    rand = new Rand();

    public seed(seed?: string) {
        this.rand = new Rand(seed);
    }

    public random() {
        return this.rand.next();
    }

    pick<T>(item: T[]) {
        return item[Math.floor(this.random() * item.length)];
    }

    pickWeighted<T>(items: {item: T, weight: number}[]) {
        const totalWeight = items.reduce((acc, item) => acc + item.weight, 0);
        const random = this.random() * totalWeight;
        let currentWeight = 0;
        for (const item of items) {
            currentWeight += item.weight;
            if (currentWeight >= random) {
                return item.item;
            }
        }
        return items[items.length - 1].item;
    }

    randomId(prefix: string = "", length: number = 8) {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let id = prefix;
        for (let i = 0; i < length; i++) {
            id += chars.charAt(Math.floor(this.random() * chars.length));
        }
        return id;
    }
}

export const randomService = new RandomService();