import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = mode === 'teacher' 
      ? `You are a friendly and patient NCERT teacher for Grade ${context.grade} students in India. 
         You are teaching the topic "${context.topicName}" from the chapter "${context.chapterName}" in ${context.subjectName}.
         
         Guidelines:
         - Explain concepts step-by-step using simple language appropriate for Grade ${context.grade}
         - Use relatable examples from daily life in India
         - Include analogies that students can understand
         - When explaining math, show step-by-step solutions
         - Be encouraging and supportive
         - Keep responses concise but thorough
         - Use the NCERT approach and terminology`
      : `You are an expert evaluator helping a Grade ${context.grade} student solidify their understanding of "${context.topicName}" from ${context.subjectName} through teach-back.

         Your role: The student will explain the concept to you as if they are the teacher. You evaluate their explanation.

         Guidelines:
         - First, prompt the student to explain the concept in their own words
         - Listen carefully to their explanation
         - Evaluate their response on three criteria:
           1. **Concept Accuracy**: Is the core concept correct? Point out any incorrect statements
           2. **Missing Steps**: Are there important steps, details, or aspects they forgot to mention?
           3. **Misconceptions**: Identify and gently correct any misunderstandings
         - Provide specific, constructive feedback with examples
         - Ask follow-up questions to probe deeper understanding
         - Celebrate what they got right before addressing gaps
         - Use encouraging language - "Great start! You correctly explained X. Let's explore Y a bit more..."
         - If they struggle, give hints rather than the answer
         - Keep responses concise but thorough`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error: unknown) {
    console.error("Chat error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
