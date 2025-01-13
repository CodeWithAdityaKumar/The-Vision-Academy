const axios = require("axios");

const sendMediaAudio = async (mediaLink, Phone, PhoneNumberID) => {
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
      type: "audio",
      audio: {
        link: mediaLink,
      },
    }),
  });
  return response.data;
};

exports.sendMediaAudio = sendMediaAudio;