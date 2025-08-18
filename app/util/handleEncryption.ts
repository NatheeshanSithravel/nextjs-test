
export async function encryptData(plainData: string, encryptionKey: string) {
  const initVector = crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(plainData);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    Buffer.from(encryptionKey, "base64"),
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: initVector,
    },
    cryptoKey,
    encodedData
  );

  return {
    encryptedData: Buffer.from(encryptedData).toString("base64"),
    initVector: Buffer.from(initVector).toString("base64"),
  };
}

export async function handleEncryption(data: any) {
  return await encryptData(
    JSON.stringify({ data }),
    process.env.NEXT_PUBLIC_SECRET_KEY!
  );
}

export async function decryptData(
  encryptedData: string,
  initVector: string,
  encryptionKey: string
) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    Buffer.from(encryptionKey, "base64"),
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

  try {
    const decodedData = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: Buffer.from(initVector, "base64"),
      },
      cryptoKey,
      Buffer.from(encryptedData, "base64")
    );

    return new TextDecoder().decode(decodedData);
  } catch (error) {
    return JSON.stringify({ payload: null });
  }
}

export async function handleDecryption({ encryptedData, initVector }: any) {
  const decryptedString = await decryptData(
    encryptedData!,
    initVector!,
    process.env.NEXT_PUBLIC_SECRET_KEY!
  );

  const responseData = JSON.parse(decryptedString)?.data;

  return responseData;
}
