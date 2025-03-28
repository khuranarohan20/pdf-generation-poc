import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import { PDFDocument, PDFName, PDFRef, PDFString, rgb } from "pdf-lib";

type PDFParams = {
  username: string;
  full_name: string;
  id_type: string;
  id_number: string;
  state_and_country: string;
  dob: string;
};

type CreateLinkParams = {
  x: number;
  y: number;
  pdfDoc: PDFDocument;
  link: string;
};

const createLink = ({ x, y, pdfDoc, link }: CreateLinkParams): PDFRef => {
  const width = 100;
  const height = 20;

  const linkAnnotation = pdfDoc.context.obj({
    Type: PDFName.of("Annot"),
    Subtype: PDFName.of("Link"),
    Rect: pdfDoc.context.obj([x, y, x + width, y + height]),
    Border: pdfDoc.context.obj([0, 0, 0]),
    C: pdfDoc.context.obj([0, 0, 1]),
    A: pdfDoc.context.obj({
      Type: PDFName.of("Action"),
      S: PDFName.of("URI"),
      URI: PDFString.of(link ?? "https://google.com"),
    }),
  });

  return pdfDoc.context.register(linkAnnotation);
};

async function modifyPDF(params: PDFParams): Promise<void> {
  try {
    const start = performance.now();
    const pdfBytes = fs.readFileSync("final-pdf.pdf");
    const pdfDoc = await PDFDocument.load(pdfBytes);
    pdfDoc.registerFontkit(fontkit);

    const fontBytes = fs.readFileSync("fonts/SFDisplay-Regular.otf");
    const customFont = await pdfDoc.embedFont(fontBytes);

    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();

    const textEntries = [
      { text: params.full_name, x: 120, y: height - 473 },
      {
        text: params.username,
        x: width - 210,
        y: height - 500,
        link: true,
        href: `https://knky.co/creator/${params.username}`,
      },
      {
        text: params.username,
        x: width - 168,
        y: 667,
        link: true,
        href: `https://knky.co/creator/${params.username}`,
      },
      { text: params.id_type, x: 50, y: 440 },
      { text: params.id_number, x: 50, y: 357 },
      { text: params.state_and_country, x: 50, y: 274 },
      { text: params.dob, x: 50, y: 191 },
      { text: params.full_name, x: 50, y: 108 },
      { text: params.full_name, x: 100, y: 45 },
      { text: new Date().toLocaleDateString(), x: width - 100, y: 45 },
    ];

    const annotations: any =
      page.node.lookup(PDFName.of("Annots")) || pdfDoc.context.obj([]);

    textEntries.forEach(({ link, text, x, y, href }) => {
      page.drawText(text, {
        x,
        y,
        size: 16,
        color: link ? rgb(172 / 255, 25 / 255, 145 / 255) : rgb(0, 0, 0),
        font: customFont,
      });

      if (link) {
        annotations.push(createLink({ x, y, pdfDoc, link: href! }));
      }
    });

    page.node.set(PDFName.of("Annots"), annotations);

    const modifiedPdfBytes = await pdfDoc.save();
    fs.writeFileSync("modified-pdf.pdf", modifiedPdfBytes);

    const end = performance.now();
    console.log(`PDF modified in ${(end - start).toFixed(2)}ms`);
    console.log("PDF modified successfully!");
  } catch (error) {
    console.error("Error modifying PDF:", error);
  }
}

modifyPDF({
  username: "testUser",
  full_name: "John Doe",
  id_type: "Passport",
  id_number: "123456789",
  state_and_country: "California, USA",
  dob: "01/01/1990",
});
