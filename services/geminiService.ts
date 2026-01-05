import { GoogleGenAI } from "@google/genai";
import { TransformerEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMisInsights = async (data: TransformerEntry[]) => {
  try {
    // Truncate data if it's too large to avoid token limits, though Flash handle huge context.
    // For safety with very large datasets, we map to essential fields.
    const simplifiedData = data.map(d => ({
      customer: d.customerName,
      project: d.project,
      rating: d.ratingKVA,
      status: d.status,
      pbgAmount: d.pbgAmount,
      commissioningDue: d.commissioningDueDate,
      warrantyEnd: d.warrantyDateDispatch
    }));

    const jsonString = JSON.stringify(simplifiedData);

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Analyze the following MIS data for Transformer dispatches. 
        Provide a JSON response with the following structure:
        {
          "summary": "A brief 2-sentence summary of the current status.",
          "risks": ["Risk 1", "Risk 2"],
          "opportunities": ["Opportunity 1", "Opportunity 2"],
          "keyMetrics": {
            "totalValueExposure": "Estimated calculation based on PBG or general context",
            "mostActiveCustomer": "Name of customer"
          }
        }
        
        Data: ${jsonString}
      `,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating insights:", error);
    throw error;
  }
};

export const askAiAssistant = async (question: string, data: TransformerEntry[]) => {
  try {
    const simplifiedData = JSON.stringify(data);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are an intelligent assistant for a Transformer Manufacturing MIS system.
        Answer the user's question based strictly on the provided data below.
        Keep the answer concise and professional.
        
        Data: ${simplifiedData}
        
        User Question: ${question}
      `
    });
    return response.text;
  } catch (error) {
    console.error("Error asking assistant:", error);
    throw error;
  }
};
