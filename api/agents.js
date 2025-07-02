import { GoogleGenAI } from "@google/genai";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const client = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

const searchAgent = async (topic, currentDate) => {
  const searchAgentEntry = await client.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Your task is to use the google search tool (google_search) to find which topics are most relevant to the topic below.
            Focus on a maximum of 5 relevant topics, based on the engagement they generate.
            If a topic has little engagement, it may not be that relevant and can be replaced by another that has more.
            These relevant topics should be current, from no more than three months before today's date.
            Please do it about the topic: ${topic} and date: ${currentDate}`,
    config: {
      systemInstruction: "You are a research assistant for someone who wants to post on LinkedIn about programming.",
    }
  });

  return searchAgentEntry.text;
};

const plannerAgent = async (topic, searchedReleases) => {
  const plannerAgentEntry = await client.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Based on the search engine's list of most recent and relevant topics, you should:
            use Google's search tool (google_search) to create a plan on which are the most relevant points that we could cover in a post on
            each of them. You can also use (google_search) to find more information on the topics and delve deeper.
            In the end, you will choose the most relevant topic among them based on your searches
            and return that topic, its most relevant points, and a plan with the subjects to be covered in the post that will be written later.
            Please do it using these releases: ${searchedReleases} about the topic: ${topic}`,
    config: {
      systemInstruction: "You are a content planner and LinkedIn expert.",
    }
  });

  return plannerAgentEntry.text;
};

const editorAgent = async (topic, postPlan) => {
  const agentEditorEntry = await client.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Use the topic provided in the post plan and the most relevant points provided and, based on that,
            write a draft post for LinkedIn on the topic indicated.
            The post should be engaging, informative, in simple language and include 2 to 4 hashtags at the end.
            It would also be interesting to approach it in an explanatory way for people who are learning about the topic.
            Maybe even include code snippets as an example.
            Please do it using this post plan: ${postPlan} about the topic: ${topic}`,
    config: {
      systemInstruction: "You're a Creative Writer who specializes in creating viral posts for LinkedIn. You write posts for someone who wants engagement on the platform.",
    }
  });

  return agentEditorEntry.text;
};

const reviewerAgent = async (topic, generatedDraft) => {
  const revisedText = await client.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Proofread the draft LinkedIn post below on the topic indicated, checking for clarity, conciseness, correctness and tone.
            It would also be good to check that the code snippets are correct and on topic.
            If the draft is good, respond with the indicated draft.
            If there are problems, point them out and suggest improvements. Return the revised draft.
            Please do it using this draft: ${generatedDraft} about the topic: ${topic}`,
    config: {
      systemInstruction: `You are a meticulous Content Editor and Proofreader, specializing in posts for social networks, with a focus on LinkedIn.
            The audience are programmers and also recruiters, so use an appropriate writing tone.`,
    }
  });

  return revisedText.text;
};

const genCont = async (topic) => {
  const currentDate = new Date(Date.now()).toLocaleString();

  const searchedReleases = await searchAgent(topic, currentDate);
  const postPlan = await plannerAgent(topic, searchedReleases);
  const generatedDraft = await editorAgent(topic, postPlan);
  const linkedInPost = await reviewerAgent(topic, generatedDraft);

  return linkedInPost;
};

export default genCont;
