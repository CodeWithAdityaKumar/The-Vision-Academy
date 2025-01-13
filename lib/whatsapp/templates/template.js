const axios = require("axios");

const sendTemplate = async (tName,headerDocumentType, headerDocumentLink, Phone, PhoneNumberID) => {
  let url = `https://graph.facebook.com/v21.0/${PhoneNumberID}/messages`;


  let HeaderParameter;
  
  if (headerDocumentType === "image") {
    HeaderParameter = {
      components: [
        {
          type: "header",
          parameters: [
            {
              type: "image",
              image: {
                link: headerDocumentLink,
              },
            },
          ],
        },
      ],
    };  
  }

  
  if (headerDocumentType === "video") {
    HeaderParameter = {
      components: [
        {
          type: "header",
          parameters: [
            {
              type: "video",
              video: {
                link: headerDocumentLink,
              },
            },
          ],
        },
      ],
    };  
  }


  if (headerDocumentType === "document") {
    HeaderParameter = {
      components: [
        {
          type: "header",
          parameters: [
            {
              type: "document",
              document: {
                link: headerDocumentLink,
                filename: "Fee Receipt TVA049401",
              },
            },
          ],
        },
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: "Aditya Kumar",
            },
            {
              type: "text",
              text: "February",
            },
            {
              type: "text",
              text: "7000",
            },
            {
              type: "text",
              text: "5000",
            },
            {
              type: "text",
              text: "2000",
            },
          ],
        },
      ],
    };  
  }

  if (headerDocumentType === "text") {
    HeaderParameter = ""
  }




  const response = await axios({
    url: url,
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
    },
    data: JSON.stringify({
      messaging_product: "whatsapp",
      to: Phone,
      type: "template",
      template: {
        name: tName,
        language: {
          code: "en_US",
        },
        components: HeaderParameter.components,
      },
    }),
  });
  return response.data;
};

exports.sendTemplate = sendTemplate;