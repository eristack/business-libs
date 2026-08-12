type Extractor = (
  text: string,
  options: { pooling: "mean"; normalize: boolean },
) => Promise<{ data: Float32Array | number[] }>;

let pipelinePromise: Promise<Extractor> | null = null;
let activeModel = "";

async function getPipeline(model: string): Promise<Extractor> {
  if (!pipelinePromise || activeModel !== model) {
    activeModel = model;
    const loading = (async () => {
      try {
        const { pipeline } = await import("@xenova/transformers");
        return pipeline("feature-extraction", model) as Promise<Extractor>;
      } catch (error) {
        pipelinePromise = null;
        activeModel = "";
        throw error;
      }
    })();
    pipelinePromise = loading;
  }
  return pipelinePromise;
}

export async function embedTexts(
  texts: string[],
  model: string,
): Promise<Float32Array[]> {
  if (texts.length === 0) return [];
  const extractor = await getPipeline(model);
  const out: Float32Array[] = [];
  for (const text of texts) {
    const result = await extractor(text, {
      pooling: "mean",
      normalize: true,
    });
    const data = result.data as Float32Array | number[];
    out.push(data instanceof Float32Array ? data : Float32Array.from(data));
  }
  return out;
}

export function vectorToBuffer(vector: Float32Array): Buffer {
  return Buffer.from(vector.buffer, vector.byteOffset, vector.byteLength);
}

export function bufferToVector(buffer: Buffer): Float32Array {
  return new Float32Array(
    buffer.buffer,
    buffer.byteOffset,
    buffer.byteLength / Float32Array.BYTES_PER_ELEMENT,
  );
}

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  for (let i = 0; i < n; i++) dot += (a[i] ?? 0) * (b[i] ?? 0);
  return dot;
}
