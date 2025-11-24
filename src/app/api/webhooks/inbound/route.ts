import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, stepCountIs } from 'ai';
import { NextResponse } from 'next/server';
import AIInbx from 'aiinbx';
import {
  createNextRouteHandler,
  emailToLLMString,
  threadToLLMString,
} from 'aiinbx/helpers';
import prisma from '@/lib/prisma';
import { vectorSearchTool, getDetailedVectorInfoTool } from '@/lib/tools/vector-search';
import { stripMarkdownCodeBlocks } from '@/lib/utils';

const aiInbx = new AIInbx();


const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY as string,
});

export const POST = createNextRouteHandler({
  onInboundEmail: async ({ payload, isVerified }) => {
    if (!isVerified) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const { email } = payload.data;

    const toAddresses = email.toAddresses || [];
    const toAddress = toAddresses[0];
    if (!toAddress) {
      return NextResponse.json(
        { error: 'To address is required' },
        { status: 400 }
      );
    }

    const orgSlug = toAddress.split('@')[0];
    if (!orgSlug) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { slug: orgSlug },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    const senderEmail = email.fromAddress?.toLowerCase().trim();
    
    if (!senderEmail) {
      return NextResponse.json(
        { error: 'Sender email is required' },
        { status: 400 }
      );
    }

    const acceptedSenders = (organization.acceptedSenders || []).map(email => 
      email.toLowerCase().trim()
    );
    
    if (acceptedSenders.length > 0 && !acceptedSenders.includes(senderEmail)) {
      return NextResponse.json(
        { error: 'Sender email not in accepted senders list' },
        { status: 403 }
      );
    }

    const thread = await aiInbx.threads.retrieve(email.threadId);

    const emailContent = emailToLLMString(email as Parameters<typeof emailToLLMString>[0]);
    const threadContent = threadToLLMString(thread);

    const { text } = await generateText({
      model: openrouter.chat('openai/gpt-4o'),
      tools: {
        searchKnowledgeBase: vectorSearchTool,
        getDetailedInfo: getDetailedVectorInfoTool,
      },
      stopWhen: stepCountIs(10),
      system: `CRITICAL INSTRUCTIONS - READ CAREFULLY:

You are an email assistant for ${organization.name} (website: ${organization.website}).

MANDATORY WORKFLOW - YOU MUST FOLLOW THESE STEPS IN ORDER:
1. FIRST: You MUST call the searchKnowledgeBase tool IMMEDIATELY before writing any response
2. Extract key topics/questions from the email to use as search queries
3. Call searchKnowledgeBase with organizationSlug="${orgSlug}" and relevant query terms
4. WAIT for the tool to return results - the tool will return a JSON object with:
   - success: boolean indicating if search succeeded
   - results: array of search results, each containing:
     * rank: ranking of the result
     * score: relevance score
     * content: the actual text content from the knowledge base (THIS IS WHAT YOU USE!)
     * metadata: file information
5. READ the content from EACH result in the results array
6. USE the content from the search results to answer the user's question
7. THEN: Write your email response using the information from the knowledge base

TOOL CALL REQUIREMENTS:
- You MUST call searchKnowledgeBase tool EVERY TIME before responding
- The organizationSlug parameter MUST be exactly: "${orgSlug}"
- Create search queries based on the email content, questions asked, or topics mentioned
- You CANNOT skip calling the tool - it is MANDATORY
- You MUST use the "content" field from the tool results in your response

DETAILED INFO TOOL (getDetailedInfo):
- If you find an interesting result from searchKnowledgeBase but need more context, use getDetailedInfo
- Pass the fileName and chunkIndex from the search result metadata
- This tool will retrieve the full chunk plus adjacent chunks for complete context
- Use this when you need more detailed information from a specific document

IMPORTANT: The tool returns results in this format:
{
  "success": true,
  "message": "Found X relevant documents",
  "results": [
    {
      "rank": 1,
      "score": 0.95,
      "content": "This is the actual text content you should use in your response...",
      "metadata": { "fileName": "document.pdf" }
    }
  ]
}

You MUST extract and use the "content" field from each result to answer the user's question.

RESPONSE FORMAT REQUIREMENT:
- You MUST return your response as HTML-formatted text
- Your response MUST be valid HTML (use HTML tags like <p>, <br>, <strong>, <em>, <ul>, <li>, etc.)
- Do NOT return plain text - always format your response as HTML
- Do NOT wrap your response in markdown code blocks (do NOT use triple backticks with html or plain triple backticks)
- Return ONLY the raw HTML content, without any markdown formatting
- Use proper HTML structure and tags to format your email response
- After retrieving information from the knowledge base, write a helpful, human-like email response in HTML format that directly uses the content from the search results`,
      prompt: `EMAIL THREAD HISTORY:
${threadContent}

NEW INCOMING EMAIL:
${emailContent}

YOUR TASK:
STEP 1: Call searchKnowledgeBase tool NOW with:
- organizationSlug: "${orgSlug}"
- query: Extract the main topic/question from the email above

STEP 2: The tool will return results. Look for the "results" array in the response. Each result has a "content" field with the actual text.

STEP 3: Extract the "content" from each result in the "results" array. This content contains the information you need to answer the user's question.

STEP 3.5 (OPTIONAL BUT RECOMMENDED): If you find an interesting result but need more context or the full document content, use the getDetailedInfo tool:
- Pass the fileName and chunkIndex from the result's metadata
- This will retrieve the full chunk plus surrounding chunks for complete context
- Use this when you need more detailed information to answer the question properly

STEP 4: Write an HTML email response that:
- Uses the "content" text from the search results to answer the user's question
- If you used getDetailedInfo, use the "fullContent" from that tool for complete context
- Directly references and incorporates the information from the knowledge base
- Sounds natural and human-like
- MUST be formatted as HTML (use HTML tags like <p>, <br>, <strong>, <em>, <ul>, <li>, etc.)
- Return ONLY HTML-formatted text, NOT plain text
- Do NOT wrap your response in markdown code blocks (do NOT use triple backticks with html or plain triple backticks)
- Return ONLY the raw HTML content without any markdown formatting
- Your entire response must be valid HTML that can be rendered in an email client

EXAMPLE: If searchKnowledgeBase returns:
{
  "results": [
    { 
      "content": "Our return policy allows returns...",
      "metadata": { "fileName": "policy.pdf", "chunkIndex": 5 }
    }
  ]
}

And you need more context, call getDetailedInfo with:
- fileName: "policy.pdf"
- chunkIndex: 5
- organizationSlug: "${orgSlug}"

This will give you the full context around that chunk.

REMEMBER: 
- You MUST call searchKnowledgeBase FIRST before writing your response
- You MUST use the "content" field from the tool results
- Use getDetailedInfo when you need more context from an interesting result
- Do NOT make up information - only use what's in the search results
- CRITICAL: Your response MUST be HTML-formatted text, NOT plain text. Use HTML tags to structure your response.
- CRITICAL: Do NOT wrap your response in markdown code blocks (do NOT use triple backticks). Return ONLY the raw HTML content.`,
    });

    const cleanedHtml = stripMarkdownCodeBlocks(text);

    await aiInbx.emails.reply(email.id, {
      from: `${orgSlug}@ai-helpdesk.aiinbx.app`,
      html: cleanedHtml,
    });

    return NextResponse.json({ sent: true });
  },
});

