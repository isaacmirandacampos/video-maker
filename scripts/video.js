const gm = require("gm").subClass({ imageMagick: true });
const path = require("path");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
const videoshow = require("videoshow");
let ffmpeg = require("fluent-ffmpeg");

const state = require("./state");
const rootPath = path.resolve(__dirname, "..");
const audioPath = path.join(__dirname, "../templates/2/newsroom.mp3");
const videoPath = path.join(__dirname, "../content/output.mp4");

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const fromRoot = (relPath) => path.resolve(rootPath, relPath);

const video = async () => {
  let content = state.load();
  await convertAllImages(content);
  await createAllSentenceImages(content);
  await createThumbnail();
  await createVideo();
  await renderVideoWithFFmpeg(content);
};

const convertAllImages = async (content) => {
  for (
    let sentenceIndex = 0;
    sentenceIndex < content.sentences.length;
    sentenceIndex++
  ) {
    await convertImage(sentenceIndex);
  }
};

async function convertImage(sentenceIndex) {
  return new Promise((resolve, reject) => {
    const inputFile = fromRoot(`./content/${sentenceIndex}-original.png[0]`);
    const outputFile = fromRoot(`./content/${sentenceIndex}-converted.png`);
    const width = 1920;
    const height = 1080;

    gm()
      .in(inputFile)
      .out("(")
      .out("-clone")
      .out("0")
      .out("-background", "white")
      .out("-blur", "0x9")
      .out("-resize", `${width}x${height}^`)
      .out(")")
      .out("(")
      .out("-clone")
      .out("0")
      .out("-background", "white")
      .out("-resize", `${width}x${height}`)
      .out(")")
      .out("-delete", "0")
      .out("-gravity", "center")
      .out("-compose", "over")
      .out("-composite")
      .out("-extent", `${width}x${height}`)
      .write(outputFile, (error) => {
        if (error) {
          return reject(error);
        }

        console.log(`> Image converted: ${outputFile}`);
        resolve();
      });
  });
}

const createAllSentenceImages = async (content) => {
  for (
    let sentenceIndex = 0;
    sentenceIndex < content.sentences.length;
    sentenceIndex++
  ) {
    await createSentenceImage(
      sentenceIndex,
      content.sentences[sentenceIndex].text
    );
  }
};

const createSentenceImage = async (sentenceIndex, sentenceText) => {
  return new Promise((resolve, reject) => {
    const outputFile = fromRoot(`./content/${sentenceIndex}-sentence.png`);

    const templateSettings = {
      0: {
        size: "1920x400",
        gravity: "center",
      },
      1: {
        size: "1920x1080",
        gravity: "center",
      },
      2: {
        size: "800x1080",
        gravity: "west",
      },
      3: {
        size: "1920x400",
        gravity: "center",
      },
      4: {
        size: "1920x1080",
        gravity: "center",
      },
      5: {
        size: "800x1080",
        gravity: "west",
      },
      6: {
        size: "1920x400",
        gravity: "center",
      },
    };

    gm()
      .out("-size", templateSettings[sentenceIndex].size)
      .out("-gravity", templateSettings[sentenceIndex].gravity)
      .out("-background", "transparent")
      .out("-fill", "white")
      .out("-kerning", "-1")
      .out(`caption:${sentenceText}`)
      .write(outputFile, (error) => {
        if (error) {
          return reject(error);
        }

        console.log(`> Sentence created: ${outputFile}`);
        resolve();
      });
  });
};

const createThumbnail = async () => {
  return new Promise((resolve, reject) => {
    gm()
      .in("./content/0-converted.png")
      .write("./content/thumbnail.jpg", (error) => {
        if (error) {
          return reject(error);
        }

        console.log(`> Creating Thumbnail`);
        resolve();
      });
  });
};

async function createVideo(content) {
  await state.saveScript(content);
}

async function renderVideoWithFFmpeg(content) {
  return new Promise((resolve, reject) => {
    let images = [
      {
        path: `./content/intro.jpg`,
        caption: `${content.prefix} ${content.searchTerm}`,
      },
    ];

    for (
      let sentenceIndex = 0;
      sentenceIndex < content.sentences.length;
      sentenceIndex++
    ) {
      images.push({
        path: `./content/${sentenceIndex}-converted.png`,
        caption: content.sentences[sentenceIndex].text,
      });
    }

    const videoOptions = {
      fps: 25,
      loop: 10, // seconds
      transition: true,
      transitionDuration: 1, // seconds
      videoBitrate: 1024,
      videoCodec: "libx264",
      size: "1920x1080",
      audioBitrate: "128k",
      audioChannels: 2,
      format: "mp4",
      pixelFormat: "yuv420p",
      useSubRipSubtitles: false, // Use ASS/SSA subtitles instead
      subtitleStyle: {
        Fontname: "Verdana",
        Fontsize: "50",
        PrimaryColour: "16777215",
        SecondaryColour: "16777215",
        TertiaryColour: "16777215",
        BackColour: "-2147483640",
        Bold: "3",
        Italic: "0",
        BorderStyle: "2",
        Outline: "2",
        Shadow: "2",
        Alignment: "2", // left, middle, right
        MarginL: "40",
        MarginR: "60",
        MarginV: "40",
      },
    };

    videoshow(images, videoOptions)
      .audio(audioPath)
      .save(videoPath)
      .on("start", () => {
        console.log("> Starting FFmpeg");
      })
      .on("error", (err, stdout, stderr) => {
        console.error("Error:", err);
        console.error("ffmpeg stderr:", stderr);
        reject(err);
      })
      .on("end", () => {
        console.log("> FFmpeg closed");
        resolve();
      });
  });
}

module.exports = video;
