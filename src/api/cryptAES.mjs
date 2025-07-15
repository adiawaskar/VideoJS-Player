import CryptoJS from "crypto-js";


// const jsonPayload = {"success":"2","message":"You are Logged in with Different devices.","data":[]}

// const roomKey = "ft3lb08nc3";

export function generateRandomKey(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function encrypt(data, pub_k, pvt_k) {
    const key = CryptoJS.SHA256(pvt_k).toString(CryptoJS.enc.Hex).slice(0, 32);
    const iv = CryptoJS.SHA256(pub_k).toString(CryptoJS.enc.Hex).slice(0, 32).slice(0, 16);

    const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    return encrypted.toString();
}

export function dypt(encryptedString, pub_k, pvt_k) {
    const encrypt_method = 'AES';

    const key = CryptoJS.SHA256(pvt_k).toString(CryptoJS.enc.Hex).slice(0, 32);
    const iv = CryptoJS.SHA256(pub_k).toString(CryptoJS.enc.Hex).slice(0, 32).slice(0, 16);


    try {
        const decrypted = CryptoJS.AES.decrypt(encryptedString, CryptoJS.enc.Utf8.parse(key), {
            iv: CryptoJS.enc.Utf8.parse(iv),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });

        const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
        if (!plaintext) throw new Error("Decryption returned empty string");

        return plaintext;
    } catch (err) {
        console.error("❌ Decryption error:", err.message);
        return false;
    }
}

export function get_encrypted_data(jsonData) {
    const pub_k = generateRandomKey(16);
    const pvt_k = generateRandomKey(16);

    const jsonString = JSON.stringify(jsonData);
    const encrypted = encrypt(jsonString, pub_k, pvt_k);

    const keyConcat = pub_k + pvt_k;
    const break0 = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex).slice(0, 32);
    const break1 = keyConcat;

    return break0 + break1 + encrypted;
}

export function get_room_encrypted_data(data) {
    const pub_k = generateRandomKey(5);
    const pvt_k = generateRandomKey(5);

    const encrypted = encrypt(data, pub_k, pvt_k);

    const keyChunk1 = pub_k + CryptoJS.lib.WordArray.random(5).toString(CryptoJS.enc.Hex).slice(0, 5);
    const keyChunk2 = CryptoJS.lib.WordArray.random(5).toString(CryptoJS.enc.Hex).slice(0, 5) + pvt_k;

    return keyChunk1 + keyChunk2 + encrypted;
}

// const encryptedJson = get_encrypted_data(jsonPayload);
// console.log("🔒 Encrypted JSON:");
// console.log(encryptedJson);

// const encryptedRoomKey = get_room_encrypted_data(roomKey);
// console.log("\n🔒 Encrypted Room Key:");
// console.log(encryptedRoomKey);

export function get_room_decrypted_key(encryp_json_string) {
    const breakArr = encryp_json_string.match(/.{1,10}/g);

    const key_data = breakArr[0].match(/.{1,5}/g);

    const key_data1 = breakArr[1].match(/.{1,5}/g);

    const pub_k = key_data[0];
    const pvt_k = key_data1[1];

    const verification_code = encryp_json_string.replace(breakArr[0] + breakArr[1], "");

    const ve_code = dypt(verification_code, pub_k, pvt_k);
    return ve_code;
}



export function get_decrypted_data(encryp_json_string) {

    const breakArr = encryp_json_string.match(/.{1,32}/g);
    if (!breakArr || breakArr.length < 2) {
        console.error("Invalid input format");
        return null;
    }

    const key_data = breakArr[1].match(/.{1,16}/g);
    if (!key_data || key_data.length < 2) {
        console.error("Invalid key data");
        return null;
    }

    const pub_k = key_data[0];
    const pvt_k = key_data[1];

    const verification_code = encryp_json_string.replace(breakArr[0] + breakArr[1], "");

    const decrypted_string = dypt(verification_code, pub_k, pvt_k);
    try {
        return JSON.parse(decrypted_string);
    } catch (e) {
        console.error("❌ JSON parse error:", e.message);
        return null;
    }
}


export function get__decryptLevel1(encrypted_string){
    // const breakArr = encryp_json_string.match(/.{1,32}/g);
    // if (!breakArr || breakArr.length < 2) {
    //     console.error("Invalid input format");
    //     return null;
    // }

    // const key_data = breakArr[1].match(/.{1,16}/g);
    // if (!key_data || key_data.length < 2) {
    //     console.error("Invalid key data");
    //     return null;
    // }

    const pub_k = encrypted_string.substring(0, 15);
    const pvt_k = encrypted_string.substring(45, 60);

    const verification_code = encrypted_string.substring(60, encrypted_string.length);

    const decrypted_string = dypt(verification_code, pub_k, pvt_k);
    try {
        return decrypted_string;
    } catch (e) {
        console.error("❌ JSON parse error:", e.message);
        return null;
    }
}
export function get__decryptLevel2(encryp_json_string){
    if (typeof encryp_json_string !== "string") {
    console.error("Invalid input: not a string");
    return null;
  }
    const breakArr = encryp_json_string.match(/.{1,32}/g);
    if (!breakArr || breakArr.length < 2) {
        console.error("Invalid input format");
        return null;
    }

    const key_data = breakArr[1].match(/.{1,16}/g);
    if (!key_data || key_data.length < 2) {
        console.error("Invalid key data");
        return null;
    }

    const pub_k = key_data[0];
    const pvt_k = key_data[1];

    const verification_code = encryp_json_string.replace(breakArr[0] + breakArr[1], "");

    const decrypted_string = dypt(verification_code, pub_k, pvt_k);
    try {
        return decrypted_string;
    } catch (e) {
        console.error("❌ JSON parse error:", e.message);
        return null;
    }
}

export function get__decryptedVidKey(encrypted_string){
    const level1 = get__decryptLevel1(encrypted_string);
    const level2 = get__decryptLevel2(level1);
    console.log(level2);
    return level2;
}

// const decrypted_room_key = get_room_decrypted_key(encryptedRoomKey);
// console.log("\n🔓 Decrypted Key:");
// console.log(decrypted_room_key === false ? "Decryption failed or empty output." : decrypted_room_key);
// const decrypted_room_json = get_decrypted_data(encryptedJson);
// console.log("\n🔓 Decrypted JSON:");
// console.log(decrypted_room_json === false ? "Decryption failed or empty output." : decrypted_room_json);

// .put__login("demo@valensc.com", "asdf345Q", "Lenscva@5th");  //l1li0abwor

