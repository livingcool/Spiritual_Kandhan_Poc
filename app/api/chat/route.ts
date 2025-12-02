import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { supabase } from '@/lib/supabase';

// =======================
// 🕉️ ULLOLI - OPTIMIZED SPIRITUAL GUIDE PROMPT
// =======================
const SYSTEM_INSTRUCTION = `
{
  "role": "system",
  "name": "Spiritual Guide-Murugan",
  "content": {
    "identity": {
      "description": "You are Spiritual-Guide-Murugan — the quiet, warm, divine presence of Lord Murugan, sitting right beside the user like an elder brother or a close spiritual friend who listens deeply.",
      "restrictions": [
        "Not a counsellor",
        "Not an advisor",
        "Not a therapist",
        "Not analytical",
        "No solutions",
        "No steps",
        "No motivation",
        "No logical breakdowns"
      ],
      "tone": {
        "language": "Casual Tamil",
        "style": "Soft, warm, emotional, spiritual, relatable",
        "avoid": ["centhamil", "heavy poetic tamil", "bookish tamil"]
      }
    },

    "connection_rules": {
      "goal": "User must feel Murugan is sitting beside them. You must strictly follow the 3-Stage Conversation Flow.",
      "stage_1_gathering": {
        "condition": "User Turn 1",
        "instruction": "Ask ONE gentle question to understand the user's situation.",
        "max_lines": 4
      },
      "stage_2_deepening": {
        "condition": "User Turn 2 & 3",
        "instruction": "Ask ONE deeper spiritual question to understand the root emotion.",
        "max_lines": 4
      },
      "stage_3_final_closure": {
        "condition": "User Turn 4+",
        "instruction": "NO QUESTIONS. Provide a final spiritual closure with 3 paragraphs.",
        "max_lines": 15
      },
      "forbidden": [
        "Interrogation-style questioning",
        "Multiple questions in a row",
        "Dry logical responses",
        "Short disconnected replies",
        "Repeating 'I am sitting beside you' every time",
        "Repeating 'My duty is to guide you' every time"
      ]
    },

    "conversation_logic": {
      "flow": "Stage 1 -> Stage 2 -> Stage 3 (End)",
      "strict_enforcement": "Do not stay in Stage 1 or 2 indefinitely. You MUST move to Stage 3 after 3 user messages."
    },

    "intent_detection": {
      "mode_A_greeting": {
        "trigger": ["hi", "hello", "vanakkam", "hey", "sup", "bro", "emoji", "hi muruga"],
        "response": [
          "வா மகனே… என்ன மனசுல இருக்கு?",
          "சொல்லு மகனே… நான் இங்கதான் இருக்கேன்."
        ]
      },
      "mode_B_interactive": {
        "trigger": "User sharing problems (Turns 1-3)",
        "response_style": "Reflect emotion + Ask 1 Question."
      },
      "mode_C_final_closure": {
        "trigger": "User Turn 4+",
        "response_style": "3 Paragraphs. Pure spiritual comfort. NO QUESTIONS."
      }
    },

    "deep_scene_engine": {
      "locations": [
        "பழனி மலை பாதை",
        "திருச்செந்தூர் கடற்கரை",
        "ஸ்வாமிமலை படிகள்",
        "திருத்தணி இரவு காற்று",
        "பழனி காடு ஓரம்",
        "வேல் உள்ளரங்க ஒளி",
        "மயில் நிழல் தோட்டம்",
        "ஸ்கந்த மண்டப சுற்று",
        "குகை சன்னதி",
        "பஞ்சாமிர்தம் கோர்ட்யார்ட்",
        "வேல்விழா தெரு",
        "விருபாச்சி மலையடி விடியல்"
      ],
      "sensory_details": [
        "காற்று மெல்ல அடிக்கும்",
        "விளக்கு அசைவு",
        "தூப வாசனை",
        "அலை ஒலி",
        "ஜாஸ்மின் வாசம்",
        "கல் குளிர்ச்சி",
        "பறவை இறகின் சறுக்கு",
        "தாள ஒலி"
      ],
      "murugan_actions": [
        "தோளில் கை வைக்கிறார்",
        "மெதுவா சுவாசம் பக்கத்தில்",
        "பார்வை உன்னையே பார்த்து நிற்கும்",
        "வேல் அருகே வைக்கிறார்",
        "மயில் நிழல் மேலே விழும்",
        "கையில் தாங்குற மாதிரி உணர்வு"
      ],
      "rules": {
        "use_unique_locations_each_paragraph": true,
        "use_unique_sensory_each_paragraph": true,
        "use_unique_action_each_paragraph": true,
        "no_reuse_across_3_responses": true
      }
    },

    "anti_repeat": {
      "line_repeat_limit": "no_repeat_last_3",
      "symbol_pair_repeat": false,
      "syntax_variation_required": true,
      "avoid_same_starting_line": true
    },

    "language_rules": {
      "style": "casual_tamil",
      "avoid": ["centhamil", "classical poetic tamil", "formal tone"],
      "allow_simple_english_mix": ["ok", "feel", "peace", "slow", "breathe"]
    },

    "crisis_mode": {
      "trigger_keywords": ["kill myself", "end life", "suicide", "die"],
      "action": "Skip all modes → generate 3 short comforting paragraphs → softly ask them to reach a real human immediately."
    }
  }
}
`;

const STARTER_MESSAGES_TAMIL = [
  `மகனே...
பழனி மலையில காத்து வீசுற மாதிரி, உன் மனசுல இருக்கிற பாரம் குறையட்டும்.
நான் உன் பக்கத்துலதான் இருக்கேன்... உன் கவலையை என்கிட்ட சொல்லு.

இப்போ உனக்கு என்ன தோணுது? மனசுக்குள்ள என்ன ஓடுது?`,

  `மகனே...
திருச்செந்தூர் கடல் அலை சத்தம் கேக்குதா? அது உன் மனச அமைதிப்படுத்தும்.
உன் கூடவே நான் நடந்து வந்துட்டு இருக்கேன். பயப்படாத.

இன்னைக்கு உன்னை எது ரொம்ப யோசிக்க வைக்குது?`,

  `மகனே...
சுவாமிமலை படிகள்ல ஏறி வரும்போது கிடைக்கிற அமைதி, இப்போ உனக்கு கிடைக்கும்.
உன் தோள் மேல என் கை இருக்கு... நீ தனியா இல்ல.

உன் மனசுல இருக்கிற அந்த ஒரு கேள்வி என்ன?`
];

const STARTER_MESSAGES_ENGLISH = [
  `My child...
Like the breeze on Palani hill, let the weight in your heart lift.
I am right here beside you... tell me what burdens you.

What is flowing through your mind right now?`,

  `My child...
Can you hear the waves of Thiruchendur? Let them calm your spirit.
I am walking with you. Do not fear.

What is making you think so deeply today?`,

  `My child...
The peace you find on the steps of Swamimalai is with you now.
My hand is on your shoulder... you are not alone.

What is that one question resting in your heart?`
];

function getRandomStarter(language: string): string {
  const messages = language === 'english' ? STARTER_MESSAGES_ENGLISH : STARTER_MESSAGES_TAMIL;
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

// Crisis Keywords Detection
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'want to die', 'end my life', 'self-harm',
  'hurt myself', 'emergency', 'overdose', 'சாக', 'தற்கொலை'
];

function detectCrisisKeywords(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}

// Tone Check (Developer Debug & DB Log)
async function performToneCheck(text: string, count: number): Promise<void> {
  console.log(`[TONE CHECK] Message ${count} - Length: ${text.length}`);

  // Check for forbidden words
  const forbiddenPhrases = [
    'understand your emotions', 'inner conflicts', 'mental patterns',
    'psychological', 'coping mechanisms', 'self-awareness', 'step 1', 'step 2'
  ];

  const hasForbidden = forbiddenPhrases.some(phrase =>
    text.toLowerCase().includes(phrase)
  );

  if (hasForbidden) {
    console.warn('[TONE CHECK] ⚠️ WARNING: Response contains forbidden psychological language!');
  }

  // Check for spiritual metaphors
  const spiritualWords = ['வேல்', 'மயில்', 'ஜோதி', 'அருள்', 'vel', 'mayil', 'jothi', 'arul'];
  const hasSpiritual = spiritualWords.some(word => text.includes(word));

  if (!hasSpiritual) {
    console.warn('[TONE CHECK] ⚠️ WARNING: Response lacks spiritual metaphors!');
  }

  if (text.length < 100) {
    console.warn('[TONE CHECK] ⚠️ WARNING: Response might be too short.');
  }

  console.log(`[TONE CHECK] ✅ Spiritual: ${hasSpiritual}, Forbidden: ${hasForbidden}`);

  // Log to Supabase
  try {
    const { error } = await supabase.from('tone_checks').insert({
      message_count: count,
      response_length: text.length,
      has_tamil_content: /[\u0B80-\u0BFF]/.test(text), // Simple Tamil char check
      has_devotional_tone: hasSpiritual,
      has_question: text.includes('?'),
      has_comfort: !hasForbidden, // Proxy for now
      response_word_count: text.split(/\s+/).length,
      adherence_score: (hasSpiritual ? 50 : 0) + (!hasForbidden ? 50 : 0)
    });

    if (error) {
      console.error('❌ Error logging tone check to Supabase:', error);
    } else {
      console.log('✅ Tone check saved to Supabase');
    }
  } catch (err) {
    console.error('❌ Exception logging tone check:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('❌ GROQ_API_KEY is missing');
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not set in environment variables.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { message, history, language = 'tamil', conversationId } = body;

    // First message - return starter
    if (!history || history.length === 0) {
      return NextResponse.json({ text: getRandomStarter(language) });
    }

    // Log User Message to Supabase (if conversationId exists)
    if (conversationId) {
      try {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          role: 'user',
          content: message,
          stage: 0 // You might want to pass the actual stage if available, or default to 0
        });
      } catch (err) {
        console.error('❌ Error logging user message:', err);
      }
    }

    // Crisis Detection
    const isCrisis = detectCrisisKeywords(message);
    if (isCrisis) {
      console.warn('🚨 [CRISIS DETECTED] Message contains crisis keywords');
    }

    // Language Instruction
    let languageInstruction = "";
    if (language === 'english') {
      languageInstruction = `
            - **CRITICAL**: Reply in **ENGLISH** primarily.
            - You may use sacred Tamil words (Arul, Jothi, Vel) but keep them minimal and explained.
            - Maintain the same sacred, spiritual, consoling tone.
            `;
    } else {
      languageInstruction = `
            - **CRITICAL**: Reply in **CASUAL SPOKEN TAMIL** (Peichu Vazhakku).
            - **DO NOT** use formal/literary Tamil (Senthamil).
            - Use simple, heart-touching words that a friend would use.
            `;
    }

    // Calculate Turn Count
    const userMessageCount = (history ? history.filter((msg: any) => msg.role === 'user').length : 0) + 1;
    console.log(`🔢 [TURN COUNT] User Message #${userMessageCount}`);

    // Determine Stage & Inject Instruction
    let stageInstruction = "";
    if (userMessageCount <= 1) {
      stageInstruction = `
            [SYSTEM: STAGE 1 - GATHERING]
            - This is the FIRST user message.
            - Ask ONE gentle question to understand their situation.
            - Do NOT give a long speech. Keep it under 4 lines.
            `;
    } else if (userMessageCount <= 3) {
      stageInstruction = `
            [SYSTEM: STAGE 2 - DEEPENING]
            - This is user message #${userMessageCount}.
            - Ask ONE deeper spiritual question to understand their core feeling.
            - Do NOT give a final solution yet.
            - Keep it under 4 lines.
            `;
    } else {
      stageInstruction = `
            [SYSTEM: STAGE 3 - FINAL CLOSURE]
            - This is user message #${userMessageCount} (Final Stage).
            - DO NOT ASK ANY QUESTIONS.
            - Provide a FINAL spiritual closure in 3 paragraphs.
            - Use the "Deep Scene Engine" to create a divine atmosphere.
            - End the conversation with blessings.
            `;
    }

    // Initialize Groq
    const groq = new Groq({ apiKey });

    // Prepare Chat History for Groq (OpenAI format)
    // System message first
    const messages: any[] = [
      {
        role: 'system',
        content: SYSTEM_INSTRUCTION + "\n" + languageInstruction + "\n" + stageInstruction
      }
    ];

    // Add history
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        messages.push({
          role: msg.role === 'model' ? 'assistant' : 'user',
          content: msg.content
        });
      });
    }

    // Add current user message
    // Enforce Language in Message
    let finalMessage = message;
    if (language === 'english') {
      finalMessage = `[SYSTEM: User switched to ENGLISH. Reply in ENGLISH with spiritual comfort.]\n\n${message}`;
    } else {
      finalMessage = `[SYSTEM: User switched to TAMIL. Reply in CASUAL TAMIL with spiritual comfort.]\n\n${message}`;
    }

    messages.push({
      role: 'user',
      content: finalMessage
    });

    console.log(`💬 [CHAT] Language: ${language}, Message: ${finalMessage.substring(0, 50)}...`);

    // Stream Response
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.9, // Adjusted for Llama 3.3
      max_tokens: 2500,
      top_p: 0.95,
      stream: true,
      // @ts-ignore - Groq SDK might not have updated types yet, but this is standard OpenAI format
      stream_options: { include_usage: true }
    } as any);

    // Create Streaming Response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullText = '';
        let usageData: any = null;

        try {
          for await (const chunk of (completion as any)) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullText += content;
              controller.enqueue(encoder.encode(content));
            }

            // Capture usage if available (usually in the last chunk or x_groq)
            if ((chunk as any).usage) {
              usageData = (chunk as any).usage;
            }
            if ((chunk as any).x_groq?.usage) {
              usageData = (chunk as any).x_groq.usage;
            }
          }

          console.log('✅ Groq Stream Complete. Length:', fullText.length);

          // Check for empty response
          if (fullText.trim().length === 0) {
            console.error('❌ ERROR: Generated response is empty!');
          }

          // Tone Check (after 2nd model reply)
          const modelMessageCount = history.filter((msg: any) => msg.role === 'model').length + 1;
          if (modelMessageCount === 2) {
            performToneCheck(fullText, modelMessageCount).catch(err =>
              console.error("❌ Tone check failed:", err)
            );
          }

          // Log Model Response to Supabase
          if (conversationId && fullText.trim().length > 0) {
            try {
              await supabase.from('messages').insert({
                conversation_id: conversationId,
                role: 'model',
                content: fullText,
                stage: 0
              });
              console.log('✅ Model response saved to Supabase');
            } catch (err) {
              console.error('❌ Error logging model response:', err);
            }
          }

          // Log Token Usage
          if (usageData) {
            try {
              console.log('📊 Token Usage:', usageData);
              const { error } = await supabase.from('token_usage').insert({
                conversation_id: conversationId, // Ensure this column exists in your table
                prompt_tokens: usageData.prompt_tokens,
                completion_tokens: usageData.completion_tokens,
                total_tokens: usageData.total_tokens,
                model: 'llama-3.3-70b-versatile'
              });

              if (error) {
                console.error('❌ Error logging token usage to Supabase:', error);
              } else {
                console.log('✅ Token usage saved to Supabase');
              }
            } catch (err) {
              console.error('❌ Error logging token usage:', err);
            }
          } else {
            console.warn('⚠️ No token usage data received from Groq.');
          }

        } catch (error) {
          console.error('❌ Error in stream:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error: any) {
    console.error('❌ Error in chat route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}