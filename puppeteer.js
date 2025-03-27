import fs from "fs-extra";
import path from "path";
import puppeteer from "puppeteer";

async function generatePuppeteerPdf() {
  const start = performance.now();

  const username = "ebony";
  const profileUrl = `https://client-test.knky.co/creator/${username}`;
  const imagePath = path.resolve("knky-filled.png");
  const imageBase64 = fs.existsSync(imagePath)
    ? fs.readFileSync(imagePath).toString("base64")
    : "";

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Participants Release Form</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        font-size: 14px;
        line-height: 1.6;
      }
      .header {
        background-color: #18022c;
        color: white;
        text-align: center;
        padding: 40px 20px;
        position: relative;
      }
      .header img {
        width: 320px;
        height: auto;
      }
      .title {
        font-size: 24px;
        font-weight: bold;
        margin-top: 10px;
      }
      .sub-title {
        margin-top: 20px;
        font-size: 20px;
        font-weight: bold;
        color: black;
        display: flex;
        justify-content: center;
      }
      .content {
        margin-top: 20px;
        text-align: justify;
      }
      .link {
        color: #ac1991;
        font-weight: bold;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <img src="data:image/png;base64,${imageBase64}" alt="Logo" />
      <div class="title">Participants Release Form</div>
    </div>

    <div style="padding: 0 40px;">
      <div class="sub-title">
        Consent to participate in 18+ content on Knky.co
      </div>

      <div class="content">
        <p>
          To comply with MasterCard's revised standards for new Specialty
          Merchant Registration Requirements for Adult Content Merchants,
          participants provide their informed consent to the following
          provisions.
        </p>

        <p>
          I attest I am a participant in 18+ content on and I give the absolute
          right and permission to create, upload, use, re-use, display, publish,
          or distribute my explicit content to Heil Neelson that will be posted
          on his/her Knky account with username
          <a href="${profileUrl}" class="link">@${username}</a>.
        </p>

        <p>
          I am aware that media files featuring me may be/will be used for
          commercial reasons. By signing this document, I provide my explicit
          consent to use my image on Knky.co.
        </p>

        <p>
          I hereby warrant that I am of full age in the country where I reside
          and have the right to contract in my own name. I have read the above
          authorization, release, and agreement prior to its execution and I am
          fully familiar with the contents of this document.
        </p>

        <p>
          This release applies to any content depicting myself, submitted by
          <a href="${profileUrl}" class="link">@${username}</a> for an
          indefinite time period. If I wish to exercise my legal right to
          withdraw consent, I will contact support@knky.co.
        </p>

        <p>
          I acknowledge that this document may be shared with third parties as
          required by law or Knky policy.
        </p>
      </div>
    </div>
  </body>
</html>
`;

  fs.writeFileSync("form.html", htmlContent);

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });

  await page.pdf({
    path: "puppeteer-form.pdf",
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  fs.unlinkSync("form.html");

  const end = performance.now();
  console.log(`puppeteer: Form PDF generated in ${end - start}ms`);
}

generatePuppeteerPdf();
