import {
  get_encrypted_data,
  get_room_encrypted_data,
  get_decrypted_data,
  get__decryptedVidKey,
} from "./cryptAES.mjs";

const BASE_URL =
  "https://edubeessecurelms.com/edubeessecurelms/index.php/ajsfkjsfdjsf/";
const BASE_FUNC = "IGQvC36opF";
const BASE_URL_X =
  "https://edubeessecurelms.com/edubeessecurelms/index.php/apvalensc/";
let BASE_FUNC_X = "";

const rooms = {
  studentPacks: "hklasd7u3f",
};

const FIELDS = {
  pack_id: "r3g7k9s",
  pack_key: "r4s7g2h9",
  remaining_days: "s7r8u3m",
  pack_expiry_date: "p8d9u1d1",
  student_id: "g3h8k5r",
  pack_name: "m3r8k7n",
  course_name: "d7s2t9l1",
  subject: "d7h2k9p4",
  chapter: "r6a9k2q8",
  watermark1: "d7s2t9l2",
  watermark2: "d7s2t9l3",
  watermark3: "d7s2t9l4",
  videos: "c4h8m3n",
  video_id: "r7k2n4p8",
  title: "r7t2k9w6",
  fileType: "t7u2x4k9",
  pdfName: "asgthycv",
  encryption_key: "g7k2p4r9",
  video_duration: "g7s2t9h4",
  allotted_time: "r6s9k2v8",
  watched_time: "r2a9v5k8",
  resume_time: "g2k9h4p8",
  key_view: "q7f2h9k5",
};

export default class SecureRESTClient {
  constructor() {}

  async WebRequest(room, jsonData, encrypt = true, endpoint = "") {
    let response;

    const encryptedRoom = get_room_encrypted_data(room);
    const encryptedPayload = get_encrypted_data(jsonData);

    if (encrypt) {
      const formBody = new URLSearchParams({
        jkdbhagbsdkl: encryptedRoom,
        kljsdflksl: encryptedPayload,
      }).toString();

      // response = await fetch("/edubeessecurelms/index.php/ajsfkjsfdjsf/IGQvC36opF", {
      response = await fetch(BASE_URL + BASE_FUNC, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: formBody,
      });

      const resText = await response.text();

      const finalResponse = get_decrypted_data(resText);

      // console.log("Response text:", finalResponse);
      // const finalResponse = encrypt ? get_decrypted_data(resText) : JSON.parse(resText);

      return finalResponse;
    } else {
      // Send JSON directly
      // const formBody = new URLSearchParams({
      //   request: encryptedPayload,
      // }).toString();
      const formData = new FormData();

      // Assuming jsonData is an object like { class_id: 844, student_id: 849 }
      for (const key in jsonData) {
        formData.append(key, jsonData[key]);
      }

      BASE_FUNC_X = endpoint;

      // response = await fetch("/edubeessecurelms/index.php/apvalensc/{$endpoint}", {
      const response = await fetch(BASE_URL_X + BASE_FUNC_X, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      const resText = await response.text();

      const finalResponse = JSON.parse(resText);

      // console.log("Response text:", finalResponse);

      return finalResponse;
    }
  }

  async get__studentPacks(student_id, class_id, class_code) {
    try {
      const jsonData = {
        student_id,
        class_id,
        class_code,
      };

      const decryptedResponse = this.WebRequest(rooms.studentPacks, jsonData);
      return decryptedResponse;
    } catch (err) {
      // console.log("ERROR: ", err);
    }
  }


  async parse__packData(responseJson) {
    const sourceData = responseJson.data;
    console.log("studentPacks data : ", sourceData);
    if (!sourceData) {
      alert("No Data Found !!");
      return false;
    }

    let finalOutput = [];

    try {
      const packMap = new Map();
      for (const pack of sourceData) {
        const pack_id = pack[FIELDS.pack_id];
        const pack_expiry_date = pack[FIELDS.pack_expiry_date];
        const remaining_days = pack[FIELDS.remaining_days];
        const student_id = pack[FIELDS.student_id];
        const videos = pack[FIELDS.videos] ?? null;
        const isVideosEmpty = videos === null;

        console.log("isVideosEmpty: ", videos);

        if (!packMap.has(pack_id)) {
          packMap.set(pack_id, {
            student_id,
            pack_id,
            course_name:
              isVideosEmpty === true ? "" : videos[0][FIELDS.course_name] || "",
            pack_expiry_date,
            subjectsMap: new Map(),
          });
        }

        const targetPack = packMap.get(pack_id);

        for (const video of videos) {
          const subject = video[FIELDS.subject] ?? "";
          const chapter = video[FIELDS.chapter] ?? "";
          const video_id = video[FIELDS.video_id] ?? "";
          const file_type = video[FIELDS.fileType] ?? "";
          const title = video[FIELDS.title] ?? "";
          const pdfName = video[FIELDS.pdfName] ?? "";
          const duration = video[FIELDS.video_duration] ?? "";
          const time_allotted = video[FIELDS.allotted_time] ?? 0;
          const time_watched = video[FIELDS.watched_time] ?? "";
          const time_resumed = video[FIELDS.resume_time] ?? "";
          const key_view = video[FIELDS.key_view] ?? "";
          const enc_key_2 = video[FIELDS.encryption_key];
          const enc_key =
            (enc_key_2 && (await get__decryptedVidKey(enc_key_2))) ?? "";
          const pack_key = video[FIELDS.pack_key] ?? "";
          //const remaining_days = video[FIELDS.remaining_days];
          const watermark_1 = video[FIELDS.watermark1] ?? "";
          const watermark_2 = video[FIELDS.watermark2] ?? "";
          const watermark_3 = video[FIELDS.watermark3] ?? "";
          const is_downloaded = false;

          if (!subject && !chapter && !video_id && !title) continue;

          if (!targetPack.subjectsMap.has(subject)) {
            targetPack.subjectsMap.set(subject, new Map());
          }

          const chapterMap = targetPack.subjectsMap.get(subject);

          if (!chapterMap.has(chapter)) {
            chapterMap.set(chapter, []);
          }

          chapterMap.get(chapter).push({
            video_id,
            file_type,
            title,
            pdfName,
            duration,
            time_allotted,
            time_watched,
            time_resumed,
            key_view,
            enc_key,
            pack_key,
            remaining_days,
            watermark_1,
            watermark_2,
            watermark_3,
            is_downloaded,
          });
        }
      }

      finalOutput = {
        packs: Array.from(packMap.values()).map((pack) => ({
          student_id: pack.student_id,
          pack_id: pack.pack_id,
          course_name: pack.course_name,
          pack_expiry_date: pack.pack_expiry_date,
          subjects: Array.from(pack.subjectsMap.entries()).map(
            ([subject, chaptersMap]) => ({
              subject,
              chapters: Array.from(chaptersMap.entries()).map(
                ([chapter, videos]) => ({
                  chapter,
                  videos,
                })
              ),
            })
          ),
        })),
      };
    } catch (error) {
      console.error("parse__packData ERROR : ", error);
    }

    // console.log(finalOutput);

    return finalOutput;
  }

  
}
