import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import { PDFDocument, PDFName, PDFString, rgb } from "pdf-lib";

const username = "ebony";
const full_name = "Heil Neelson";
const id_type = "Passport";
const id_number = "1234567890";
const state_and_country = "Mumbai, India";
const dob = "01/01/1990";

const createLink = ({ x, y, pdfDoc, link }) => {
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

  const linkAnnotationRef = pdfDoc.context.register(linkAnnotation);
  return linkAnnotationRef;
};

async function modifyPDF({
  username,
  full_name,
  id_type,
  id_number,
  state_and_country,
  dob,
}) {
  const start = performance.now();
  const pdfBytes = fs.readFileSync("final-pdf.pdf");
  const pdfDoc = await PDFDocument.load(pdfBytes);

  pdfDoc.registerFontkit(fontkit);

  const fontBytes = fs.readFileSync("fonts/SFDisplay-Regular.otf");
  const customFont = await pdfDoc.embedFont(fontBytes);

  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();

  const textEntries = [
    {
      text: username,
      x: width - 210,
      y: height - 500,
      link: true,
      href: `https://knky.co/creator/${username}`,
    },
    { text: full_name, x: 120, y: height - 473 },
    {
      text: username,
      x: width - 168,
      y: 902,
      link: true,
      href: `https://knky.co/creator/${username}`,
    },
    { text: id_type, x: 50, y: 675 },
    { text: id_number, x: 50, y: 592 },
    { text: state_and_country, x: 50, y: 509 },
    { text: dob, x: 50, y: 426 },
    { text: full_name, x: 50, y: 343 },
  ];

  const annotations =
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
      annotations.push(createLink({ x, y, pdfDoc, link: href }));
    }
  });

  page.node.set(PDFName.of("Annots"), annotations);

  const modifiedPdfBytes = await pdfDoc.save();
  fs.writeFileSync("modified-pdf.pdf", modifiedPdfBytes);

  const end = performance.now();
  console.log(`PDF modified in ${end - start}ms`);
  console.log("PDF modified successfully!");
}

modifyPDF({
  username,
  full_name,
  id_type,
  id_number,
  state_and_country,
  dob,
});
