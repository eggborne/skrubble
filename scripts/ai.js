import OpenAI from 'openai';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

const getDefinition = async (word) => {
  // const response = await openai.createChatCompletion({
  //   model: 'gpt-3.5-turbo',
  //   messages: [
  //     {
  //       role: 'user',
  //       content: 'Give me some goofy names for a horse.'
  //     },
  //   ],
  //   temperature: 0,
  //   max_tokens: 500,
  //   top_p: 1.0,
  //   frequency_penalty: 0.0,
  //   presence_penalty: 0.0,
  // });

  // console.warn('resp!', response.data.choices[0].message);
};

export { getDefinition };




