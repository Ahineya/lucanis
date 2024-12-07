import {BaseDirectory, writeTextFile, readTextFile, exists} from '@tauri-apps/plugin-fs';

class ConfigService {
    async createAppDir() {
        // await mkdir("com.lucanis.app", {
        //     baseDir: BaseDirectory.AppData,
        // });
        // await createDir(await appDataDir());
    }

    async writeConfigFile(data: string) {
        await this.createAppDir();
        await writeTextFile('config.json', data, {
            baseDir: BaseDirectory.AppData,
        });
    }

    async readConfigFile() {
        try {
            if (await exists('config.json', {
                baseDir: BaseDirectory.AppData
            })) {
                return await readTextFile('config.json', {
                    baseDir: BaseDirectory.AppData
                });
            } else {
                return null;
            }
        } catch {
            return null;
        }
    }

    async writeFile(name: string, data: string) {
        await this.createAppDir();
        await writeTextFile(name, data, {
            baseDir: BaseDirectory.AppData,
        });
    }

    async readFile(name: string) {
        try {
            if (await exists(name, {
                baseDir: BaseDirectory.AppData
            })) {
                return await readTextFile(name, {
                    baseDir: BaseDirectory.AppData
                });
            } else {
                return null;
            }
        } catch {
            return null;
        }
    }
}

export const configService = new ConfigService();