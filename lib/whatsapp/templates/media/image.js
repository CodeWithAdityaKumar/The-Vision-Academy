const axios = require("axios");

const sendMediaImage = async (mediaLink, caption, Phone, PhoneNumberID) => {
  let url = `https://graph.facebook.com/v21.0/${PhoneNumberID}/messages`;

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
      type: "image",
      image: {
        link: mediaLink,
        caption: caption,
      },
    }),
  });
  return response.data;
};

exports.sendMediaImage = sendMediaImage;