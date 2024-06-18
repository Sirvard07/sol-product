const smtpConfig = require("./config/smtp-config");
const nodemailer = require("nodemailer");
const fs = require("fs");
require("dotenv").config();

async function sendEmail(data, filePath) {
  console.log("filePath", filePath)
  let partnerName = "";
  let emailTo = "lilit.minasyan@solcellespesialisten.no";
  let mailOptions;
  let mailOptions2;
  let email = data.customerInfo?.email;
  let fileName = filePath.split("/")[filePath.split("/").length - 1];
  // switch (data.partnerId) {
  //   case 10004:
  //     partnerName = "Solcellespesialisten AS";
  //     emailTo = "salg.enebolig@solcellespesialisten.no";
  //     break;
  //   case 10021:
  //     partnerName = "Finnås Kraftlag AS";
  //     emailTo = "arild.rolfsnes@bomlo-kraftnett.no";
  //     break;
  //   case 10005:
  //     partnerName = "Smart Energi";
  //     emailTo = "kontakt@smartenergi.com";
  //     break;
  //   case 10011:
  //     partnerName = "Siggerud Energiutvikling ENK";
  //     emailTo = "energi@siggerud.as";
  //     break;
  //   case 10024:
  //     partnerName = "Solcellespesialisten";
  //     emailTo = "salg.enebolig@solcellespesialisten.no";
  //     break;
  //   default:
  //     break;
  // }

  let transporter = nodemailer.createTransport(smtpConfig);
  if (data.partnerId === 10004) {
    mailOptions = {
      from: "salg.enebolig@solcellespesialisten.no",
      to: emailTo,
      subject: `Registrert forespørsel tilbud ${partnerName}`,
      text: "Vennligst se vedlagt tilbud og vilkår for kjøp av solcelleanlegg",
      html: `
      <!DOCTYPE html>
        <body>
          <div>
            <p>Hei! Vi har registrert henvendelsen din. En av våre medarbeidere vil gå gjennom forespørselen og sende deg et tilbud. Tilbudet kan avvike noe da rådgiveren vil se hva som er mest egnet løsning for din bolig.</p>
            <p>Viste du at: Det er flere grunner til at det lønner seg å installere solcelleanlegg på taket. Det er både bra for miljøet og økonomisk gunstig for deg som privatperson. Solenergi er en fornybar energikilde som bidrar til å redusere den globale oppvarmingen. Mange ønsker å bidra i kampen mot klimaendringer og solenergi er derfor en egnet investering for deg som ønsker å redusere ditt klimafotavtrykk.</p>
            <p>Mvh. ${partnerName}.</p>
          </div>
        </body>
      </html>`,
      attachments: [
        {
          filename: fileName,
          path: filePath,
          contentType: "application/pdf",
        },
      ],
    };
  } else if (data.partnerId === 10024) {
    mailOptions = {
      from: "salg.enebolig@solcellespesialisten.no",
      to: emailTo,
      subject: `Registrert forespørsel tilbud ${partnerName}`,
      text: "Vennligst se vedlagt tilbud og vilkår for kjøp av solcelleanlegg",
      html: `
      <!DOCTYPE html>
        <body>
          <div>
            <p>Hei! Vi har registrert henvendelsen din. En av våre medarbeidere vil gå gjennom forespørselen og sende deg et tilbud. Tilbudet kan avvike noe da rådgiveren vil se hva som er mest egnet løsning for din bolig.</p>
            <p>Viste du at: Det er flere grunner til at det lønner seg å installere solcelleanlegg på taket. Det er både bra for miljøet og økonomisk gunstig for deg som privatperson. Solenergi er en fornybar energikilde som bidrar til å redusere den globale oppvarmingen. Mange ønsker å bidra i kampen mot klimaendringer og solenergi er derfor en egnet investering for deg som ønsker å redusere ditt klimafotavtrykk.</p>
            <p>Mvh. ${partnerName}.</p>
          </div>
        </body>
      </html>`,
    };
  } else {
    mailOptions = {
      from: "salg.enebolig@solcellespesialisten.no",
      to: emailTo,
      subject: `Registrert forespørsel tilbud ${partnerName}`,
      text: "Vennligst se vedlagt tilbud og vilkår for kjøp av solcelleanlegg",
      html: `
      <!DOCTYPE html>
        <body>
          <div>
            <ul>
              <li>Tidspunkt: ${new Date()}</li>
              <li>Navn: ${data.customerInfo.name}  ${
        data.customerInfo.surname
      }</li>
              <li>Adresse: ${data.customerInfo.address}</li>
              <li>Kommune: ${data.customerInfo.municipality}</li>
              <li>E-post: ${data.customerInfo.email}</li>
              <li>Telefon: ${data.customerInfo.phone}</li>
            </ul>
            <ul>
              Om anlegget
              <li>Beskrivelse: ${data.order?.navn}</li>
              <li>kWp: ${data.orderInfo?.kwp}</li>
              <li>Type installasjon: "Utenpåliggende"</li>
              <li>Pris materiell: ${data.orderInfo?.materiell * 1.25}</li>
              <li>Pris installasjon: ${data.orderInfo?.montasje * 1.25}</li>
              <li>Støtte fra Enova: ${data.order?.enovaSupport}</li>
            </ul>
            <ul>
              Om taket
              <li>Type: ${data.orderRoofType}</li>
              <li>Areal: ${data.roofInformation?.Areal3D}</li>
              <li>Retning: ${data.roofInformation?.Retning}</li>
              <li>Bredde: ${data.roofInformation?.Bredde}</li>
              <li>Lengde: ${data.roofInformation?.Lengde}</li>
              <li>Helning: ${data.roofInformation?.Helning}</li>
              <li>Snølast: ${data.order?.anleggsInformasjon?.snolast}</li>
              <li>Vindlast: ${data.order?.anleggsInformasjon?.vindlast}</li>
            </ul>
          </div>
        </body>
      </html>`,
      attachments: [
        {
          filename: fileName,
          path: filePath,
          contentType: "application/pdf",
        },
      ],
    };
  }

  mailOptions2 = {
    from: emailTo,
    to: email,
    subject: "Registrert forespørsel ang. tilbud på solceller",
    html: `
        <!DOCTYPE html>
          <body>
            <div>
              <p>Hei! Vi har registrert henvendelsen din. En av våre medarbeidere vil gå gjennom forespørselen og sende deg et tilbud. Tilbudet kan avvike noe da rådgiveren vil se hva som er mest egnet løsning for din bolig.</p>
              <p>Visste du at: Det er flere grunner til at det lønner seg å installere solcelleanlegg på taket. Det er både bra for miljøet og økonomisk gunstig for deg som privatperson. Solenergi er en fornybar energikilde som bidrar til å redusere den globale oppvarmingen. Mange ønsker å bidra i kampen mot klimaendringer og solenergi er derfor en egnet investering for deg som ønsker å redusere ditt klimafotavtrykk.</p>
              <p>Mvh. ${partnerName}.</p>
            </div>
          </body>
        </html>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
      let filePaths = `${__dirname}/${filePath}`;
      fs.unlinkSync(filePaths);
      res.end();
    }
  });

  transporter.sendMail(mailOptions2, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

module.exports = { sendEmail };
