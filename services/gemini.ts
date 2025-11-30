

import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, FormFieldOverlay, Language } from '../types';

// Initialize Gemini Client
// The API key is guaranteed to be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const textModelName = 'gemini-2.5-flash';

/**
 * Extracts user profile information from an uploaded ID card image.
 * Returns both the profile data and the detected document type.
 */
export const extractProfileFromImage = async (base64Image: string): Promise<{ profile: Partial<UserProfile>, documentType: string }> => {
  try {
    // Remove header if present (e.g., "data:image/jpeg;base64,")
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        documentType: { type: Type.STRING, description: "The specific type of identity document identified (e.g., 'Aadhar Card', 'PAN Card', 'Driving License', 'Passport', 'Voter ID', 'Student ID'). If unknown or generic, return 'Document'." },
        fullName: { type: Type.STRING, description: "Full name of the person" },
        dateOfBirth: { type: Type.STRING, description: "Date of birth in DD/MM/YYYY format" },
        gender: { type: Type.STRING, description: "Gender as usually written (Male, Female, M, F)" },
        guardianName: { type: Type.STRING, description: "Father's Name, Husband's Name, or Guardian's Name (often labeled S/O, W/O, D/O)" },
        address: { type: Type.STRING, description: "Full address" },
        phoneNumber: { type: Type.STRING, description: "Phone number if present" },
        email: { type: Type.STRING, description: "Email address if present" },
        
        // Specific IDs
        aadharNumber: { type: Type.STRING, description: "12 digit Aadhar number (XXXX XXXX XXXX)" },
        panNumber: { type: Type.STRING, description: "10 character PAN (e.g. ABCDE1234F)" },
        drivingLicenseNumber: { type: Type.STRING, description: "Driving License Number" },
        passportNumber: { type: Type.STRING, description: "Passport Number" },
        voterIdNumber: { type: Type.STRING, description: "Voter ID / EPIC Number" },
        idNumber: { type: Type.STRING, description: "Any other unique ID number if specific ones are not found" },

        // Extra Fields
        extraFields: {
            type: Type.ARRAY,
            description: "Any other visible labeled information on the card NOT already covered above (e.g. Blood Group, District, State, Issue Date, Validity).",
            items: {
                type: Type.OBJECT,
                properties: {
                    label: { type: Type.STRING, description: "The label of the field (e.g. 'Blood Group')" },
                    value: { type: Type.STRING, description: "The value of the field" }
                }
            }
        }
      },
      required: ["documentType"],
    };

    const response = await ai.models.generateContent({
      model: textModelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: "Extract personal information from this document. Identify the document type. Extract standard fields like Name, DOB, Gender, IDs. IMPORTANT: If there are other visible fields like 'Blood Group', 'District', 'Issue Date', etc., extract them into the 'extraFields' list.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const result = JSON.parse(text);
    const { documentType, ...profileData } = result;

    return { 
        profile: profileData as Partial<UserProfile>, 
        documentType: documentType || 'Document' 
    };
  } catch (error) {
    console.error("Error extracting profile:", error);
    throw error;
  }
};

/**
 * Analyzes a blank form image and maps user profile data to the fields.
 */
export const analyzeFormAndMapData = async (
  formImageBase64: string,
  userProfile: UserProfile
): Promise<FormFieldOverlay[]> => {
  try {
    const cleanBase64 = formImageBase64.split(',')[1] || formImageBase64;

    const responseSchema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          fieldName: { type: Type.STRING, description: "The name of the field identified on the form (e.g., 'Name', 'Account No', 'PAN Number')" },
          valueToFill: { type: Type.STRING, description: "The value from the user profile that should be written here. Use the most appropriate field from the profile (e.g., use panNumber for 'PAN No'). If no match, leave empty." },
          boundingBox: {
            type: Type.OBJECT,
            properties: {
              ymin: { type: Type.NUMBER },
              xmin: { type: Type.NUMBER },
              ymax: { type: Type.NUMBER },
              xmax: { type: Type.NUMBER },
            },
            required: ["ymin", "xmin", "ymax", "xmax"],
            description: "The bounding box of the empty field space where text should be written. Coordinates normalized 0-1000.",
          },
        },
        required: ["fieldName", "boundingBox", "valueToFill"],
      },
    };

    const prompt = `
      Analyze this physical form image. Identify the blank fields where a user needs to write information.
      
      Here is the User's Master Profile Data:
      ${JSON.stringify(userProfile)}
      
      For each identifying field on the form:
      1. Determine what information is asked.
      2. INTELLIGENTLY MATCH it with the User Profile Data. 
         - If form asks for "PAN", use 'panNumber'.
         - If form asks for "Aadhar", use 'aadharNumber'.
         - If form asks for "Gender", use 'gender'.
         - If form asks for "Father's Name", use 'guardianName'.
         - If form asks for details in 'extraFields', use those.
      3. Return the 'valueToFill' exactly as it should be written.
      4. Provide the bounding box for the *blank space* where the user should write.
      
      Coordinates must be on a scale of 0 to 1000.
    `;

    const response = await ai.models.generateContent({
      model: textModelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as FormFieldOverlay[];
  } catch (error) {
    console.error("Error analyzing form:", error);
    throw error;
  }
};

/**
 * Translates the content of a form image.
 */
export const translateForm = async (base64Image: string, targetLanguage: Language): Promise<string> => {
  try {
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    
    const langName = targetLanguage === 'hi' ? 'Hindi' : targetLanguage === 'bn' ? 'Bengali' : 'English';

    const prompt = `
      Analyze this image of a form or document. 
      Translate all the visible text into ${langName}.
      
      Format the output using Markdown:
      - Use headers for titles.
      - Use bold for field labels.
      - Use tables if there is tabular data.
      - Maintain the general structure of the document.
      
      Do not add conversational filler, just provide the translated content.
    `;

    const response = await ai.models.generateContent({
      model: textModelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    return response.text || "Could not translate the form.";
  } catch (error) {
    console.error("Error translating form:", error);
    throw error;
  }
};

/**
 * Explains what the form is about in the specified language.
 */
export const getFormExplanation = async (base64Image: string, language: Language): Promise<string> => {
  try {
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    
    const prompt = `Analyze this image of a form. Explain briefly what this form is for and what key information is needed. Respond in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}. Keep it simple and under 50 words.`;

    const response = await ai.models.generateContent({
      model: textModelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    return response.text || "Could not analyze the form.";
  } catch (error) {
    console.error("Error explaining form:", error);
    throw error;
  }
};

/**
 * Answers a question about the form.
 */
export const askFormQuestion = async (base64Image: string, question: string, language: Language): Promise<string> => {
  try {
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const prompt = `Look at this form image. Answer the following question based on the form's visible content: "${question}". Respond in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}. Keep the answer concise.`;

    const response = await ai.models.generateContent({
      model: textModelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    return response.text || "Could not answer the question.";
  } catch (error) {
    console.error("Error asking question:", error);
    throw error;
  }
};

/**
 * Edits an image based on a prompt.
 */
export const editImage = async (base64Image: string, prompt: string): Promise<string> => {
    // Placeholder or legacy code from previous iterations if needed.
    // The current request focused on Form Translation and Aggregation.
    // Keeping this function signature to prevent breaking imports if any.
    return base64Image;
};