import { transcribeUrl } from "../src/apis/transcribe";

describe('test', () => {
    it('transcribe', async () => {
        const res = await transcribeUrl("url");
        //const transcript = res.results.channels[0].alternatives[0].paragraphs!.transcript;
        //console.log(transcript);
        console.log(JSON.stringify(res, null, 2));
      });
});