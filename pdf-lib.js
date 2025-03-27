import fs from "fs-extra";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

async function generatePdfLib() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 900]);
  const { width, height } = page.getSize();
  const start = performance.now();

  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const imagePath = "./knky-filled.png";

  if (fs.existsSync(imagePath)) {
    const imageBytes = fs.readFileSync(imagePath);
    const embeddedImage = await pdfDoc.embedPng(imageBytes);

    const boxY = height - 180;
    const boxWidth = width;
    const boxHeight = 200;

    page.drawRectangle({
      x: 0,
      y: boxY,
      width: boxWidth,
      height: boxHeight,
      color: rgb(0.094, 0.008, 0.173),
    });

    page.drawImage(embeddedImage, {
      x: 140,
      y: height - 100,
      width: 320,
      height: 72,
    });

    page.drawText("Participants Release Form", {
      x: 140,
      y: height - 130,
      size: 24,
      font: boldFont,
      color: rgb(1, 1, 1),
    });
  }

  page.drawText("Consent to participate in 18+ content on Knky.co", {
    x: 140,
    y: height - 210,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  const content = `To comply with MasterCard's revised standards for new Specialty Merchant Registration Requirements for AdultContent Merchants, participants is providing their informed consent to the following provisions.

I attest I am a participant in 18+ content on and I give the absolute right and permission to create, upload, use, re-use, display, publish, or distribute my explicit content to Heil Neelson that will be posted on his/her Knky account with username @USERNAME.

I am aware that media files featuring me may be/will be used for commercial reasons. By signing this document, I provide my explicit consent to use my image on Knky.co.

I hereby warrant that I am of full age in the country where I reside and have the right to contract in my own name. I have read the above authorization, release, and agreement prior to its execution and I am fully familiar with the contents of this document.

This release applies to any content depicting myself, submitted by @USERNAME for an indefinite time period. If I wish to exercise my legal right to withdraw consent, I will contact support@knky.co.

I acknowledge that this document may be shared with third parties as required by law or Knky policy.
`;

  function drawWrappedTextWithLinks(
    page,
    text,
    x,
    y,
    maxWidth,
    lineHeight,
    paragraphSpacing,
    font,
    fontSize,
    username
  ) {
    const paragraphs = text.split("\n\n");
    let textY = y;
    const linkColor = rgb(172 / 255, 25 / 255, 145 / 255); // #AC1991

    paragraphs.forEach((para) => {
      const words = para.split(/\s+/);
      let line = "";
      let lineX = x;

      words.forEach((word) => {
        let testLine = line + word + " ";
        let testWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (testWidth > maxWidth) {
          page.drawText(line, {
            x: lineX,
            y: textY,
            size: fontSize,
            font,
            color: rgb(0, 0, 0), // Normal text color
          });
          line = word + " ";
          textY -= lineHeight;
        } else {
          line = testLine;
        }
      });

      if (line) {
        let wordsInLine = line.trim().split(" ");
        let currentX = x;
        wordsInLine.forEach((word) => {
          if (word === `@${username}`) {
            const profileUrl = `https://client-test.knky.co/creator/${username}`;
            const wordWidth = font.widthOfTextAtSize(word, fontSize);

            // ✅ Draw @USERNAME in custom color
            page.drawText(word, {
              x: currentX,
              y: textY,
              size: fontSize,
              font,
              color: linkColor, // Custom color
            });

            // ✅ Add clickable annotation using the correct method
            page.node.addAnnotation({
              type: "link",
              rect: [currentX, textY, currentX + wordWidth, textY + fontSize],
              url: profileUrl,
            });

            currentX += wordWidth + font.widthOfTextAtSize(" ", fontSize);
          } else {
            // Draw normal text
            page.drawText(word + " ", {
              x: currentX,
              y: textY,
              size: fontSize,
              font,
              color: rgb(0, 0, 0),
            });
            currentX += font.widthOfTextAtSize(word + " ", fontSize);
          }
        });

        textY -= paragraphSpacing;
      }
    });

    return textY;
  }

  const username = "ebony";
  let updatedContent = content.replace(/@USERNAME/g, `@${username}`);

  let textY = height - 230;
  textY = drawWrappedTextWithLinks(
    page,
    updatedContent,
    50,
    textY,
    width - 100,
    16,
    30,
    normalFont,
    12,
    username
  );

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync("pdf-lib-form.pdf", pdfBytes);

  const end = performance.now();
  console.log(`pdf-lib: Form PDF generated in ${end - start}ms`);
}

generatePdfLib();
