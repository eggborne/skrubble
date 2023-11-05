const getDefinition = async (word) => {
  try {
    const response = await fetch('https://skrubble.live/php/api_proxy.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ word }),
    });

    const data = await response.json();
    const responseMessage = data.choices[0].message.content;

    console.log(responseMessage);
    return responseMessage;
  } catch (error) {
    console.error('Error:', error);
  }
};

export { getDefinition };
