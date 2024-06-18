const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const { v4: uuidv4 } = require("uuid");

async function createPDF(data, time) {
  console.log("data",data);
  let newData;
  let currentTime = new Date();
  currentTime.setDate(currentTime.getDate() + 14);
  const offset = currentTime.getTimezoneOffset();
  currentTime = new Date(currentTime.getTime() - offset * 60 * 1000);
  currentTime = currentTime.toISOString().split("T")[0];
  let address;
  const sfNumber = data.SFNumber;
  const guid = uuidv4();
  if (Object.keys(data).length > 0) {
    const baseSupport = 7500;
    let kwpCount = data.orderInfo?.kwp / 1000;
    let kwpSupport = kwpCount > 20 ? 40000 : kwpCount * 1250;
    let enova = baseSupport + kwpSupport;
    if (enova > data.orderInfo?.totalPrice) {
      enova = data.orderInfo?.totalPrice;
    }
    let netP = data.orderInfo?.pris * 1.25 - enova;
    let netP2 = data.orderInfo?.totalPrice - data.orderInfo?.enovaSubsidy;
    address =
      data.customerInfo?.address +
      "-" +
      data.customerInfo?.postalCode +
      "-" +
      data.customerInfo?.municipality;

    let panelTypes = data?.panelType?.match(/\d+/g).join("");
    let year;
    switch (panelTypes) {
      case "430":
        year = "12 år";
        break;
      case "410":
        year = "12 år";
        break;
      case "505":
        year = "12 år";
        break;
      default:
        break;
    }
    newData = {
      ...data,
      prisFirst: Intl.NumberFormat("en-US")
        .format(Math.ceil(Number(data?.orderInfo?.pris) * 1.25))
        .replace(",", " "),
      prisSecond: Intl.NumberFormat("en-US")
        .format(Math.ceil(Number(data?.orderInfo?.totalPrice)))
        .replace(",", " "),
      enovaSupport: Intl.NumberFormat("en-US")
        .format(data?.orderInfo?.enovaSubsidy)
        .replace(",", " "),
      newLcoe: parseFloat(data?.roofOrderInfo?.lcoe).toFixed(2),
      currentTime: currentTime,
      solarPanelSavings: Math.floor(Number(data?.kWh) * 0.405),
      totalKwp: data?.orderInfo?.kwp,
      panelType: data?.panelType?.match(/\d+/g).join(""),
      comment: data?.orderInfo?.projectTerms,
      yearString: year,
    };
    if (data?.partnerId === 10024 || data?.partnerId === 10004) {
      netP2 = netP2 - data?.orderInfo?.discount;
      newData.showDiscountField = true;
      newData.discount = Intl.NumberFormat("en-US")
        .format(data?.orderInfo?.discount)
        .replace(",", " ");
    }
    newData.netPrice = Intl.NumberFormat("en-US")
      .format(Math.ceil(netP2))
      .replace(",", " ");
  }

  var templateHtml = fs.readFileSync(
    path.join(process.cwd(), "document/newtemplate.html"),
    "utf8"
  );
  var template = handlebars.compile(templateHtml);

  var html = template(newData);

  var milis = new Date();
  milis = milis.getTime();

  const formattedUuid = address + guid.replace(/-/g, "").toUpperCase();
  var pdfPath = `${sfNumber}/files/${formattedUuid}.pdf`;

  var options = {
    printBackground: true,
    path: pdfPath,
    height: "3800px",
  };

  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    headless: true,
  });

  var page = await browser.newPage();

  await page.goto(`data:text/html;charset=UTF-8,${html}`, {
    waitUntil: "networkidle0",
  });

  await page.pdf(options);
  await browser.close();
  return formattedUuid;
}

module.exports = { createPDF };
