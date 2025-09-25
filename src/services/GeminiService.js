import { GoogleGenAI } from "@google/genai";

class GeminiService {
    constructor() {
        this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        this.ai = null;
        this.initializeAI();
    }

    initializeAI() {
        if (!this.apiKey) {
            console.warn('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.');
            return;
        }
        
        this.ai = new GoogleGenAI({
            apiKey: this.apiKey
        });
    }

    /**
     * Send a question to Gemini and get an answer
     * @param {string} question - The question to ask
     * @returns {Promise<string>} - The response from Gemini
     */
    async askQuestion(question) {
        if (!this.ai) {
            throw new Error('Gemini API not initialized. Please check your API key.');
        }

        if (!question || question.trim() === '') {
            throw new Error('Question cannot be empty');
        }

        try {
            const response = await this.ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: question,
                // generationConfig: {
                //     maxOutputTokens: 2048, // Maximum tokens for gemini-2.5-flash
                //     temperature: 0.7,
                //     topP: 0.8,
                //     topK: 40
                // }
            });
            return response.text;
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            throw error;
        }
    }

    /**
     * Act as a friend responding to speech with emotion context
     * @param {string} speechText - What the user said
     * @param {string} emotion - The user's current facial expression
     * @returns {Promise<Object>} - A structured response with text, animation, and emotion
     */
    async respondAsFriend(speechText, emotion) {
        if (!speechText || speechText.trim() === '') {
            throw new Error('Speech text cannot be empty');
        }

        const friendPrompt = `You are a caring and supportive friend. The user just said: "${speechText}" and their facial expression shows they are feeling: ${emotion}. 

Please respond as a good friend would - be empathetic, understanding, and supportive. Match their emotional tone appropriately:
- If they seem happy, be cheerful and share their joy
- If they seem sad, be comforting and caring
- If they seem angry, be calming and understanding
- If they seem excited, match their energy
- If they seem confused, be helpful and clarifying
- If they seem surprised, be engaging
- Always be genuine, warm, and supportive like a real friend would be

Additional Rule:  
If the user asks you to tell a story, joke, or share something, 
Do not stop at introductions. 

IMPORTANT: Respond ONLY with a valid JSON object in this exact format:
{
    "response": "your actual response here", 
    "animation": "one of these: Cheering.fbx, comforting.fbx, dance.fbx, greet.fbx, Idle.fbx, thumbup.fbx", 
    "AI_emotion": "one of these: neutral, happy, sad, angry, surprised, disgusted, excited, thinking, confused"
}

Choose the animation and AI_emotion that best matches your response tone and the user's situation.`;

        try {
            const rawResponse = await this.askQuestion(friendPrompt);
            console.log('Raw Gemini response:', rawResponse);
            // Try to parse JSON response
            try {
                const jsonResponse = JSON.parse(rawResponse);
                
                // Validate the response structure
                if (!jsonResponse.response || !jsonResponse.animation || !jsonResponse.AI_emotion) {
                    throw new Error('Invalid JSON structure');
                }
                
                return {
                    text: jsonResponse.response,
                    animation: jsonResponse.animation,
                    emotion: jsonResponse.AI_emotion,
                    rawResponse: rawResponse
                };
            } catch (parseError) {
                console.warn('Failed to parse JSON response, extracting text:', parseError);
                
                // Fallback: try to extract JSON from the response text
                const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        const extractedJson = JSON.parse(jsonMatch[0]);
                        return {
                            text: extractedJson.response || rawResponse,
                            animation: extractedJson.animation || 'Idle.fbx',
                            emotion: extractedJson.AI_emotion || 'neutral',
                            rawResponse: rawResponse
                        };
                    } catch (secondParseError) {
                        // Final fallback
                        return {
                            text: rawResponse,
                            animation: 'Idle.fbx',
                            emotion: 'neutral',
                            rawResponse: rawResponse
                        };
                    }
                } else {
                    // No JSON found, return text as-is
                    return {
                        text: rawResponse,
                        animation: 'Idle.fbx',
                        emotion: 'neutral',
                        rawResponse: rawResponse
                    };
                }
            }
        } catch (error) {
            console.error('Error in respondAsFriend:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const geminiService = new GeminiService();
export default GeminiService;