import { Color } from "../core/Color";
import { Texture } from "../core/Texture";

export class TextureUtils {

    public static make(name: string, width: number, height: number, color: Color): Texture {

        const data = [...new Array(32 * 32).keys()].map(() => color);
        return new Texture(name, width, height, data);
    }

    public static makeTestTexture(name: string, width: number, height: number): Texture {

        const texture = new Texture(name, width, height);

        for (let y = 0; y < height; y++) {

            for (let x = 0; x < width; x++) {

                let color = new Color(255, 255, 255);

                if (x == 0 && y != 0) color = Color.RED;

                if (y == 0 && x != 0) color = Color.GREEN;

                if (x == width - 1 && y != 0) color = Color.BLUE;

                if (y == height - 1 && x != 0) color = Color.ORANGE;

                if (
                    (x == 0 && y == 0)
                    || (x == width - 1 && y == 0)
                    || (x == 0 && y == height - 1)
                    || (x == width - 1 && y == height - 1)
                    || (x == y)
                    || (x == 2 && y == 1)
                    || (x == 1 && y == 2)
                ) color = Color.BLACK;

                texture.data[y * width + x] = color;
            }
        }

        return texture;
    }

    public static async loadTexture(filename: string, debugBorders: boolean = false): Promise<Texture> {

        return new Promise(
            (resolve, reject) => {

                fetch(filename)
                    .then(async result => {

                        const fileExt = filename.split('.').pop()?.toUpperCase();

                        let texture: Texture | null = null;

                        switch (fileExt) {

                            case 'JPG':
                            case 'PNG':

                                const bitmap = await createImageBitmap(await result.blob());

                                const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
                                const context = canvas.getContext('2d')!;
                                context.drawImage(bitmap, 0, 0);
                                var imageData = context.getImageData(0, 0, bitmap.width, bitmap.height);

                                texture = new Texture(filename, imageData.width, imageData.height);
                                texture.data = [];

                                const colorBytes = imageData.data.length / (imageData.width * imageData.height);

                                if (colorBytes != 4) {
                                    throw new Error('Not 4-byte color');
                                }

                                for (let index = 0; index < imageData.data.length; index += 4) {

                                    texture.data.push(new Color(
                                        imageData.data[index + 0],
                                        imageData.data[index + 1],
                                        imageData.data[index + 2],
                                        imageData.data[index + 3]
                                    ));
                                }

                                break;
                        }

                        if (texture && debugBorders) {

                            for (let x = 0; x < texture.width; x++) {

                                texture.drawPixel(x, 0, Color.BLACK);
                                texture.drawPixel(x, texture.height - 1, Color.BLACK);
                            }

                            for (let y = 0; y < texture.height; y++) {

                                texture.drawPixel(0, y, Color.BLACK);
                                texture.drawPixel(texture.width - 1, y, Color.BLACK);
                            }

                            texture.drawPixel(1, 1, Color.RED);
                            texture.drawPixel(texture.width - 2, texture.height - 2, Color.GREEN);
                        }

                        if (texture) {
                            return resolve(texture);
                        }

                        throw new Error();
                    })
                    .catch(() => {
                        alert(`Error loading texture: ${filename}.`);
                        reject();
                    });
            }
        );
    }

    public static drawDebugBorders(texture: Texture): void {

        for (let y = 0; y < texture.height; y++) {
            for (let x = 0; x < texture.width; x++) {

                const index = y * texture.width + x;

                if (x == 0 && y != 0) texture.data[index] = Color.RED;

                if (y == 0 && x != 0) texture.data[index] = Color.GREEN;

                if (x == texture.width - 1 && y != 0) texture.data[index] = Color.BLUE;

                if (y == texture.height - 1 && x != 0) texture.data[index] = Color.ORANGE;

                if (
                    (x == 0 && y == 0)
                    || (x == texture.width - 1 && y == 0)
                    || (x == 0 && y == texture.height - 1)
                    || (x == texture.width - 1 && y == texture.height - 1)
                    || (x == y)
                    || (x == 2 && y == 1)
                    || (x == 1 && y == 2)
                ) texture.data[index] = Color.BLACK;

            }
        }
    }
}
